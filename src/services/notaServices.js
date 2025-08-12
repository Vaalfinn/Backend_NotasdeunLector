const { actualizarNota, eliminarNota } = require('../controllers/notaController');
const Nota = require('../models/notaModel');

const crearNota = async (notaData) => {
    const nota = new Nota(notaData);
    return await nota.save();
};

const obtenerNotas = async () => {
    return await Nota.find().populate('usuario', 'nombre email');
};

module.exports = {
    crearNota,
    obtenerNotas,
    actualizarNota,
    eliminarNota,
};
