const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function generateResponse(contentArr) {
    try {
        // Convert {role, text} to Gemini format {role, parts: [{text}]}
        const formattedContents = contentArr.map(item => ({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.text }]
        }));

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: formattedContents,
            config : {
                temperature: 0.7
            }
        });
        return response.text;
        
    } catch (error) {
        throw new Error(error.message || "AI service error");
    }
}


async function generateVector(content){
    try {
        // console.log("Generating vector for content:", content.substring(0, 50) + "...");

        const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: content,
        config : {
            outputDimensionality: 768
        }
    });

    // console.log("Vector generated successfully, length:", response.embeddings[0].values.length);

    return response.embeddings[0].values;

    } catch (error) {
        console.error("Vector generation failed:", error.message);
        throw error; // Re-throw to handle in calling function
    }
}

module.exports = { 
    generateResponse,
    generateVector
};