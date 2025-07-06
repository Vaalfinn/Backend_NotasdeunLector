/* AUTH ROUTE */
const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const authController = require('../controllers/userController')
const validation = require('../middlewares/validator')
const { loginUser, verifyMfaCode, updatePassword } = require('../services/authService')

router
    .post('/register', validation.validateUserRegistration, authController.registerUser)
    .post('/login', validation.validateUserLogin, authController.loginUser)
    .post('/send-verification-code', authController.sendVerificationCode)
    .post('/verify-code', authController.verifyCode)
    .post('/request-password-reset', authController.requestPasswordReset)
    .post('/reset-password/:token', authController.resetPassword)

// LOGIN USER
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const result = await loginUser(email, password)
        res.cookie('token', result.token, { httpOnly: true, secure: true })
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

// VERIFICAR CÓDIGO MFA
router.post('/verify-mfa', async (req, res) => {
    try {
        const { email, code } = req.body
        const result = await verifyMfaCode(email, code)
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

// ACTUALIZAR CONTRASEÑA
router.post('/update-password', async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body
        const result = await updatePassword(userId, currentPassword, newPassword)
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

module.exports = router