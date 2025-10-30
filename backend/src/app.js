const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors');


/* Routes */
const authRoutes = require("./routes/auth.routes")
const chatRoutes = require("./routes/chat.routes")

/* Middleware */
const app = express();
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

/* Using Routes */
app.use('/auth',authRoutes)
app.use('/chat',chatRoutes)



module.exports = app