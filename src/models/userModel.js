/* USER MODEL */
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const { defaults } = require('pg')

const roles = {
    values: ['ADMIN', 'CLIENTE', 'INVITADO'],
    message: '{VALUE} no es un rol válido'
}
/*Permisoss de Roles*/
const rolePermissions = {
    ADMIN: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE_USERS'],
    CLIENTE: ['READ_USER', 'write_comments', 'view_profile'],
    INVITADO: ['READ_REVIEWS']
}
const userSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre es necesario'],
            trim: true // ELIMINA ESPACIOS SI ES NECESARIO
        },
        email: {
            type: String,
            unique: true,
            required: [true, 'El correo es necesario'],
            lowercase: true, // CONVIERTE A MINÚSCULAS
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Debe indicar un email válido'
            ]
        },
        password: {
            type: String,
            required: [true, 'La contraseña es obligatoria']
        },
        rol: {
            type: String,
            enum: roles,
            default: 'INVITADO',
            required: true
        },
        permissions: {
            type: [String],
            defaults: []
        },
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date },
        verificationCode: { type: String }, // Código de verificación
        verified: { type: Boolean, default: false } // Estado de verificación
    },
    { timestamps: true }
)

// PLUGIN PARA VERIFICAR LOS CAMPOS ÚNICOS
userSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' })

userSchema.methods.hasPermission = function (permission) {
    return this.permissions.includes(permission)
}


// Method to check if user has a specific permission
userSchema.methods.updatePermissions = function () {
    this.permissions = rolePermissions[this.rol] || []
    return this.permissions
}
//Agregar el hash automatico

const bcrypt = require('bcryptjs');
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});
module.exports = mongoose.model('users', userSchema)