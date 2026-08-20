const pool = require('../config/database');

async function obterEmpresa(req, res) {
    try {
        const result = await pool.query(`
            SELECT
                COUNT(*) AS total_atividades,
                COALESCE(
                    SUM(
                        CASE
                            WHEN LOWER(tipo_atividade) = 'corrida'
                                THEN (duracao_min / 60.0 * 60) + (distancia_km * 30)

                            WHEN LOWER(tipo_atividade) = 'caminhada'
                                THEN (duracao_min / 60.0 * 40) + (distancia_km * 20)

                            WHEN LOWER(tipo_atividade) = 'trilha'
                                THEN (duracao_min / 60.0 * 55) + (distancia_km * 35)

                            ELSE 0
                        END
                    ),
                    0
                ) AS total_calorias
            FROM atividade
        `);

        res.json({
            nome: 'SAEP Saúde',
            logo: null,
            total_atividades: Number(result.rows[0].total_atividades),
            total_calorias: Math.round(
                Number(result.rows[0].total_calorias)
            )
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            erro: 'Erro ao buscar dados da empresa'
        });
    }
}

module.exports = {
    obterEmpresa
};