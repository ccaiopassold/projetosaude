const express = require('express');

const {
    obterEmpresa
} = require('../controllers/empresaController');

const router = express.Router();

router.get('/empresa', obterEmpresa);

module.exports = router;