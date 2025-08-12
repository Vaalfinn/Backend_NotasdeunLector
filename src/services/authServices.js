const UserModel = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { sendVerificationEmail } = require('../services/emailServices')

/* AUTHENTICATION */
// REGISTER USER
// USUARIO INVITADO POR DEFECTO 
const registerUser = async (nombre, email, password, rol = 'INVITADO') => {
    try {
        // VERIFICAR SI EL EMAIL YA EXISTE
        const existingUser = await UserModel.findOne({ email })
        if (existingUser) {
            throw new Error('El Email Ya Está Registrado')
        }

        // HASHEAMOS LA CONTRASEÑA SOLO SI NO SE HASHEA EN EL MODELO
        // const salt = await bcrypt.genSalt(10)//
        //const hashedPassword = await bcrypt.hash(password, salt)//
        //CONVERTIR EL ROL Y VALIDADAR
        const rolMayuscula = rol.toUpperCase();
        if (!['ADMIN', 'CLIENTE', 'INVITADO'].includes(rolMayuscula)) {
            throw new Error('Rol No Válido.')
        }
        // CREAR NUEVO USUARIO
        const newUser = new UserModel({ nombre, email, password, rol: rolMayuscula })
        newUser.updatePermissions();
        await newUser.save();


        // Enviar Correo de Bienvenida
        const subject = 'Bienvenido a Notas de un Lector. Registro Exitoso';
        const text = `Hola ${nombre}, gracias por registrarte en nuestra Blog. Estamos emocionados de tenerte con nosotros.`;
        const html = `<h1>Hola ${nombre}!</h1><p>Bienvenido a nuestra Blog,Gracias por registrarte.</p>`;

        await sendVerificationEmail(email, subject, text, html)

        await newUser.save()
        return newUser
    } catch (error) {
        throw new Error(`Error En El registro: ${error.message}`)
    }
}

// LOGIN USER
const loginUser = async (email, password) => {
    try {
        // VERIFICAR SI EL USUARIO EXISTE
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new Error('El Usuario No Existe');
        }

        // LOGS PARA DEPURAR
        console.log('Login - Email:', email);
        console.log('Login - Contraseña ingresada:', password);
        console.log('Login - Hash guardado:', user.password);

        // VERIFICAR SI LA CONTRASEÑA ES CORRECTA
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Login - Resultado bcrypt.compare:', isMatch);
        if (!isMatch) {
            throw new Error('Contraseña Incorrecta');
        }

        // GENERAR TOKEN JWT
        const token = jwt.sign({ id: user._id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // ENVIAR CÓDIGO MFA
        await sendMfaCode(user);

        // Retornar solo los campos necesarios
        return {
            user: {
                nombre: user.nombre,
                email: user.email,
                rol: user.rol, // <-- aquí está el rol
                // agrega otros campos si los necesitas
            },
            token,
            mfaRequired: true
        };
    } catch (error) {
        throw new Error(`Error En El Login: ${error.message}`);
    }
}
// ENVIAR CÓDIGO DE VERIFICACIÓN
const sendVerificationCode = async (email) => {
    const user = await UserModel.findOne({ email })
    if (!user) {
        throw new Error('Usuario No Encontrado')
    }

    // GENERAR CÓDIGO DE 6 DÍGITOS DE MANERA SEGURA
    const verificationCode = Math.floor(100000 + crypto.randomBytes(4).readUInt32LE(0) % 900000).toString()
    user.verificationCode = verificationCode
    await user.save()

    await sendVerificationEmail(user.email, 'Código de Verificación',
        `Tu código de verificación es: ${verificationCode}`,
        `<h1>Código de Verificación</h1><p>Tu código es: <b>${verificationCode}</b></p>`
    )

    return { verificationCode }
}

// VERIFICAR CÓDIGO
const verifyCode = async (email, code) => {
    const user = await UserModel.findOne({ email })
    if (!user) {
        throw new Error('Usuario No Encontrado')
    }

    if (user.verificationCode !== code) {
        throw new Error('Código Inválido')
    }

    const subject = 'Cuenta Verificada Exitosamente',
        text = 'Tu cuenta ha sido verificada con éxito',
        html = '<h1>Cuenta Verificada</h1><p>Tu cuenta ha sido verificada con éxito</p>'
    await sendVerificationEmail(user.email, subject, text, html)

    user.verified = true
    user.verificationCode = null
    await user.save()

    return user
}

// SOLICITAR RESTABLECIMIENTO DE CONTRASEÑA
const requestPasswordReset = async (email) => {
    try {
        const user = await UserModel.findOne({ email })
        if (!user) throw new Error('Usuario no encontrado')

        // Generar token de restablecimiento (expira en 1 hora)
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })

        user.resetPasswordToken = resetToken
        user.resetPasswordExpires = Date.now() + 3600000 // 1 hora
        await user.save()

        // Enviar correo con el enlace
        const resetLink = `http://localhost:3000/api/auth/reset-password/${resetToken}`

        // PRUEBAS
        //  console.log('Reset Token:', resetToken);//
        //  console.log('Reset Link:', resetLink); //

        const subject = 'Restablecimiento de Contraseña'
        const text = `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetLink}`
        const html = `<h1>Restablecer Contraseña</h1><p><a href="${resetLink}">Haz clic aquí</a> para restablecer tu contraseña. El enlace expira en 1 hora.</p>`

        await sendVerificationEmail(user.email, subject, text, html)
        return {
            success: true,
            message: 'Correo De Restablecimiento Enviado'
        }
    } catch (error) {
        throw new Error(error.message)
    }
}

