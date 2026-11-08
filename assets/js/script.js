/* =========================================================
   1. ESTADO DA APLICAÇÃO, DADOS INICIAIS E LOCALSTORAGE
   ========================================================= */
const STORAGE_KEY = 'diario_celeste_partidas_v1';

const MAPA_CAMPEONATOS = {
    Brasileirao: 'Brasileirão Série A',
    CopaDoBrasil: 'Copa do Brasil',
    Libertadores: 'Copa Libertadores',
    Sulamericana: 'Copa Sul-Americana',
    Mineiro: 'Campeonato Mineiro',
    Amistoso: 'Amistoso'
};

const MAPA_RESULTADOS = {
    vitoria: 'Vitória',
    empate: 'Empate',
    derrota: 'Derrota'
};

const PARTIDAS_INICIAIS = [
    {
        id: 1713139200001,
        dataJogo: '2026-04-14',
        campeonato: 'Brasileirao',
        adversario: 'Botafogo',
        golsCruzeiro: 3,
        golsAdversario: 0,
        resultado: 'vitoria',
        avaliacao: 5,
        observacoes: 'Jogaço! Domínio total desde o primeiro minuto no Mineirão.',
        estadioApi: 'Estádio Nilton Santos / Mineirão',
        paisApi: 'Brasil'
    },
    {
        id: 1724371200002,
        dataJogo: '2026-08-22',
        campeonato: 'Libertadores',
        adversario: 'Boca Juniors',
        golsCruzeiro: 2,
        golsAdversario: 1,
        resultado: 'vitoria',
        avaliacao: 5,
        observacoes: 'Noite mágica de copa! Grande atuação coletiva e vitória fundamental.',
        estadioApi: 'La Bombonera / Mineirão',
        paisApi: 'Argentina'
    }
];

let partidas = [];
let idEmEdicao = null;
let dadosApiSelecionados = null;

// Seletores principais do DOM
const secaoCadastro = document.getElementById('cadastro');
const tituloCadastro = secaoCadastro.querySelector('h2');
const formCadastro = secaoCadastro.querySelector('form');
const btnSubmit = formCadastro.querySelector('button[type="submit"]');

const inputDataJogo = document.getElementById('dataJogo');
const selectCampeonato = document.getElementById('campeonato');
const inputAdversario = document.getElementById('adversario');
const inputGolsCruzeiro = document.getElementById('golsCruzeiro');
const inputGolsAdversario = document.getElementById('golsAdversario');
const selectResultado = document.getElementById('resultado');
const inputAvaliacao = document.getElementById('avaliacao');
const inputObservacoes = document.getElementById('observacoes');

const inputPesquisa = document.getElementById('pesquisa');
const btnBuscar = document.querySelector('#controles button');
const selectFiltroCampeonato = document.getElementById('filtroCampeonato');
const selectOrdenacao = document.getElementById('ordenacao');

const listagemEl = document.getElementById('listagem');
const detalhesAside = document.getElementById('detalhes-item');
const detalheCard = detalhesAside.querySelector('.detalhe-card');

// Funções de Persistência (localStorage)
function carregarDados() {
    const dadosSalvos = localStorage.getItem(STORAGE_KEY);
    if (dadosSalvos) {
        try {
            partidas = JSON.parse(dadosSalvos);
        } catch (erro) {
            partidas = [...PARTIDAS_INICIAIS];
            salvarDados();
        }
    } else {
        partidas = [...PARTIDAS_INICIAIS];
        salvarDados();
    }
}

function salvarDados() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(partidas));
}

