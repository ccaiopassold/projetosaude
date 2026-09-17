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

        await renderizarAtividades(
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

async function renderizarAtividades(atividades) {

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


    for (const atividade of atividades) {

        const card =
            document.createElement('article');

        card.className = 'card';


        const calorias =
            calcularCalorias(
                atividade.tipo,
                atividade.distancia_km,
                atividade.duracao_min
            );


        // =================================================
        // BUSCAR CURTIDAS
        // =================================================

        let totalCurtidas = 0;
        let usuarioCurtiu = false;


        try {

            let url =
                `http://localhost:3001/atividades/${atividade.id}/curtidas`;


            if (usuarioLogado) {

                url +=
                    `?usuario_id=${usuarioLogado.id}`;

            }


            const respostaCurtidas =
                await fetch(url);


            if (respostaCurtidas.ok) {

                const dadosCurtidas =
                    await respostaCurtidas.json();


                totalCurtidas =
                    dadosCurtidas.total || 0;


                usuarioCurtiu =
                    dadosCurtidas.curtida || false;

            }

        } catch (erro) {

            console.error(
                'Erro ao carregar curtidas:',
                erro
            );

        }


        // =================================================
        // HTML DO CARD
        // =================================================

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
                            ${Number(
                                atividade.distancia_km
                            ).toFixed(2)} km
                        </strong>
                    </p>


                    <p>
                        Duração:

                        <strong>
                            ${formatarDuracaoHoras(
                                atividade.duracao_min
                            )} hora(s)
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

                    ${
                        atividade.descricao
                            ? `<p>${atividade.descricao}</p>`
                            : ''
                    }

                </div>

            </div>


            <div class="card-acoes">

                <button
                    class="acao btn-curtir ${usuarioCurtiu ? 'curtido' : ''}"
                    type="button"
                    data-atividade-id="${atividade.id}"
                    ${usuarioLogado ? '' : 'disabled'}
                    title="${
                        usuarioLogado
                            ? 'Curtir atividade'
                            : 'Faça login para curtir'
                    }"
                >
                    ${usuarioCurtiu ? '♥' : '♡'}
                </button>


                <span class="contador-curtidas">
                    ${totalCurtidas}
                </span>


                <button
                    class="acao btn-comentar"
                    type="button"
                    data-atividade-id="${atividade.id}"
                    ${usuarioLogado ? '' : 'disabled'}
                    title="${
                        usuarioLogado
                            ? 'Comentar atividade'
                            : 'Faça login para comentar'
                    }"
                >
                    💬
                </button>

            </div>

        `;


        lista.appendChild(card);


        // =================================================
        // CONFIGURAR BOTÃO DE CURTIDA
        // =================================================

        const botaoCurtir =
            card.querySelector(
                '.btn-curtir'
            );


        botaoCurtir.addEventListener(
            'click',
            () => alternarCurtida(
                atividade.id,
                botaoCurtir
            )
        );


        // =================================================
        // CONFIGURAR BOTÃO DE COMENTÁRIO
        // =================================================

        const botaoComentar =
            card.querySelector(
                '.btn-comentar'
            );


        botaoComentar.addEventListener(
            'click',
            () => abrirComentarios(
                atividade.id,
                card
            )
        );

    }

}


// =====================================================
// ALTERNAR CURTIDA
// =====================================================

async function alternarCurtida(
    atividadeId,
    botao
) {

    if (!usuarioLogado) {
        return;
    }


    try {

        const resposta =
            await fetch(
                'http://localhost:3001/curtidas',
                {

                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({

                        usuario_id:
                            usuarioLogado.id,

                        atividade_id:
                            atividadeId

                    })

                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            console.error(
                'Erro ao alterar curtida:',
                dados
            );

            return;

        }


        if (dados.curtida) {

            botao.textContent = '♥';

            botao.classList.add(
                'curtido'
            );

        } else {

            botao.textContent = '♡';

            botao.classList.remove(
                'curtido'
            );

        }


        const respostaContagem =
            await fetch(
                `http://localhost:3001/atividades/${atividadeId}/curtidas`
            );


        const dadosContagem =
            await respostaContagem.json();


        const card =
            botao.closest('.card');


        const contador =
            card.querySelector(
                '.contador-curtidas'
            );


        contador.textContent =
            dadosContagem.total;


    } catch (erro) {

        console.error(
            'Erro ao alterar curtida:',
            erro
        );

    }

}


