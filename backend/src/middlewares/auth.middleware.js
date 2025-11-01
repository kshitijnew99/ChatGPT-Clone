const userModel = require('../models/user.models')
const jwt = require("jsonwebtoken")


async function authUser(req,res,next){
    const {token} = req.cookies;

    if(!token){
        return res.status(401).json({ message : "token not found"})
    }

    try {
        const secret = process.env.JWT_SECRET || process.env.JWT_TOKEN
        if (!secret) {
            return res.status(500).json({ message: 'Server misconfiguration: JWT secret missing' })
        }

        const decode = jwt.verify(token , secret)

        const user =  await userModel.findById(decode.id)

        req.user = user

        next();

    } catch (error) {
        res.status(401).json({ message : "Unauthorized access "})   
    }
}

module.exports = {authUser}