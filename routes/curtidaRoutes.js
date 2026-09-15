const express = require('express');

const {
    alternarCurtida,
    contarCurtidas
} = require('../controllers/curtidaController');

const router = express.Router();

// Curtir ou remover curtida
router.post('/curtidas', alternarCurtida);

// Contar curtidas de uma atividade
router.get('/atividades/:atividade_id/curtidas', contarCurtidas);

module.exports = router;