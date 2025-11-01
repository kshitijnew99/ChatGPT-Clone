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

// Defensive: wrap router/app registration to catch invalid route patterns
// This prevents path-to-regexp from crashing the process during startup
;(function wrapExpressRegistration() {
    try {
        const methods = ['use','get','post','put','delete','patch','all','options','head']

        // Wrap app methods
        methods.forEach((m) => {
            if (typeof app[m] === 'function') {
                const orig = app[m].bind(app)
                app[m] = function (...args) {
                    try {
                        return orig(...args)
                    } catch (err) {
                        console.error(`Route registration error on app.${m} with args:`, args, '\nError:', err && err.message)
                        // swallow error to allow server to continue starting; route will be skipped
                        return app
                    }
                }
            }
        })

        // Wrap Router factory so routers returned have wrapped methods too
        const originalRouter = express.Router
        express.Router = function (...args) {
            const router = originalRouter(...args)
            methods.forEach((m) => {
                if (typeof router[m] === 'function') {
                    const orig = router[m].bind(router)
                    router[m] = function (...args) {
                        try {
                            return orig(...args)
                        } catch (err) {
                            console.error(`Route registration error on router.${m} with args:`, args, '\nError:', err && err.message)
                            return router
                        }
                    }
                }
            })
            return router
        }
    } catch (e) {
        console.warn('Failed to apply Express registration wrappers:', e && e.message)
    }
})()



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