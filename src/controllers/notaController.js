const Nota = require('../models/notaModel');

// Obtener todas las notas
const obtenerNotas = async (req, res) => {
    try {
        const notas = await Nota.find();
        res.json(notas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener notas', error });
    }
};

// Crear nueva nota
const crearNota = async (req, res) => {
    try {
        const nuevaNota = new Nota(req.body);
        await nuevaNota.save();
        res.status(201).json(nuevaNota);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear nota', error });
    }
};

// Editar nota
const actualizarNota = async (req, res) => {
    try {
        const { id } = req.params;
        const notaActualizada = await Nota.findByIdAndUpdate(id, req.body, { new: true });
        if (!notaActualizada) return res.status(404).json({ message: 'Nota no encontrada' });
        res.json(notaActualizada);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar nota', error });
    }
};

// Eliminar nota
const eliminarNota = async (req, res) => {
    try {
        const { id } = req.params;
        const notaEliminada = await Nota.findByIdAndDelete(id);
        if (!notaEliminada) return res.status(404).json({ message: 'Nota no encontrada' });
        res.json({ message: 'Nota eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar nota', error });
    }
};

// Exportar todos
module.exports = {
    obtenerNotas,
    crearNota,
    actualizarNota,
    eliminarNota
};
