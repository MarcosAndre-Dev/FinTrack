


// conselhos.js – Recomendações financeiras via Groq
// Histórico mantido em memória (sessionStorage) durante a sessão

const HISTORICO_KEY = 'ft_conselhos_historico';

function getHistorico() {
  try {
    return JSON.parse(sessionStorage.getItem(HISTORICO_KEY) || '[]');
  } catch {
    return [];
  }
}

function salvarHistorico(lista) {
  sessionStorage.setItem(HISTORICO_KEY, JSON.stringify(lista));
}

function adicionarAoHistorico(conselho, contexto) {
  const lista = getHistorico();
  lista.unshift({
    id: Date.now(),
    conselho,
    contexto,
    gerado_em: new Date().toLocaleString('pt-BR'),
  });
  // Mantém no máximo 20 conselhos no histórico da sessão
  salvarHistorico(lista.slice(0, 20));
}

// ─── Renderização ────────────────────────────────────────────────

function renderConselhoAtual(conselho, contexto) {
  const box = document.getElementById('conselho-atual');
  if (!box) return;

  const linhas = conselho
    .split('\n')
    .filter(l => l.trim())
    .map(l => `<p class="conselho-linha">${l.trim()}</p>`)
    .join('');

  box.innerHTML = `
    <div class="conselho-card conselho-card--novo">
      <div class="conselho-header">
        <span class="conselho-badge">✦ IA Groq</span>
        <span class="conselho-ts">${new Date().toLocaleString('pt-BR')}</span>
      </div>
      <div class="conselho-corpo">${linhas}</div>
      <div class="conselho-meta">
        <span>📊 ${contexto.total_transacoes} transações analisadas</span>
        <span>💰 Saldo: ${fmt(contexto.receitas - contexto.despesas)}</span>
      </div>
    </div>`;
}

function renderHistoricoConselhos() {
  const container = document.getElementById('conselhos-historico');
  const secao = document.getElementById('secao-historico-conselhos');
  if (!container) return;

  const lista = getHistorico();
  const anteriores = lista.slice(1); // o [0] já aparece no painel atual

  if (!secao) return;
  secao.style.display = anteriores.length > 0 ? 'block' : 'none';

  if (anteriores.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = anteriores.map((item, i) => {
    const linhas = item.conselho
      .split('\n')
      .filter(l => l.trim())
      .map(l => `<p class="conselho-linha">${l.trim()}</p>`)
      .join('');
    return `
      <details class="conselho-hist-item" ${i === 0 ? 'open' : ''}>
        <summary class="conselho-hist-summary">
          <span class="hist-ts">${item.gerado_em}</span>
          <span class="hist-meta">${item.contexto.total_transacoes} transações · Saldo ${fmt(item.contexto.receitas - item.contexto.despesas)}</span>
          <span class="hist-arrow">▾</span>
        </summary>
        <div class="conselho-hist-corpo">${linhas}</div>
      </details>`;
  }).join('');
}

function atualizarContadorHistorico() {
  const n = getHistorico().length;
  const el = document.getElementById('conselhos-contador');
  if (el) el.textContent = n > 0 ? `${n} nesta sessão` : '';
}

// ─── Ação principal ──────────────────────────────────────────────

async function gerarConselho() {
  const btn = document.getElementById('btn-gerar-conselho');
  const box = document.getElementById('conselho-atual');
  if (!btn || !box) return;

  // Estado de loading
  btn.disabled = true;
  btn.innerHTML = `<span class="btn-loader-dot"></span> Analisando...`;
  box.innerHTML = `
    <div class="conselho-loading">
      <div class="loading-dots"><span></span><span></span><span></span></div>
      <p>Consultando a IA com seus dados financeiros...</p>
    </div>`;

  try {
    const res = await apiFetch('/conselhos/gerar', { method: 'POST' });

    if (!res) return; // apiFetch já redireciona se 401

    const data = await res.json();

    if (!res.ok) {
      box.innerHTML = `<div class="conselho-erro">⚠ ${data.detail || 'Erro ao gerar conselho.'}</div>`;
      toast(data.detail || 'Erro ao gerar conselho.', true);
      return;
    }

    adicionarAoHistorico(data.conselho, data.contexto_resumo);
    renderConselhoAtual(data.conselho, data.contexto_resumo);
    renderHistoricoConselhos();
    atualizarContadorHistorico();
    toast('✦ Novo conselho gerado!');

  } catch {
    box.innerHTML = `<div class="conselho-erro">⚠ Erro de conexão. Verifique se a API está rodando.</div>`;
    toast('Erro ao conectar com a API.', true);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `✦ Gerar Novo Conselho`;
  }
}

// ─── Init ────────────────────────────────────────────────────────

function iniciarTelaConselhos() {
  const lista = getHistorico();
  const box = document.getElementById('conselho-atual');

  if (lista.length > 0 && box) {
    // Restaura o último conselho da sessão
    renderConselhoAtual(lista[0].conselho, lista[0].contexto);
  } else if (box) {
    box.innerHTML = `
      <div class="conselhos-empty">
        <span class="empty-icon">✦</span>
        Clique em <strong>Gerar Novo Conselho</strong> para receber recomendações personalizadas baseadas nas suas transações.
      </div>`;
  }

  renderHistoricoConselhos();
  atualizarContadorHistorico();
}