// =====================================================
// COMENTÁRIOS
// =====================================================

async function abrirComentarios(
    atividadeId,
    card
) {

    if (!usuarioLogado) {
        return;
    }


    let areaComentarios =
        card.querySelector(
            '.area-comentarios'
        );


    if (areaComentarios) {

        areaComentarios.remove();

        return;

    }


    areaComentarios =
        document.createElement('div');

    areaComentarios.className =
        'area-comentarios';


    areaComentarios.innerHTML = `

        <div class="lista-comentarios">
            <p>Carregando comentários...</p>
        </div>


        <div class="novo-comentario">

            <input
                type="text"
                class="input-comentario"
                placeholder="Escreva um comentário..."
            >


            <button
                type="button"
                class="btn-enviar-comentario"
            >
                Enviar
            </button>

        </div>

    `;


    card.appendChild(
        areaComentarios
    );


    const botaoEnviar =
        areaComentarios.querySelector(
            '.btn-enviar-comentario'
        );


    botaoEnviar.addEventListener(
        'click',
        () => adicionarComentario(
            atividadeId,
            card
        )
    );


    const input =
        areaComentarios.querySelector(
            '.input-comentario'
        );


    input.addEventListener(
        'keydown',
        (evento) => {

            if (evento.key === 'Enter') {

                adicionarComentario(
                    atividadeId,
                    card
                );

            }

        }
    );


    await carregarComentarios(
        atividadeId,
        card
    );

}


// =====================================================
// CARREGAR COMENTÁRIOS
// =====================================================

async function carregarComentarios(
    atividadeId,
    card
) {

    try {

        const resposta =
            await fetch(
                `http://localhost:3001/atividades/${atividadeId}/comentarios`
            );


        if (!resposta.ok) {

            throw new Error(
                'Erro ao buscar comentários'
            );

        }


        const dados =
            await resposta.json();


        const areaComentarios =
            card.querySelector(
                '.area-comentarios'
            );


        if (!areaComentarios) {
            return;
        }


        const listaComentarios =
            areaComentarios.querySelector(
                '.lista-comentarios'
            );


        if (
            !dados.comentarios ||
            dados.comentarios.length === 0
        ) {

            listaComentarios.innerHTML = `
                <p>Nenhum comentário ainda.</p>
            `;

            return;

        }


        listaComentarios.innerHTML =
            dados.comentarios
                .map(
                    (comentario) => `

                        <div class="comentario">

                            <strong>
                                ${comentario.usuario}
                            </strong>

                            <p>
                                ${comentario.texto}
                            </p>

                        </div>

                    `
                )
                .join('');

    } catch (erro) {

        console.error(
            'Erro ao carregar comentários:',
            erro
        );

    }

}


// =====================================================
// ADICIONAR COMENTÁRIO
// =====================================================

