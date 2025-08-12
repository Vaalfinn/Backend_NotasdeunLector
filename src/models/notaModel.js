const mongoose = require("mongoose");

const notaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
    },
    contenido: {
        type: String,
        required: true,
    },
    autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", // Asegúrate de que coincida con tu modelo de usuario
        required: true,
    },
    fechaCreacion: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("Nota", notaSchema);
