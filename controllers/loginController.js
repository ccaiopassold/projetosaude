const pool = require('../config/database');

async function login(req, res) {

    try {

        const { email, senha } = req.body;

        // Verifica campos obrigatórios
        if (!email || !senha) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'E-mail e senha são obrigatórios.'
            });

        }

        // Busca o usuário pelo e-mail e senha
        const resultado = await pool.query(
            `
            SELECT id, nome, email, tipo_usuario
            FROM usuario
            WHERE email = $1
              AND senha = $2
            `,
            [email, senha]
        );

        // Credenciais incorretas
        if (resultado.rows.length === 0) {

            return res.status(401).json({
                sucesso: false,
                mensagem: 'E-mail ou senha incorretos.'
            });

        }

        const usuario = resultado.rows[0];

        // Login realizado
        return res.status(200).json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso.',
            usuario: usuario
        });

    } catch (erro) {

        console.error('Erro no login:', erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor.'
        });

    }

}

module.exports = {
    login
};