async function adicionarComentario(
    atividadeId,
    card
) {

    if (!usuarioLogado) {
        return;
    }


    const areaComentarios =
        card.querySelector(
            '.area-comentarios'
        );


    if (!areaComentarios) {
        return;
    }


    const input =
        areaComentarios.querySelector(
            '.input-comentario'
        );


    const texto =
        input.value.trim();


    if (!texto) {
        return;
    }


    try {

        const resposta =
            await fetch(
                'http://localhost:3001/comentarios',
                {

                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({

                        usuario_id:
                            usuarioLogado.id,

                        atividade_id:
                            atividadeId,

                        texto:
                            texto

                    })

                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            console.error(
                'Erro ao adicionar comentário:',
                dados
            );

            return;

        }


        input.value = '';


        await carregarComentarios(
            atividadeId,
            card
        );


    } catch (erro) {

        console.error(
            'Erro ao adicionar comentário:',
            erro
        );

    }

}


// =====================================================
// CADASTRO DE ATIVIDADE
// =====================================================

function configurarCadastroAtividade() {

    const form =
        document.getElementById(
            'form-atividade'
        );

    const mensagem =
        document.getElementById(
            'mensagem-atividade'
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        'submit',
        async (evento) => {

            evento.preventDefault();


            if (!usuarioLogado) {

                mensagem.textContent =
                    'Faça login para cadastrar uma atividade.';

                return;

            }


            const tipo =
                document
                    .getElementById(
                        'tipo-atividade'
                    )
                    .value
                    .trim();


            const distancia =
                document
                    .getElementById(
                        'distancia-atividade'
                    )
                    .value;


            const duracao =
                document
                    .getElementById(
                        'duracao-atividade'
                    )
                    .value;


            const descricao =
                document
                    .getElementById(
                        'descricao-atividade'
                    )
                    .value
                    .trim();


            mensagem.textContent = '';


            if (
                !tipo ||
                !distancia ||
                !duracao
            ) {

                mensagem.textContent =
                    'Preencha todos os campos obrigatórios.';

                return;

            }


            if (Number(distancia) <= 0) {

                mensagem.textContent =
                    'A distância deve ser maior que zero.';

                return;

            }


            if (Number(duracao) <= 0) {

                mensagem.textContent =
                    'A duração deve ser maior que zero.';

                return;

            }


            try {

                const resposta =
                    await fetch(
                        'http://localhost:3001/atividades',
                        {

                            method: 'POST',

                            headers: {
                                'Content-Type':
                                    'application/json'
                            },

                            body: JSON.stringify({

                                usuario_id:
                                    usuarioLogado.id,

                                tipo_atividade:
                                    tipo,

                                distancia_km:
                                    Number(distancia),

                                duracao_min:
                                    Number(duracao),

                                descricao:
                                    descricao || null

                            })

                        }
                    );


                const dados =
                    await resposta.json();


                if (!resposta.ok) {

                    mensagem.textContent =
                        dados.mensagem ||
                        'Erro ao cadastrar atividade.';

                    return;

                }


                mensagem.textContent =
                    'Atividade cadastrada com sucesso!';


                form.reset();


                paginaAtual = 1;


                // Mostra imediatamente o tipo
                // da atividade recém-cadastrada
                tipoAtual = tipo;


                // Atualiza o filtro visual
                const filtros =
                    document.querySelectorAll(
                        '.filtro'
                    );


                filtros.forEach(
                    (filtro) => {

                        filtro.classList.remove(
                            'ativo'
                        );


                        if (
                            filtro.dataset.tipo ===
                            tipo
                        ) {

                            filtro.classList.add(
                                'ativo'
                            );

                        }

                    }
                );


                // Atualiza a lista
                await carregarAtividades();


            } catch (erro) {

                console.error(
                    'Erro ao cadastrar atividade:',
                    erro
                );


                mensagem.textContent =
                    'Não foi possível conectar ao servidor.';

            }

        }
    );

}


// =====================================================
// CONVERTER DURAÇÃO PARA HORAS
// =====================================================

function formatarDuracaoHoras(
    duracaoMin
) {

    const horas =
        Number(duracaoMin) / 60;


    return horas.toLocaleString(
        'pt-BR',
        {
            minimumFractionDigits: 1,
            maximumFractionDigits: 2
        }
    );

}


// =====================================================
// CALCULAR CALORIAS
// =====================================================

function calcularCalorias(
    tipo,
    distancia,
    duracao
) {

    let calorias = 0;


    switch (
        String(tipo).toLowerCase()
    ) {

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


    return Math.round(
        calorias
    );

}


// =====================================================
// CONFIGURAR FILTROS
// =====================================================

function configurarFiltros() {

    const filtros =
        document.querySelectorAll(
            '.filtro'
        );


    filtros.forEach(
        (filtro) => {

            filtro.addEventListener(
                'click',
                () => {

                    if (!usuarioLogado) {
                        return;
                    }


                    filtros.forEach(
                        (item) => {

                            item.classList.remove(
                                'ativo'
                            );

                        }
                    );


                    filtro.classList.add(
                        'ativo'
                    );


                    tipoAtual =
                        filtro.dataset.tipo;


                    paginaAtual = 1;


                    carregarAtividades();

                }
            );

        }
    );

}


// =====================================================
// PAGINAÇÃO
// =====================================================

function renderizarPaginacao(
    totalPaginas
) {

    const paginacao =
        document.getElementById(
            'paginacao'
        );


    paginacao.innerHTML = '';


    if (
        !totalPaginas ||
        totalPaginas <= 1
    ) {

        return;

    }


    for (
        let pagina = 1;
        pagina <= totalPaginas;
        pagina++
    ) {

        const botao =
            document.createElement(
                'button'
            );


        botao.type = 'button';


        botao.textContent =
            pagina;


        if (
            pagina === paginaAtual
        ) {

            botao.classList.add(
                'pagina-ativa'
            );

        }


        if (!usuarioLogado) {

            botao.disabled = true;

        }


        botao.addEventListener(
            'click',
            () => {

                if (!usuarioLogado) {
                    return;
                }


                paginaAtual =
                    pagina;


                carregarAtividades();

            }
        );


        paginacao.appendChild(
            botao
        );

    }

}


// =====================================================
// LOGIN
// =====================================================

function configurarLogin() {

    const btnLogin =
        document.getElementById(
            'btn-login'
        );


    const btnCancelar =
        document.getElementById(
            'btn-cancelar-login'
        );


    const modal =
        document.getElementById(
            'modal-login'
        );


    const form =
        document.getElementById(
            'form-login'
        );


    const mensagem =
        document.getElementById(
            'mensagem-login'
        );


    btnLogin.addEventListener(
        'click',
        () => {

            if (usuarioLogado) {

                fazerLogout();

                return;

            }


            mensagem.textContent = '';


            modal.classList.add(
                'aberto'
            );


            modal.setAttribute(
                'aria-hidden',
                'false'
            );

        }
    );


    btnCancelar.addEventListener(
        'click',
        () => {

            fecharModalLogin();

        }
    );


    form.addEventListener(
        'submit',
        async (evento) => {

            evento.preventDefault();


            const email =
                document
                    .getElementById(
                        'email'
                    )
                    .value
                    .trim();


            const senha =
                document
                    .getElementById(
                        'senha'
                    )
                    .value;


            mensagem.textContent = '';


            if (!email || !senha) {

                mensagem.textContent =
                    'E-mail e senha são obrigatórios.';

                return;

            }


            try {

                const resposta =
                    await fetch(
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


                if (!resposta.ok) {

                    mensagem.textContent =
                        dados.mensagem ||
                        'E-mail ou senha incorretos.';

                    return;

                }


                usuarioLogado =
                    dados.usuario;


                localStorage.setItem(
                    'usuarioLogado',
                    JSON.stringify(
                        usuarioLogado
                    )
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

        }
    );

}


// =====================================================
// FECHAR MODAL
// =====================================================

function fecharModalLogin() {

    const modal =
        document.getElementById(
            'modal-login'
        );


    const form =
        document.getElementById(
            'form-login'
        );


    const mensagem =
        document.getElementById(
            'mensagem-login'
        );


    modal.classList.remove(
        'aberto'
    );


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


    const filtros =
        document.querySelectorAll(
            '.filtro'
        );


    filtros.forEach(
        (filtro) => {

            filtro.classList.remove(
                'ativo'
            );


            if (
                filtro.dataset.tipo ===
                'corrida'
            ) {

                filtro.classList.add(
                    'ativo'
                );

            }

        }
    );


    carregarAtividades();


    console.log(
        'Logout realizado.'
    );

}


// =====================================================
// ATUALIZAR ESTADO DO LOGIN
// =====================================================

function atualizarEstadoLogin() {

    const btnLogin =
        document.getElementById(
            'btn-login'
        );


    const filtros =
        document.querySelectorAll(
            '.filtro'
        );


    if (usuarioLogado) {

        btnLogin.textContent =
            'Logout';

    } else {

        btnLogin.textContent =
            'Login';

    }


    filtros.forEach(
        (filtro) => {

            filtro.disabled =
                !usuarioLogado;

        }
    );


    const acoes =
        document.querySelectorAll(
            '.acao'
        );


    acoes.forEach(
        (acao) => {

            acao.disabled =
                !usuarioLogado;

        }
    );


    const botoesPagina =
        document.querySelectorAll(
            '#paginacao button'
        );


    botoesPagina.forEach(
        (botao) => {

            botao.disabled =
                !usuarioLogado;

        }
    );

}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

configurarFiltros();

configurarLogin();

configurarCadastroAtividade();

atualizarEstadoLogin();

carregarEmpresa();

carregarAtividades();