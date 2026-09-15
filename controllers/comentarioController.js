const pool = require('../config/database');


// =====================================================
// ADICIONAR COMENTÁRIO
// =====================================================

async function adicionarComentario(req, res) {

    try {

        const { usuario_id, atividade_id, texto } = req.body;


        // Verifica os campos obrigatórios
        if (!usuario_id || !atividade_id || !texto) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'usuario_id, atividade_id e texto são obrigatórios.'
            });

        }


        // Verifica se o usuário existe
        const usuario = await pool.query(
            `
            SELECT id
            FROM usuario
            WHERE id = $1
            `,
            [usuario_id]
        );


        if (usuario.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado.'
            });

        }


        // Verifica se a atividade existe
        const atividade = await pool.query(
            `
            SELECT id
            FROM atividade
            WHERE id = $1
            `,
            [atividade_id]
        );


        if (atividade.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Atividade não encontrada.'
            });

        }


        // Adiciona o comentário
        const resultado = await pool.query(
            `
            INSERT INTO comentario
                (usuario_id, atividade_id, texto, data_comentario)
            VALUES
                ($1, $2, $3, NOW())
            RETURNING
                id,
                usuario_id,
                atividade_id,
                texto,
                data_comentario
            `,
            [usuario_id, atividade_id, texto]
        );


        return res.status(201).json({
            sucesso: true,
            mensagem: 'Comentário adicionado com sucesso.',
            comentario: resultado.rows[0]
        });


    } catch (error) {

        console.error(
            'Erro ao adicionar comentário:',
            error
        );


        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor.'
        });

    }

}


// =====================================================
// LISTAR COMENTÁRIOS
// =====================================================

async function listarComentarios(req, res) {

    try {

        const { atividade_id } = req.params;


        const resultado = await pool.query(
            `
            SELECT
                c.id,
                c.usuario_id,
                u.nome AS usuario,
                c.atividade_id,
                c.texto,
                c.data_comentario
            FROM comentario c
            INNER JOIN usuario u
                ON u.id = c.usuario_id
            WHERE c.atividade_id = $1
            ORDER BY c.data_comentario ASC, c.id ASC
            `,
            [atividade_id]
        );


        return res.status(200).json({
            sucesso: true,
            atividade_id: Number(atividade_id),
            comentarios: resultado.rows
        });


    } catch (error) {

        console.error(
            'Erro ao listar comentários:',
            error
        );


        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar comentários.'
        });

    }

}


// =====================================================
// EXPORTAÇÕES
// =====================================================

module.exports = {
    adicionarComentario,
    listarComentarios
};