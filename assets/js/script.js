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