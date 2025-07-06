const { check, validationResult } = require('express-validator')
//FUNCION PARA DECTECTAR LAS LETRAS DEPENDIENDO DEL ABECEDARIO
const hasConsecutiveLetters = (value) => {
    const lower = value.toLowerCase()
    for (let i = 0; i < lower.length - 1; i++) {
        if (/[a-z]/.test(lower[i]) && lower.charCodeAt(i + 1) === lower.charCodeAt(i) + 1) {
            return true
        }
    }
    return false
}

// Función para detectar números consecutivos
const hasConsecutiveNumbers = (value) => {
    for (let i = 0; i < value.length - 1; i++) {
        if (/\d/.test(value[i]) && parseInt(value[i + 1]) === parseInt(value[i]) + 1) {
            return true
        }
    }
    return false
}


// MIDDLEWARES DE VALIDACIÓN
const validateUserRegistration = [
    check('nombre')
        .notEmpty().withMessage('El Nombre Es Obligatorio')
        .isLength({ min: 3 }).withMessage('El Nombre Debe Tener Al Menos 3 Caracteres'),

    check('email')
        .notEmpty().withMessage('El Email Es Obligatorio')
        .isEmail().withMessage('Debe Ser Un Email Válido'),

    check('password')
        .notEmpty().withMessage('La Contraseña Es Obligatoria')
        .isLength({ min: 8 }).withMessage('La Contraseña Debe Tener Al Menos 8 Caracteres')
        .matches(/[A-Z]/).withMessage('La Contraseña Debe Contener Al Menos Una Letra Mayúscula')
        .matches(/[a-z]/).withMessage('La Contraseña Debe Contener Al Menos Una Letra Minúscula')
        .matches(/\d/).withMessage('La Contraseña Debe Contener Al Menos Un Número')
        .matches(/[^A-Za-z0-9]/).withMessage('La Contraseña Debe Contener Al Menos Un Carácter Especial')
        .custom(value => {
            if (hasConsecutiveNumbers(value)) {
                throw new Error('La Contraseña No Debe Contener Números Consecutivos')
            }
            if (hasConsecutiveLetters(value)) {
                throw new Error('La Contraseña No Debe Contener Letras Consecutivas')
            }
            return true
        }),


    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() })
        }
        next()
    }
]

const validateUserLogin = [
    check('email')
        .isEmail().withMessage('Debe Ser Un Email Válido')
        .normalizeEmail(),

    check('password')
        .isLength({ min: 8 }).withMessage('La Contraseña Debe Tener Al Menos 8 Caracteres')
        .matches(/\d/).withMessage('La Contraseña Debe Contener Al Menos Un Número'),

    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() })
        }
        next()
    }
]

module.exports = {
    validateUserRegistration,
    validateUserLogin
}