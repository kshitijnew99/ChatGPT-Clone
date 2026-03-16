const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors');
const path = require('path')


/* Routes */
const authRoutes = require("./routes/auth.routes")
const chatRoutes = require("./routes/chat.routes")

/* Middleware */
const app = express();
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}))
app.use(express.static(path.join(__dirname, '../public')))


/* Using Routes */
app.use('/auth',authRoutes)
app.use('/chat',chatRoutes)


app.get(/.*/,(req,res)=>{
    res.sendFile(path.join(__dirname,'../public/index.html'))
})


module.exports = app