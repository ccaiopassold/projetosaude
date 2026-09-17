const pool = require('../config/database');

async function listarAtividades(req, res) {
    try {
        const pagina = Math.max(parseInt(req.query.page) || 1, 1);
        const limite = 4;
        const offset = (pagina - 1) * limite;

        const tipo = req.query.tipo
            ? req.query.tipo.toLowerCase()
            : null;

        const tiposPermitidos = [
            'corrida',
            'caminhada',
            'trilha'
        ];

        if (tipo && !tiposPermitidos.includes(tipo)) {
            return res.status(400).json({
                erro: 'Tipo de atividade inválido',
                tipos_permitidos: tiposPermitidos
            });
        }

        let query = `
            SELECT
                a.id,
                u.nome AS usuario,
                a.tipo_atividade,
                a.distancia_km,
                a.duracao_min,
                a.data_atividade,
                a.descricao
            FROM atividade a
            INNER JOIN usuario u
                ON u.id = a.usuario_id
        `;

        const valores = [];

        if (tipo) {
            query += `
                WHERE LOWER(a.tipo_atividade) = $1
            `;

            valores.push(tipo);
        }

        query += `
            ORDER BY a.data_atividade DESC, a.id DESC
            LIMIT $${valores.length + 1}
            OFFSET $${valores.length + 2}
        `;

        valores.push(limite);
        valores.push(offset);

        const result = await pool.query(query, valores);

        let totalQuery = `
            SELECT COUNT(*) AS total
            FROM atividade a
        `;

        const totalValores = [];

        if (tipo) {
            totalQuery += `
                WHERE LOWER(a.tipo_atividade) = $1
            `;

            totalValores.push(tipo);
        }

        const totalResult = await pool.query(
            totalQuery,
            totalValores
        );

        const total = Number(totalResult.rows[0].total);
        const totalPaginas = Math.ceil(total / limite);

        const atividades = result.rows.map((atividade) => ({
            id: atividade.id,
            usuario: atividade.usuario,
            tipo: atividade.tipo_atividade,
            distancia_km: Number(atividade.distancia_km),
            duracao_min: atividade.duracao_min,
            data: `12:00 - ${formatarData(atividade.data_atividade)}`,
            descricao: atividade.descricao
        }));

        res.json({
            pagina,
            por_pagina: limite,
            total,
            total_paginas: totalPaginas,
            atividades
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            erro: 'Erro ao buscar atividades'
        });
    }
}


async function cadastrarAtividade(req, res) {
    try {
        const {
            usuario_id,
            tipo_atividade,
            distancia_km,
            duracao_min,
            descricao
        } = req.body;

        // Verifica campos obrigatórios
        if (
            !usuario_id ||
            !tipo_atividade ||
            distancia_km === undefined ||
            duracao_min === undefined
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'usuario_id, tipo_atividade, distancia_km e duracao_min são obrigatórios.'
            });
        }

        const tipo = tipo_atividade.toLowerCase();

        const tiposPermitidos = [
            'corrida',
            'caminhada',
            'trilha'
        ];

        // Valida o tipo
        if (!tiposPermitidos.includes(tipo)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Tipo de atividade inválido.',
                tipos_permitidos: tiposPermitidos
            });
        }

        // Valida distância
        if (Number(distancia_km) <= 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'A distância deve ser maior que zero.'
            });
        }

        // Valida duração
        if (Number(duracao_min) <= 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'A duração deve ser maior que zero.'
            });
        }

        // Verifica se o usuário existe
        const usuario = await pool.query(
            `SELECT id, nome
             FROM usuario
             WHERE id = $1`,
            [usuario_id]
        );

        if (usuario.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado.'
            });
        }

        // Insere a atividade
        const resultado = await pool.query(
            `INSERT INTO atividade
                (
                    usuario_id,
                    tipo_atividade,
                    distancia_km,
                    duracao_min,
                    data_atividade,
                    descricao
                )
             VALUES
                ($1, $2, $3, $4, NOW(), $5)
             RETURNING
                id,
                usuario_id,
                tipo_atividade,
                distancia_km,
                duracao_min,
                data_atividade,
                descricao`,
            [
                usuario_id,
                tipo,
                Number(distancia_km),
                Number(duracao_min),
                descricao || null
            ]
        );

        const atividade = resultado.rows[0];

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Atividade cadastrada com sucesso.',
            atividade: {
                id: atividade.id,
                usuario_id: atividade.usuario_id,
                usuario: usuario.rows[0].nome,
                tipo: atividade.tipo_atividade,
                distancia_km: Number(atividade.distancia_km),
                duracao_min: atividade.duracao_min,
                data: atividade.data_atividade,
                descricao: atividade.descricao
            }
        });

    } catch (error) {
        console.error('Erro ao cadastrar atividade:', error);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor.'
        });
    }
}


function formatarData(data) {
    const dataString = data.toISOString().split('T')[0];

    const [ano, mes, dia] = dataString.split('-');

    return `${dia}/${mes}/${ano.substring(2)}`;
}


module.exports = {
    listarAtividades,
    cadastrarAtividade
};