const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors');
const path = require('path');



/* Routes */
const authRoutes = require("./routes/auth.routes")
const chatRoutes = require("./routes/chat.routes")

/* Middleware */
const app = express();
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../public')));



// Allow configuring frontend origin via environment variable for deployments
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173'
app.use(cors({
        origin: FRONTEND_ORIGIN,
        credentials: true
}))

// Basic health route so GET / returns a friendly message (useful on Render)
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'ChatGPT-Clone Backend' })
})

/* Using Routes */
app.use('/auth',authRoutes)
app.use('/chat',chatRoutes)


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app