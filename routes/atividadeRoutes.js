const express = require('express');

const {
    listarAtividades
} = require('../controllers/atividadeController');

const router = express.Router();

router.get('/atividades', listarAtividades);

module.exports = router;