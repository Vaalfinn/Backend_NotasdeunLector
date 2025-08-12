const authService = require('../services/authServices');
const emailServices = require('../services/emailServices');

/* AUTHENTICATION */
// REGISTER USER CON CONTRASEÑA HASHEADA
const registerUser = async (nombre, email, password, rol) => {
    const user = await authService.registerUser(nombre, email, password, rol)
    return user
}
//CREAR NUEVO USAUARIO
exports.register = async (nombre, email, password, rol, req) => {
    //Registrar usauario
    const newUser = await authService.registerUser(nombre, email, password, rol);
    // Enviar un codigo de verificacion
    await emailServices.sendVerificationCode(newUser, req);
    return newUser;
}// LOGIN USER
const loginUser = async (email, password) => {
    const result = await authService.loginUser(email, password)
    return result
}

// ENVIAR CÓDIGO DE VERIFICACIÓN
const sendVerificationCode = async (email) => {
    const result = await authService.sendVerificationCode(email)
    return result
}

// VERIFICAR CÓDIGO
const verifyCode = async (email, code) => {
    const result = await authService.verifyCode(email, code)
    return result
}

// SOLICITAR RESTABLECIMIENTO DE CONTRASEÑA
const requestPasswordReset = async (email) => {
    const result = await authService.requestPasswordReset(email)
    return result
}

// RESTABLECER CONTRASEÑA
const resetPassword = async (token, newPassword) => {
    const result = await authService.resetPassword(token, newPassword)
    return result
}

// CAMBIAR ROL DE USUARIO
const changeUserRole = async (userId, newRole) => {
    const result = await authService.changeUserRole(userId, newRole)
    return result
}

// VERIFICAR PERMISO
const checkPermission = async (userId, permission) => {
    const result = await authService.checkPermission(userId, permission)
    return result
}

// OBTENER TODOS LOS PERMISOS DE UN USUARIO
const getUserPermissions = async (userId) => {
    const result = await authService.getUserPermissions(userId)
    return result
}

module.exports = {
    registerUser,
    loginUser,
    sendVerificationCode,
    verifyCode,
    requestPasswordReset,
    resetPassword,
    changeUserRole,
    checkPermission,
    getUserPermissions
}
