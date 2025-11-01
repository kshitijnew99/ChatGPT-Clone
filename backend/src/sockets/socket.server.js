const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userModel = require("../models/user.models");
const { generateResponse, generateVector } = require("../services/ai.service");
const messageModel = require("../models/message.models");
const { createVectorMemory, queryMemory } = require("../services/vector.service");



function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin : process.env.FRONTEND_URL || "http://localhost:5173",
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true
    }
  });

  // socket.io middleware
  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
    /*cookie is need to extract the cookie from the token
         give in the header from the postman*/

    if (!cookies.token) {
      return next(new Error("Authentication error : no token provider"));
    }

    try {
      const secret = process.env.JWT_SECRET || process.env.JWT_TOKEN
      if (!secret) {
        return next(new Error('Authentication error: server missing JWT secret'))
      }
      const decode = jwt.verify(cookies.token, secret);

      const user = await userModel.findById(decode.id);

      socket.user = user;

      next();
    } catch (error) {
      return next(new Error("Authentication error : Invalid Token"));
    }
  });

  // socket.io starting server
  io.on("connection", (socket) => {

    
    

    socket.on("ai-message", async (MessagePayload) => {
      
      // Convert chatId string to ObjectId for MongoDB queries
      const chatObjectId = new mongoose.Types.ObjectId(MessagePayload.chatId);
      
      // SEQUENCE: 1 2  (parallel execution)
      const [message, vector] = await Promise.all([
        // Task 1: User message save to DB
        messageModel.create({
          chatId: chatObjectId,
          user: socket.user._id,
          content: MessagePayload.content,
          role: "user",
        }),
        // Task 2: Generate vector for user message
        generateVector(MessagePayload.content),
        
      ]);
      
      // Task 4: Save user message in pinecone (can run with 1&2 since it only needs the results)
      await createVectorMemory({
          vector,
          messageId: message._id,
          metadata: {
            chatId: MessagePayload.chatId,
            user: socket.user._id.toString(),
            text: MessagePayload.content
          }
      })

      // SEQUENCE: 3 5 (parallel execution)
      const [memory, chatHistoryRow] = await Promise.all([
        // Task 3: Query pinecone for related memories from OTHER chats
        queryMemory({
          queryVector: vector,
          limit: 5, // Retrieve top 5 relevant memories for better context
          metadata: {
            user: socket.user._id.toString()
            // Note: We search across ALL user's chats; will filter out current chat below
          }
        }),
        // Task 5: Get chat history from DB - use ObjectId for query
        messageModel.find({
          chatId: chatObjectId,
        }).sort({ createdAt: 1 }).limit(20).lean()
      ]);

      console.log("🔍 Chat History Debug:");
      console.log("  Looking for chatId:", MessagePayload.chatId);
      console.log("  Found messages:", chatHistoryRow.length);
      console.log("  Message chatIds:", chatHistoryRow.map(m => m.chatId));

      // chatHistoryRow is already sorted oldest-first (createdAt: 1), keep it that way
      const stm = chatHistoryRow.map(item => ({
        role: item.role,
        text: item.content
      }));

      // Filter LTM: exclude memories from current chat (they're already in STM)
      const relevantMemories = memory.filter(m => m.metadata.chatId !== MessagePayload.chatId);
      
      // Build context from long-term memory (past conversations from OTHER chats)
      const ltm = relevantMemories.length > 0 ? [{
        role: "user",
        text: `[System Context: Information from your previous conversations with this user]\n${relevantMemories.map((item, idx) => `${idx + 1}. ${item.metadata.text}`).join("\n")}`
      }] : [];

      console.log("🧠 Memory Debug:");
      console.log("  Total memories found:", memory.length);
      console.log("  Relevant memories (from other chats):", relevantMemories.length);
      console.log("  LTM context:", JSON.stringify(ltm, null, 2));
      console.log("  STM count:", stm.length, "messages from current chat");

      // SEQUENCE: 6 (sequential execution)
      // Task 6: Generate response from AI
      const combinedPrompt = [...ltm, ...stm];
      console.log("📤 Sending to Gemini:", JSON.stringify(combinedPrompt, null, 2));
      const aiResponse = await generateResponse(combinedPrompt);

      // SEQUENCE: 10 (sequential execution)
      // Task 10: Send/emit AI response to user
      socket.emit("ai-response", {
        content: aiResponse,
        chat: MessagePayload.chatId,
      });

      console.log("Generated AI Response:", aiResponse);

      // SEQUENCE: 7 8 (parallel execution)
      const [responseMessage, responseVector] = await Promise.all([
        // Task 7: Save AI response in DB
        messageModel.create({
          chatId: chatObjectId,
          user: socket.user._id,
          content: aiResponse,
          role: "model",
        }),
        // Task 8: Generate vector from AI response
        generateVector(aiResponse)
      ]);

      // SEQUENCE: 9 (sequential execution)
      // Task 9: Save AI message in PineCone
      await createVectorMemory({
        vector: responseVector,
        messageId: responseMessage._id,
        metadata: {
          chatId: MessagePayload.chatId,
          user: socket.user._id.toString(),
          text: aiResponse
        }
      });
              
    });
  });
}

module.exports = initSocketServer;
