
const { Pinecone } =  require('@pinecone-database/pinecone')

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Create a dense index with integrated embedding

const ChatgptCloneIndex = pc.Index('chatgpt-clone');


async function createVectorMemory({vector,messageId,metadata}){
    try {
        
        await ChatgptCloneIndex.upsert([{
            id: messageId.toString(),
            values: vector,
            metadata: metadata
        }]);
        
        console.log("Successfully stored in Pinecone");
    } catch (error) {
        console.error("Pinecone upsert error:", error.message);
        throw error;
    }
}


async function queryMemory({queryVector, limit = 5 ,metadata}){

    const data = await ChatgptCloneIndex.query({
        vector:queryVector,
        topK:limit,
        includeMetadata:true,
        filter:metadata ? metadata : undefined
    })

    return data.matches;
}


module.exports = {
    createVectorMemory,
    queryMemory
}