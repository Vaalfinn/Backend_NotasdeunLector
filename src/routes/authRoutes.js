/* AUTH ROUTE */
const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const {
    validateUserRegistration,
    validateUserLogin
} = require('../validators/userValidator')

router
    .post('/register', validateUserRegistration, authController.registerUser)
    .post('/login', validateUserLogin, authController.loginUser)
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