const userService = require('../services/userServices')
const jwt = require('jsonwebtoken')

// GET ALL USERS
const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers()
        if (!users) {
            return res.status(404).json({ success: false, message: 'No Hay Usuarios' })
        }
        res.status(200).json({ success: true, message: 'Usuarios Obtenidos', users })
    } catch (error) {
        console.error('Error Al Obtener Los Usuarios', error)
        res.status(500).json({ success: false, message: 'Error Interno Del Servidor' })
    }
}

// GET USER BY ID
const getOneUser = async (req, res) => {
    try {
        const user = await userService.getOneUser(req.params.id)
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario No Encontrado' })
        }
        res.status(200).json({ success: true, message: 'Usuario Obtenido', user })
    } catch (error) {
        console.error('Error Al Obtener El Usuario', error)
        res.status(500).json({ success: false, message: 'Error Interno Del Servidor' })
    }
}

// CREATE USER
const createUser = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body
        const newUser = await userService.createUser(nombre, email, password, rol)
        res.status(201).json({ success: true, message: 'Usuario Creado', newUser })
    } catch (error) {
        console.error('Error Al Crear El Usuario', error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// LOGIN USER
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Correo y Contraseña Son Obligatorios' })
        }

        const user = await userService.loginUser(email, password)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })

        res.status(200).json({ success: true, message: 'Inicio De Sesión Exitoso', token, user })
    } catch (error) {
        console.error('Error Al Iniciar Sesión:', error)
        if (error.message === 'El Usuario No Existe' || error.message === 'Contraseña Incorrecta') {
            return res.status(401).json({ success: false, message: error.message })
        }
        res.status(500).json({ success: false, message: 'Error Interno Del Servidor' })
    }
}

// UPDATE USER BY ID
const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const { nombre, email, password } = req.body
        const updatedUser = await userService.updateUser(id, nombre, email, password)

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'Usuario No Encontrado' })
        }
        res.status(200).json({ success: true, message: 'Usuario Actualizado', updatedUser })
    } catch (error) {
        console.error('Error Al Actualizar El Usuario', error)
        res.status(500).json({ success: false, message: 'Error Interno Del Servidor' })
    }
}

// DELETE USER BY ID
const deleteUser = async (req, res) => {
    try {
        const deletedUser = await userService.deleteUser(req.params.id)
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'Usuario No Encontrado' })
        }
        res.status(200).json({ success: true, message: 'Usuario Eliminado', deletedUser })
    } catch (error) {
        console.error('Error Al Eliminar El Usuario', error)
        res.status(500).json({ success: false, message: 'Error Interno Del Servidor' })
    }
}

module.exports = {
    getAllUsers,
    getOneUser,
    createUser,
    loginUser,
    updateUser,
    deleteUser
}
