const express = require('express');

const {
    adicionarComentario,
    listarComentarios
} = require('../controllers/comentarioController');

const router = express.Router();


// Adicionar comentário
router.post('/comentarios', adicionarComentario);


// Listar comentários de uma atividade
router.get(
    '/atividades/:atividade_id/comentarios',
    listarComentarios
);


module.exports = router;