// Utilitários de Formatação e Feedback Visual
function formatarData(dataISO) {
    if (!dataISO) return '';
    const partes = dataISO.split('-');
    if (partes.length !== 3) return dataISO;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

const caixaFeedback = document.createElement('div');
caixaFeedback.id = 'mensagem-feedback';
caixaFeedback.style.display = 'none';
caixaFeedback.style.padding = '0.85rem 1.25rem';
caixaFeedback.style.marginBottom = '1.25rem';
caixaFeedback.style.borderRadius = '8px';
caixaFeedback.style.fontWeight = '600';
secaoCadastro.insertBefore(caixaFeedback, formCadastro);

function mostrarFeedback(mensagem, tipo = 'sucesso') {
    caixaFeedback.textContent = mensagem;
    caixaFeedback.style.display = 'block';
    if (tipo === 'erro') {
        caixaFeedback.style.backgroundColor = '#fee2e2';
        caixaFeedback.style.color = '#991b1b';
        caixaFeedback.style.borderLeft = '5px solid #dc2626';
    } else {
        caixaFeedback.style.backgroundColor = '#dcfce7';
        caixaFeedback.style.color = '#166534';
        caixaFeedback.style.borderLeft = '5px solid #15803d';
    }
    clearTimeout(caixaFeedback.timer);
    caixaFeedback.timer = setTimeout(() => {
        caixaFeedback.style.display = 'none';
    }, 4500);
}

// Renderização Dinâmica da Listagem
function renderizarLista(listaParaExibir = partidas) {
    listagemEl.innerHTML = '';

    if (listaParaExibir.length === 0) {
        const avisoVazio = document.createElement('p');
        avisoVazio.textContent = 'Nenhuma partida encontrada para os critérios selecionados.';
        avisoVazio.style.gridColumn = '1 / -1';
        avisoVazio.style.padding = '1.5rem';
        avisoVazio.style.backgroundColor = '#ffffff';
        avisoVazio.style.borderRadius = '8px';
        avisoVazio.style.textAlign = 'center';
        listagemEl.appendChild(avisoVazio);
        return;
    }

    listaParaExibir.forEach((partida) => {
        const artigo = document.createElement('article');
        const nomeCampeonato = MAPA_CAMPEONATOS[partida.campeonato] || partida.campeonato;
        const textoResultado = MAPA_RESULTADOS[partida.resultado] || partida.resultado;
        const estrelas = partida.avaliacao ? '⭐'.repeat(Number(partida.avaliacao)) : 'Sem nota';

        artigo.innerHTML = `
            <h3>Cruzeiro ${partida.golsCruzeiro} x ${partida.golsAdversario} ${partida.adversario}</h3>
            <p><strong>Data:</strong> ${formatarData(partida.dataJogo)}</p>
            <p><strong>Campeonato:</strong> ${nomeCampeonato}</p>
            <p><strong>Resultado:</strong> ${textoResultado}</p>
            <p><strong>Avaliação:</strong> ${estrelas}</p>
            <button type="button" data-acao="detalhes" data-id="${partida.id}">Ver detalhes</button>
            <button type="button" data-acao="editar" data-id="${partida.id}">Editar</button>
            <button type="button" data-acao="excluir" data-id="${partida.id}">Excluir</button>
        `;
        listagemEl.appendChild(artigo);
    });
}

function atualizarInterface() {
    if (typeof aplicarFiltrosEOrdenacao === 'function') {
        aplicarFiltrosEOrdenacao();
    } else {
        renderizarLista(partidas);
    }
}

// Inicialização da aplicação
detalhesAside.style.display = 'none';
carregarDados();
atualizarInterface();

/* =========================================================
   2. CADASTRO, VALIDAÇÃO E VISUALIZAÇÃO DE DETALHES
   ========================================================= */
// Atualiza automaticamente o select de Resultado conforme o placar digitado
function atualizarResultadoAutomatico() {
    if (inputGolsCruzeiro.value === '' || inputGolsAdversario.value === '') return;
    const golsC = parseInt(inputGolsCruzeiro.value, 10);
    const golsA = parseInt(inputGolsAdversario.value, 10);

    if (golsC > golsA) {
        selectResultado.value = 'vitoria';
    } else if (golsC === golsA) {
        selectResultado.value = 'empate';
    } else {
        selectResultado.value = 'derrota';
    }
}

inputGolsCruzeiro.addEventListener('input', atualizarResultadoAutomatico);
inputGolsAdversario.addEventListener('input', atualizarResultadoAutomatico);

// Submissão do formulário (Cadastro e Edição)
formCadastro.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const dataJogo = inputDataJogo.value;
    const campeonato = selectCampeonato.value;
    const adversario = inputAdversario.value.trim();
    const golsCruzeiro = parseInt(inputGolsCruzeiro.value, 10);
    const golsAdversario = parseInt(inputGolsAdversario.value, 10);
    const avaliacao = inputAvaliacao.value ? parseInt(inputAvaliacao.value, 10) : 5;
    const observacoes = inputObservacoes.value.trim();

    // Validações
    if (!dataJogo || !campeonato || !adversario) {
        mostrarFeedback('Por favor, preencha a data, o campeonato e o time adversário.', 'erro');
        return;
    }

    if (isNaN(golsCruzeiro) || golsCruzeiro < 0 || isNaN(golsAdversario) || golsAdversario < 0) {
        mostrarFeedback('Informe um número válido de gols (maior ou igual a zero).', 'erro');
        return;
    }

    if (avaliacao < 1 || avaliacao > 5) {
        mostrarFeedback('A avaliação de desempenho deve ser uma nota entre 1 e 5.', 'erro');
        return;
    }

    // Garante que o resultado condiz com o placar informado
    let resultadoCalculado = 'empate';
    if (golsCruzeiro > golsAdversario) resultadoCalculado = 'vitoria';
    if (golsCruzeiro < golsAdversario) resultadoCalculado = 'derrota';
    selectResultado.value = resultadoCalculado;

    if (idEmEdicao !== null) {
        const indice = partidas.findIndex((p) => p.id === idEmEdicao);
        if (indice !== -1) {
            partidas[indice] = {
                ...partidas[indice],
                dataJogo,
                campeonato,
                adversario,
                golsCruzeiro,
                golsAdversario,
                resultado: resultadoCalculado,
                avaliacao,
                observacoes: observacoes || 'Sem observações registradas.',
                estadioApi: dadosApiSelecionados?.estadio || partidas[indice].estadioApi || 'Não informado',
                paisApi: dadosApiSelecionados?.pais || partidas[indice].paisApi || 'Brasil'
            };
        }
        salvarDados();
        atualizarInterface();
        mostrarFeedback(`Partida contra ${adversario} atualizada com sucesso!`);
        if (typeof cancelarEdicao === 'function') cancelarEdicao();
    } else {
        const novaPartida = {
            id: Date.now(),
            dataJogo,
            campeonato,
            adversario,
            golsCruzeiro,
            golsAdversario,
            resultado: resultadoCalculado,
            avaliacao,
            observacoes: observacoes || 'Sem observações registradas.',
            estadioApi: dadosApiSelecionados?.estadio || 'Mineirão / A definir',
            paisApi: dadosApiSelecionados?.pais || 'Brasil'
        };

        partidas.push(novaPartida);
        salvarDados();
        atualizarInterface();
        formCadastro.reset();
        dadosApiSelecionados = null;
        mostrarFeedback(`Partida "Cruzeiro ${golsCruzeiro} x ${golsAdversario} ${adversario}" cadastrada com sucesso!`);
    }
});

