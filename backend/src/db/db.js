const mongoose = require("mongoose")


async function connectDB(){
    
    try {
        // Support both MONGODB_URI (recommended) and mongoDB (legacy) env var names
        const uri = process.env.MONGODB_URI || process.env.mongoDB
        if (!uri) {
            console.warn('No MongoDB URI provided in environment (MONGODB_URI). Skipping DB connection.');
            return;
        }
        await mongoose.connect(uri)
        console.log("Connected to DB");
    } catch (error) {
        console.log("error connecting to DataBase:", error);
    }
    
}


module.exports = connectDB;