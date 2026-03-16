const mongoose = require("mongoose")


async function connectDB(){
    
    try {
        await mongoose.connect(process.env.mongoDB)
        console.log("Connected to DB");
    } catch (error) {
        console.log("error connecting to DataBase:", error);
    }
    
}


module.exports = connectDB;