// Exibição de Detalhes de uma Partida
function verDetalhes(id) {
    const partida = partidas.find((p) => p.id === id);
    if (!partida) return;

    const nomeCampeonato = MAPA_CAMPEONATOS[partida.campeonato] || partida.campeonato;
    const textoResultado = MAPA_RESULTADOS[partida.resultado] || partida.resultado;

    detalheCard.innerHTML = `
        <h3>Cruzeiro ${partida.golsCruzeiro} x ${partida.golsAdversario} ${partida.adversario}</h3>
        <p><strong>Data:</strong> ${formatarData(partida.dataJogo)}</p>
        <p><strong>Campeonato:</strong> ${nomeCampeonato}</p>
        <p><strong>Gols do Cruzeiro:</strong> ${partida.golsCruzeiro}</p>
        <p><strong>Gols do Adversário:</strong> ${partida.golsAdversario}</p>
        <p><strong>Resultado:</strong> ${textoResultado}</p>
        <p><strong>Avaliação Pessoal:</strong> ${partida.avaliacao} / 5 (${'⭐'.repeat(Number(partida.avaliacao))})</p>
        <p><strong>Estádio / Origem (API):</strong> ${partida.estadioApi || 'Não informado'} (${partida.paisApi || 'Brasil'})</p>
        <p><strong>Observações:</strong> ${partida.observacoes}</p>
        <button type="button" id="btn-fechar-detalhes">Fechar Detalhes</button>
    `;

    detalhesAside.style.display = 'block';
    detalhesAside.scrollIntoView({ behavior: 'smooth', block: 'center' });

    document.getElementById('btn-fechar-detalhes').addEventListener('click', () => {
        detalhesAside.style.display = 'none';
    });
}

