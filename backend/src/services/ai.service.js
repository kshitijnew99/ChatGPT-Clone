const { GoogleGenAI } = require("@google/genai");

let aiClient = null

function getAIClient() {
  if (aiClient) return aiClient
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  try {
    aiClient = new GoogleGenAI({ apiKey: key })
    return aiClient
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err.message)
    return null
  }
}

async function generateResponse(contentArr) {
    try {
        const client = getAIClient()
        if (!client) {
            // Graceful fallback when API key is not set in environment
            console.warn('GEMINI_API_KEY not provided — returning fallback response')
            return 'AI service unavailable (server not configured). Please try again later.'
        }

        // Convert {role, text} to Gemini format {role, parts: [{text}]}
        const formattedContents = contentArr.map(item => ({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.text }]
        }));

        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: formattedContents,
            config : {
                temperature: 0.7
            }
        });
        return response.text;
        
    } catch (error) {
        console.error('AI generation error:', error.message || error)
        return 'AI service error: unable to generate response at this time.'
    }
}


async function generateVector(content){
    try {
        const client = getAIClient()
        if (!client) {
            throw new Error('GEMINI_API_KEY not configured — cannot generate embeddings')
        }

        const response = await client.models.embedContent({
            model: 'text-embedding-004',
            contents: content,
            config : {
                outputDimensionality: 768
            }
        });

        return response.embeddings[0].values;

    } catch (error) {
        console.error("Vector generation failed:", error.message || error)
        throw error; // Re-throw to handle in calling function
    }
}

module.exports = { 
    generateResponse,
    generateVector
};