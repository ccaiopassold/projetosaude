const express = require('express');
const cors = require('cors');

require('dotenv').config();

const pool = require('./config/database');

const empresaRoutes = require('./routes/empresaRoutes');
const atividadeRoutes = require('./routes/atividadeRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/', empresaRoutes);
app.use('/', atividadeRoutes);

// Rota de teste
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