/* =========================================================
   3. EDIÇÃO E EXCLUSÃO DE PARTIDAS
   ========================================================= */
const btnCancelarEdicao = document.createElement('button');
btnCancelarEdicao.type = 'button';
btnCancelarEdicao.textContent = 'Cancelar Edição';
btnCancelarEdicao.style.display = 'none';
btnCancelarEdicao.style.gridColumn = '1 / -1';
btnCancelarEdicao.style.backgroundColor = '#64748b';
btnCancelarEdicao.style.color = '#ffffff';
formCadastro.appendChild(btnCancelarEdicao);

function prepararEdicao(id) {
    const partida = partidas.find((p) => p.id === id);
    if (!partida) return;

    idEmEdicao = partida.id;
    inputDataJogo.value = partida.dataJogo;
    selectCampeonato.value = partida.campeonato;
    inputAdversario.value = partida.adversario;
    inputGolsCruzeiro.value = partida.golsCruzeiro;
    inputGolsAdversario.value = partida.golsAdversario;
    selectResultado.value = partida.resultado;
    inputAvaliacao.value = partida.avaliacao;
    inputObservacoes.value = partida.observacoes === 'Sem observações registradas.' ? '' : partida.observacoes;

    tituloCadastro.textContent = `Editando: Cruzeiro x ${partida.adversario}`;
    btnSubmit.textContent = 'Atualizar Partida';
    btnCancelarEdicao.style.display = 'block';

    secaoCadastro.scrollIntoView({ behavior: 'smooth' });
    mostrarFeedback(`Modo de edição ativado para a partida contra ${partida.adversario}.`);
}

function cancelarEdicao() {
    idEmEdicao = null;
    dadosApiSelecionados = null;
    formCadastro.reset();
    tituloCadastro.textContent = 'Registrar Nova Partida';
    btnSubmit.textContent = 'Salvar Partida';
    btnCancelarEdicao.style.display = 'none';
}

btnCancelarEdicao.addEventListener('click', cancelarEdicao);

function excluirPartida(id) {
    const partida = partidas.find((p) => p.id === id);
    if (!partida) return;

    const confirmou = window.confirm(
        `Tem certeza que deseja excluir a partida "Cruzeiro ${partida.golsCruzeiro} x ${partida.golsAdversario} ${partida.adversario}"?`
    );

    if (!confirmou) return;

    partidas = partidas.filter((p) => p.id !== id);
    salvarDados();
    atualizarInterface();

    if (idEmEdicao === id) cancelarEdicao();
    detalhesAside.style.display = 'none';
    mostrarFeedback('Partida excluída com sucesso!');
}

// Delegação de eventos para os botões de cada card na listagem
listagemEl.addEventListener('click', function (evento) {
    const botao = evento.target.closest('button[data-acao]');
    if (!botao) return;

    const acao = botao.getAttribute('data-acao');
    const id = Number(botao.getAttribute('data-id'));

    if (acao === 'detalhes') verDetalhes(id);
    if (acao === 'editar') prepararEdicao(id);
    if (acao === 'excluir') excluirPartida(id);
});