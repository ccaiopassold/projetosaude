const express = require('express');

const {
    listarAtividades,
    cadastrarAtividade
} = require('../controllers/atividadeController');

const router = express.Router();

router.get('/atividades', listarAtividades);

router.post('/atividades', cadastrarAtividade);

module.exports = router;