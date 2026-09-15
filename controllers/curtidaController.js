const pool = require('../config/database');


// =====================================================
// CURTIR / DESCURTIR ATIVIDADE
// =====================================================

async function alternarCurtida(req, res) {

    try {

        const { usuario_id, atividade_id } = req.body;


        // Verifica os campos obrigatórios
        if (!usuario_id || !atividade_id) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'usuario_id e atividade_id são obrigatórios.'
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


        // Verifica se o usuário já curtiu
        const curtida = await pool.query(
            `
            SELECT id
            FROM curtida
            WHERE usuario_id = $1
              AND atividade_id = $2
            `,
            [usuario_id, atividade_id]
        );


        // Se já curtiu, remove a curtida
        if (curtida.rows.length > 0) {

            await pool.query(
                `
                DELETE FROM curtida
                WHERE usuario_id = $1
                  AND atividade_id = $2
                `,
                [usuario_id, atividade_id]
            );


            return res.status(200).json({
                sucesso: true,
                curtida: false,
                mensagem: 'Curtida removida.'
            });

        }


        // Se ainda não curtiu, adiciona
        await pool.query(
            `
            INSERT INTO curtida (usuario_id, atividade_id)
            VALUES ($1, $2)
            `,
            [usuario_id, atividade_id]
        );


        return res.status(201).json({
            sucesso: true,
            curtida: true,
            mensagem: 'Atividade curtida.'
        });


    } catch (error) {

        console.error(
            'Erro ao alternar curtida:',
            error
        );


        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor.'
        });

    }

}


// =====================================================
// CONTAR CURTIDAS
// =====================================================

async function contarCurtidas(req, res) {

    try {

        const { atividade_id } = req.params;

        const usuario_id =
            req.query.usuario_id;


        // Conta todas as curtidas da atividade
        const resultado = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM curtida
            WHERE atividade_id = $1
            `,
            [atividade_id]
        );


        let curtida = false;


        // Verifica se o usuário atual já curtiu
        if (usuario_id) {

            const resultadoCurtida =
                await pool.query(
                    `
                    SELECT id
                    FROM curtida
                    WHERE atividade_id = $1
                      AND usuario_id = $2
                    `,
                    [
                        atividade_id,
                        usuario_id
                    ]
                );


            curtida =
                resultadoCurtida.rows.length > 0;

        }


        return res.status(200).json({

            sucesso: true,

            atividade_id:
                Number(atividade_id),

            total:
                Number(resultado.rows[0].total),

            curtida:
                curtida

        });


    } catch (error) {

        console.error(
            'Erro ao contar curtidas:',
            error
        );


        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao contar curtidas.'
        });

    }

}


// =====================================================
// EXPORTAÇÕES
// =====================================================

module.exports = {
    alternarCurtida,
    contarCurtidas
};