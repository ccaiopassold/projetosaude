let paginaAtual = 1;
let tipoAtual = 'corrida';


// =====================================================
// EMPRESA
// =====================================================

async function carregarEmpresa() {

    try {

        const resposta = await fetch(
            'http://localhost:3000/empresa'
        );

        if (!resposta.ok) {
            throw new Error(
                'Erro ao buscar dados da empresa'
            );
        }

        const empresa = await resposta.json();

        console.log(
            'Dados da empresa:',
            empresa
        );

    } catch (erro) {

        console.error(
            'Erro ao carregar empresa:',
            erro
        );

    }
}


// =====================================================
// ATIVIDADES
// =====================================================

async function carregarAtividades() {

    try {

        const resposta = await fetch(
            `http://localhost:3000/atividades?page=${paginaAtual}&tipo=${tipoAtual}`
        );

        if (!resposta.ok) {
            throw new Error(
                'Erro ao buscar atividades'
            );
        }

        const dados = await resposta.json();

        console.log(
            'Dados das atividades:',
            dados
        );

        renderizarAtividades(
            dados.atividades
        );

        renderizarPaginacao(
            dados.total_paginas
        );

    } catch (erro) {

        console.error(
            'Erro ao carregar atividades:',
            erro
        );

    }
}


// =====================================================
// RENDERIZAR CARDS
// =====================================================

function renderizarAtividades(atividades) {

    const lista =
        document.getElementById(
            'lista-atividades'
        );

    lista.innerHTML = '';

    if (!atividades || atividades.length === 0) {

        lista.innerHTML = `
            <p>Nenhuma atividade encontrada.</p>
        `;

        return;
    }

    atividades.forEach((atividade) => {

        const card =
            document.createElement('article');

        card.className = 'card';

        const calorias =
            calcularCalorias(
                atividade.tipo,
                atividade.distancia_km,
                atividade.duracao_min
            );

        card.innerHTML = `
            <div class="card-titulo">
                ${atividade.tipo}
            </div>

            <div class="card-conteudo">

                <div class="foto-usuario">
                    FOTO
                </div>

                <div class="informacoes">

                    <h2>
                        ${atividade.usuario}
                    </h2>

                    <p>
                        Distância:
                        <strong>
                            ${Number(atividade.distancia_km).toFixed(2)} km
                        </strong>
                    </p>

                    <p>
                        Duração:
                        <strong>
                            ${atividade.duracao_min} min
                        </strong>
                    </p>

                    <p>
                        Calorias:
                        <strong>
                            ${calorias} kcal
                        </strong>
                    </p>

                    <p>
                        ${atividade.data}
                    </p>

                </div>

            </div>

            <div class="card-acoes">

                <button class="acao" type="button">
                    ♡
                </button>

                <button class="acao" type="button">
                    💬
                </button>

            </div>
        `;

        lista.appendChild(card);

    });
}


// =====================================================
// CALCULAR CALORIAS
// =====================================================

function calcularCalorias(tipo, distancia, duracao) {

    let calorias = 0;

    switch (String(tipo).toLowerCase()) {

        case 'corrida':
            calorias =
                (duracao / 60 * 60) +
                (distancia * 30);
            break;

        case 'caminhada':
            calorias =
                (duracao / 60 * 40) +
                (distancia * 20);
            break;

        case 'trilha':
            calorias =
                (duracao / 60 * 55) +
                (distancia * 35);
            break;

    }

    return Math.round(calorias);
}


// =====================================================
// CONFIGURAR FILTROS
// =====================================================

function configurarFiltros() {

    const filtros =
        document.querySelectorAll('.filtro');

    filtros.forEach((filtro) => {

        filtro.addEventListener('click', () => {

            filtros.forEach((item) => {
                item.classList.remove('ativo');
            });

            filtro.classList.add('ativo');

            tipoAtual =
                filtro.dataset.tipo;

            paginaAtual = 1;

            carregarAtividades();

        });

    });
}


// =====================================================
// PAGINAÇÃO
// =====================================================

function renderizarPaginacao(totalPaginas) {

    const paginacao =
        document.getElementById('paginacao');

    paginacao.innerHTML = '';

    if (!totalPaginas || totalPaginas <= 1) {
        return;
    }

    for (
        let pagina = 1;
        pagina <= totalPaginas;
        pagina++
    ) {

        const botao =
            document.createElement('button');

        botao.type = 'button';

        botao.textContent = pagina;

        if (pagina === paginaAtual) {
            botao.classList.add('pagina-ativa');
        }

        botao.addEventListener('click', () => {

            paginaAtual = pagina;

            carregarAtividades();

        });

        paginacao.appendChild(botao);

    }

}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

configurarFiltros();

carregarEmpresa();

carregarAtividades();