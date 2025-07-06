const UserModel = require('../models/userModel')
const bcrypt = require('bcryptjs')

// GET ALL USERS
const getAllUsers = async () => {
    return await UserModel.find()
}

// GET USER BY ID
const getOneUser = async (id) => {
    return await UserModel.findById(id)
}

// CREATE USER
const createUser = async (nombre, email, password, rol = 'INVITADO') => {
    try {
        const existingUser = await UserModel.findOne({ email: email.trim().toLowerCase() })
        if (existingUser) {
            throw new Error('El Email Ya Está Registrado')
        }

        const rolMayuscula = rol.toUpperCase()
        if (!['ADMIN', 'CLIENTE', 'INVITADO'].includes(rolMayuscula)) {
            throw new Error('Rol Inválido')
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new UserModel({
            nombre,
            email,
            password: hashedPassword,
            rol: rolMayuscula
        })
        //ASIGNAR PERMISOS AUTOMATICOS
        newUser.updatePermissions()

        await newUser.save()
        return newUser
    } catch (error) {
        throw new Error(`Error En El registro: ${error.message}`)
    }
}

// LOGIN USER
const loginUser = async (email, password) => {
    try {
        const user = await UserModel.findOne({ email: email.trim().toLowerCase() })
        if (!user) {
            throw new Error('El Usuario No Existe')
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            throw new Error('Contraseña Incorrecta')
        }

        return user
    } catch (error) {
        throw new Error(`Error En El Login: ${error.message}`)
    }
}

// DELETE USER BY ID
const deleteUser = async (id) => {
    return await UserModel.findByIdAndDelete(id)
}

// UPDATE USER BY ID
const updateUser = async (id, nombre, email, password) => {
    try {
        const user = await UserModel.findById(id)
        if (!user) {
            return null
        }

        user.nombre = nombre || user.nombre
        user.email = email || user.email

        if (password) {
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt)
        }
        //RECALCULAR PERMISOS SI CAMBIA EL ROL OPCIONAL SI DECIDE PERMITIR CAMBIAR ROL AQUI
        user.updatePermissions()

        await user.save()
        return user
    } catch (error) {
        throw new Error(`Error Al Actualizar: ${error.message}`)
    }
}

module.exports = {
    getAllUsers,
    getOneUser,
    createUser,
    loginUser,
    deleteUser,
    updateUser
}
