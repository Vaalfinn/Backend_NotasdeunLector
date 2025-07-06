const jwt = require('jsonwebtoken')
const UserModel = require('../models/userModel')

// Middleware para verificar rol
const checkRole = (roles) => {
    return (req, res, next) => {
        const user = req.user

        if (!user || !roles.includes(user.rol)) {
            return res.status(403).json({
                message: 'No tienes pemiso para realizar esta accion (rol)'
            })
        }
        next()
    }
}
// Middleware para verificar permisos específicos
const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        const user = req.user

        if (!user || user.hasPermission(requiredPermission)) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. No tienes permiso sufuciente'
            })
        }
        next()
    }
}


module.exports = { checkRole, checkPermission }
