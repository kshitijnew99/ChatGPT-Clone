const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    chatId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "chat"
    },
    content : {
        type : String,
        required : true
    },
    role : {
        type : String,
        enum : ["user", "model", "system"], // enum restricts the role to only take value that are present in the enum
        default : "user"
    }
},{
    timestamps : true
})

const messageModel = mongoose.model("message", messageSchema);

module.exports = messageModel;