const express = require('express');
const router = express.Router();
const {
    obtenerNotas,
    crearNota,
    actualizarNota,
    eliminarNota
} = require('../controllers/notaController');

// Rutas
router.get('/', obtenerNotas);
router.post('/', crearNota);
router.put('/:id', actualizarNota);
router.delete('/:id', eliminarNota);

module.exports = router;
