const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')



router.post('/register', authController.RegisterUser)
router.post('/login',authController.LoginUser)


module.exports = router