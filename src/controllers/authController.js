/* AUTH CONTROLLER */
const authProcess = require('../processes/authProcess')
const jwt = require('jsonwebtoken')

/* AUTHENTICATION */
// REGISTER USER CON CONTRASEÑA HASHEADA
const registerUser = async (req, res) => {
    try {
        const { nombre, email, password } = req.body

        // Validar datos obligatorios
        if (!nombre || !email || !password) {
            return res.status(400).json({ success: false, message: 'Todos Los Campos Son Obligatorios' })
        }

        // Registrar usuario
        const user = await authProcess.registerUser(nombre, email, password)

        res.status(201).json({ success: true, message: 'Usuario Registrado', user })
    } catch (error) {
        console.error('Error Al Registrar El Usuario:', error)
        res.status(400).json({ success: false, message: 'Error Interno Del Servidor' })
    }
}

// LOGIN USER
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        // Validar datos obligatorios
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Correo y Contraseña Son Obligatorios' })
        }

        // Obtener usuario autenticado
        const user = await authProcess.loginUser(email, password)

        // Generar token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

        res.status(200).json({ success: true, message: 'Inicio De Sesión Exitoso', token, user })
    } catch (error) {
        console.error('Error Al Iniciar Sesión:', error)

        // Si el error es de autenticación, enviamos 401
        if (error.message === 'El Usuario No Existe' || error.message === 'Contraseña Incorrecta') {
            return res.status(401).json({ success: false, message: error.message })
        }

        res.status(500).json({ success: false, message: 'Error Interno Del Servidor' })
    }
}

// ENVIAR CÓDIGO DE VERIFICACIÓN
const sendVerificationCode = async (req, res, next) => {
    try {
        const { email } = req.body

        if (!email) {
            res.status(400).json({ succes: false, message: 'El Email Es Requerido' })
        }

        await authProcess.sendVerificationCode(email)

        res.status(200).json({
            success: true,
            message: 'Código De Verificación Enviado Exitosamente'
        })
    } catch (error) {
        next(error)
    }
}

// VERIFICAR CÓDIGO
const verifyCode = async (req, res, next) => {
    try {
        const { email, code } = req.body

        if (!email || !code) {
            res.status(400).json({ succes: false, message: 'Email Y Código Son Requeridos' })
        }

        await authProcess.verifyCode(email, code)

        res.status(200).json({
            success: true,
            message: 'Cuenta Verificada Exitosamente'
        })
    } catch (error) {
        next(error)
    }
}

// SOLICITAR RESTABLECIMIENTO DE CONTRASEÑA
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body
        const response = await authProcess.requestPasswordReset(email)
        res.status(200).json(response)
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
}

// RESTABLECER CONTRASEÑA
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params
        const { newPassword } = req.body // Solo obtener newPassword del body

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña es requerida'
            })
        }

        const response = await authProcess.resetPassword(token, newPassword)
        res.status(200).json(response)
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
}

module.exports = {
    registerUser,
    loginUser,
    sendVerificationCode,
    verifyCode,
    requestPasswordReset,
    resetPassword
}