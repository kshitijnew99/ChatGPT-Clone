const chatModel = require("../models/chat.models")
const messageModel = require("../models/message.models")
const mongoose = require("mongoose")

async function createChat(req,res){
    const {title} = req.body;
    const user = req.user;

    const chat = await chatModel.create({
        user : user._id,
        title
    })

    res.status(201).json({
        message : "Chat created Succesfully",
        chat:{
            _id : chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user : chat.user

        }
    });
}


async function getChats(req,res){
    const user = req.user;

    const chats = await chatModel.find({user : user._id});

    res.status(200).json({
        message : "Chats fetched Succesfully",
        chats: chats.map(chat => ({
            _id : chat._id,
            title: chat.title,  
            lastActivity: chat.lastActivity,
            user : chat.user,
            name : chat.user.fullName
        }))
    }); 
}

async function getMessages(req, res) {
    try {
        const user = req.user;
        const { chatId } = req.params;

        // Convert chatId to ObjectId
        const chatObjectId = new mongoose.Types.ObjectId(chatId);

        // Verify the chat belongs to the user
        const chat = await chatModel.findOne({
            _id: chatObjectId,
            user: user._id
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found or unauthorized"
            });
        }

        // Fetch messages for this chat, sorted by creation time
        const messages = await messageModel.find({
            chatId: chatObjectId
        }).sort({ createdAt: 1 }).lean();

        res.status(200).json({
            message: "Messages fetched successfully",
            messages: messages.map(msg => ({
                id: msg._id,
                role: msg.role,
                content: msg.content,
                createdAt: msg.createdAt
            }))
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({
            message: "Failed to fetch messages",
            error: error.message
        });
    }
}

module.exports = {createChat, getChats, getMessages}