/* AUTH MIDDLEWARE */
const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')

const authMiddleware = async (req, res, next) => {
    try {
        // Obtener el token del headers
        const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Acceso Denegado, Token Requerido.'
            })
        }

        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await UserModel.findById(decoded.id)
        // Agregar la información del usuario decodificada a la request
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            })
        }
        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token Invalido',
            error: error.message
        })
    }
}

module.exports = authMiddleware