// RESTABLECER CONTRASEÑA
const resetPassword = async (token, newPassword) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await UserModel.findById(decoded.id)

        if (!user || user.resetPasswordToken !== token) {
            throw new Error('Token Inválido O Expirado')
        }

        // Hashear la nueva contraseña
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(newPassword, salt)


        const subject = 'Contraseña Restablecida Con Éxito',
            text = 'Tu contraseña ha sido restablecida con éxito',
            html = '<h1>Contraseña Restablecida</h1><p>Tu contraseña ha sido restablecida con éxito</p>'
        await sendVerificationEmail(user.email, subject, text, html)

        // Limpiar token de restablecimiento
        user.resetPasswordToken = null
        user.resetPasswordExpires = null
        await user.save()

        return { success: true, message: 'Contraseña Restablecida Con Éxito' }
    } catch (error) {
        throw new Error(error.message)
    }
}

// ENVIAR CÓDIGO MFA
const sendMfaCode = async (user) => {
    const mfaCode = Math.floor(100000 + crypto.randomBytes(4).readUInt32LE(0) % 900000).toString()
    user.mfaCode = mfaCode
    user.mfaCodeExpires = Date.now() + 300000 // 5 minutes
    await user.save()

    const subject = 'Código de Autenticación Multifactor',
        text = `Tu código de autenticación es: ${mfaCode}`,
        html = `<h1>Código de Autenticación</h1><p>Tu código es: <b>${mfaCode}</b></p>`
    await sendVerificationEmail(user.email, subject, text, html)
}

// VERIFICAR CÓDIGO MFA
const verifyMfaCode = async (email, code) => {
    const user = await UserModel.findOne({ email })
    if (!user) {
        throw new Error('Usuario No Encontrado')
    }

    if (user.mfaCode !== code || user.mfaCodeExpires < Date.now()) {
        throw new Error('Código MFA Inválido o Expirado')
    }

    user.mfaCode = null
    user.mfaCodeExpires = null
    await user.save()

    return { success: true, message: 'Autenticación MFA Exitosa' }
}

// ACTUALIZAR CONTRASEÑA
const updatePassword = async (userId, currentPassword, newPassword) => {
    try {
        const user = await UserModel.findById(userId)
        if (!user) {
            throw new Error('Usuario No Encontrado')
        }

        // Verificar la contraseña actual
        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) {
            throw new Error('Contraseña Actual Incorrecta')
        }

        // Hashear la nueva contraseña
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(newPassword, salt)
        await user.save()

        const subject = 'Contraseña Actualizada Con Éxito',
            text = 'Tu contraseña ha sido actualizada con éxito',
            html = '<h1>Contraseña Actualizada</h1><p>Tu contraseña ha sido actualizada con éxito</p>'
        await sendVerificationEmail(user.email, subject, text, html)

        return { success: true, message: 'Contraseña Actualizada Con Éxito' }
    } catch (error) {
        throw new Error(error.message)
    }
}

module.exports = {
    registerUser,
    loginUser,
    sendVerificationCode,
    verifyCode,
    requestPasswordReset,
    resetPassword,
    verifyMfaCode,
    updatePassword
}