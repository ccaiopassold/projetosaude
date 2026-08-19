const express = require('express');
const cors = require('cors');
const pool = require('./config/database');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/status', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');

        res.json({
            status: 'Servidor funcionando',
            banco: 'Conectado',
            horario: result.rows[0].now
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: 'Servidor funcionando',
            banco: 'Erro na conexão'
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});