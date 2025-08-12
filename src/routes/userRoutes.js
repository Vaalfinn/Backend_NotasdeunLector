const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const validation = require('../validators/userValidator')
const { checkRole, checkPermission } = require('../middlewares/rolMiddleware')
const authMiddleware = require('../middlewares/authMiddleware')

// Obtener todos los usuarios (solo ADMIN o CLIENTE con permiso READ_USER)
router.get('/usuarios',
    authMiddleware,
    checkRole(['ADMIN', 'CLIENTE']),
    checkPermission('READ_USER'),
    userController.getAllUsers
)

// Obtener un usuario por ID (solo ADMIN o CLIENTE con permiso READ_USER)
router.get('/usuario/:id',
    authMiddleware,
    checkRole(['ADMIN', 'CLIENTE']),
    checkPermission('READ_USER'),
    userController.getOneUser
)

// Crear un usuario (solo ADMIN)
router.post('/usuario',
    authMiddleware,
    checkRole(['ADMIN']),
    checkPermission('CREATE'),
    userController.createUser
)

// Actualizar un usuario (solo ADMIN o el propio usuario con permiso UPDATE)
router.put('/usuario/:id',
    authMiddleware,
    (req, res, next) => {
        if (req.user.rol === 'ADMIN' || req.user._id.toString() === req.params.id) {
            return next()
        }
        return res.status(403).json({ message: 'Acción no permitida' })
    },
    checkPermission('UPDATE'),
    userController.updateUser
)
//Eliminar un usuario(solo admin)
router.delete('/usuario/:id',
    authMiddleware,
    checkRole(['ADMIN']),
    checkPermission('DELETE'),
    userController.deleteUser
)
// REGISTRO (Publico)
router.post('/register',
    validation.validateUserRegistration,
    userController.createUser
)
//LOGIN(PUBLICO)
router.post('/login',
    validation.validateUserLogin,
    userController.loginUser
)
module.exports = router