let paginaAtual = 1;
let tipoAtual = 'corrida';


// =====================================================
// CONTROLE DE LOGIN
// =====================================================

let usuarioLogado = JSON.parse(
    localStorage.getItem('usuarioLogado')
) || null;


// =====================================================
// EMPRESA
// =====================================================

async function carregarEmpresa() {

    try {

        const resposta = await fetch(
            'http://localhost:3001/empresa'
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
            `http://localhost:3001/atividades?page=${paginaAtual}&tipo=${tipoAtual}`
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

                <button
                    class="acao"
                    type="button"
                    ${usuarioLogado ? '' : 'disabled'}
                    title="${usuarioLogado ? 'Curtir atividade' : 'Faça login para curtir'}"
                >
                    ♡
                </button>

                <button
                    class="acao"
                    type="button"
                    ${usuarioLogado ? '' : 'disabled'}
                    title="${usuarioLogado ? 'Comentar atividade' : 'Faça login para comentar'}"
                >
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

            if (!usuarioLogado) {
                return;
            }

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

        if (!usuarioLogado) {
            botao.disabled = true;
        }

        botao.addEventListener('click', () => {

            if (!usuarioLogado) {
                return;
            }

            paginaAtual = pagina;

            carregarAtividades();

        });

        paginacao.appendChild(botao);

    }

}


// =====================================================
// LOGIN
// =====================================================

function configurarLogin() {

    const btnLogin =
        document.getElementById('btn-login');

    const btnCancelar =
        document.getElementById('btn-cancelar-login');

    const modal =
        document.getElementById('modal-login');

    const form =
        document.getElementById('form-login');

    const mensagem =
        document.getElementById('mensagem-login');


    // -------------------------------------------------
    // Clique no botão Login / Logout
    // -------------------------------------------------

    btnLogin.addEventListener('click', () => {

        if (usuarioLogado) {

            fazerLogout();

            return;
        }

        mensagem.textContent = '';

        modal.classList.add('aberto');

        modal.setAttribute(
            'aria-hidden',
            'false'
        );

    });


    // -------------------------------------------------
    // Cancelar login
    // -------------------------------------------------

    btnCancelar.addEventListener('click', () => {

        fecharModalLogin();

    });


    // -------------------------------------------------
    // Enviar formulário
    // -------------------------------------------------

    form.addEventListener('submit', async (evento) => {

        evento.preventDefault();

        const email =
            document.getElementById('email').value.trim();

        const senha =
            document.getElementById('senha').value;

        mensagem.textContent = '';


        // Validação no frontend
        if (!email || !senha) {

            mensagem.textContent =
                'E-mail e senha são obrigatórios.';

            return;
        }


        try {

            const resposta = await fetch(
                'http://localhost:3001/login',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({
                        email: email,
                        senha: senha
                    })
                }
            );


            const dados =
                await resposta.json();


            // Login incorreto
            if (!resposta.ok) {

                mensagem.textContent =
                    dados.mensagem ||
                    'E-mail ou senha incorretos.';

                return;
            }


            // Login realizado
            usuarioLogado =
                dados.usuario;

            localStorage.setItem(
                'usuarioLogado',
                JSON.stringify(usuarioLogado)
            );


            console.log(
                'Usuário logado:',
                usuarioLogado
            );


            fecharModalLogin();

            atualizarEstadoLogin();

            paginaAtual = 1;

            carregarAtividades();

        } catch (erro) {

            console.error(
                'Erro ao realizar login:',
                erro
            );

            mensagem.textContent =
                'Não foi possível conectar ao servidor.';

        }

    });

}


// =====================================================
// FECHAR MODAL
// =====================================================

function fecharModalLogin() {

    const modal =
        document.getElementById('modal-login');

    const form =
        document.getElementById('form-login');

    const mensagem =
        document.getElementById('mensagem-login');


    modal.classList.remove('aberto');

    modal.setAttribute(
        'aria-hidden',
        'true'
    );

    form.reset();

    mensagem.textContent = '';

}


// =====================================================
// LOGOUT
// =====================================================

function fazerLogout() {

    usuarioLogado = null;

    localStorage.removeItem(
        'usuarioLogado'
    );

    atualizarEstadoLogin();

    paginaAtual = 1;

    tipoAtual = 'corrida';


    // Volta o filtro para corrida
    const filtros =
        document.querySelectorAll('.filtro');

    filtros.forEach((filtro) => {

        filtro.classList.remove('ativo');

        if (
            filtro.dataset.tipo === 'corrida'
        ) {
            filtro.classList.add('ativo');
        }

    });


    carregarAtividades();

    console.log('Logout realizado.');

}


// =====================================================
// ATUALIZAR ESTADO DO LOGIN
// =====================================================

function atualizarEstadoLogin() {

    const btnLogin =
        document.getElementById('btn-login');

    const filtros =
        document.querySelectorAll('.filtro');


    // -------------------------------------------------
    // Botão Login / Logout
    // -------------------------------------------------

    if (usuarioLogado) {

        btnLogin.textContent = 'Logout';

    } else {

        btnLogin.textContent = 'Login';

    }


    // -------------------------------------------------
    // Filtros
    // -------------------------------------------------

    filtros.forEach((filtro) => {

        filtro.disabled = !usuarioLogado;

    });


    // -------------------------------------------------
    // Curtidas e comentários
    // -------------------------------------------------

    const acoes =
        document.querySelectorAll('.acao');

    acoes.forEach((acao) => {

        acao.disabled = !usuarioLogado;

    });


    // -------------------------------------------------
    // Atualiza paginação existente
    // -------------------------------------------------

    const botoesPagina =
        document.querySelectorAll('#paginacao button');

    botoesPagina.forEach((botao) => {

        botao.disabled = !usuarioLogado;

    });

}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

configurarFiltros();

configurarLogin();

atualizarEstadoLogin();

carregarEmpresa();

carregarAtividades();