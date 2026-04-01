let todasTransacoes = [];
let idParaDeletar = null;
let descParaDeletar = '';

function filtrar(tipo, btn) {
  document.querySelectorAll('.filtro-btn').forEach(b => b.className = 'filtro-btn');
  if (tipo === 'receita') btn.className = 'filtro-btn active';
  else if (tipo === 'despesa') btn.className = 'filtro-btn active-despesa';
  else btn.className = 'filtro-btn active';

  const filtradas = tipo === 'todos'
    ? todasTransacoes
    : todasTransacoes.filter(t => t.tipo === tipo);

  renderizar(filtradas);
}

function abrirModal(id, desc) {
  idParaDeletar = id;
  descParaDeletar = desc;
  document.getElementById('modal-desc').innerHTML =
    `Tem certeza que deseja excluir <strong>"${desc}"</strong>? Esta ação não pode ser desfeita.`;
  document.getElementById('modal-overlay').classList.add('show');
}

function fecharModal() {
  document.getElementById('modal-overlay').classList.remove('show');
  idParaDeletar = null;
}

async function confirmarDelete() {
  if (!idParaDeletar) return;
  
  const idSeguro = idParaDeletar; 
  
  fecharModal(); 
  
  try {
    const res = await fetch(`${API_URL}/transacoes/${idSeguro}`, { method: 'DELETE' });
    
    if (!res.ok) throw new Error();
    toast('🗑️ Transação removida com sucesso.');
    if (typeof carregar === 'function') await carregar();
    if (typeof carregarTudo === 'function') await carregarTudo();
    
  } catch {
    toast('Erro ao deletar transação.', true);
  }
}

function renderizar(lista) {
  const container = document.getElementById('tx-list');
  if (!container) return; 
  
  document.getElementById('page-count').textContent = `${lista.length} transação${lista.length !== 1 ? 'ões' : ''}`;

  if (!lista.length) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">◎</span>
        Nenhuma transação encontrada.
      </div>`;
    return;
  }

  container.innerHTML = lista.map((t, i) => `
    <div class="tx-item ${t.tipo}" style="animation-delay:${i * 40}ms">
      <div class="tx-dot ${t.tipo}"></div>
      <div class="tx-info">
        <div class="tx-desc">${t.descricao || t.categoria}</div>
        <div class="tx-meta">
          <span class="tx-tag">${t.categoria}</span>
          <span>${new Date(t.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>
      <div class="tx-valor ${t.tipo}">${t.tipo === 'receita' ? '+' : '-'}${fmt(t.valor)}</div>
      <button class="tx-delete" onclick="abrirModal(${t.id}, '${(t.descricao || t.categoria).replace(/'/g, "\\'")}')" title="Excluir transação">
        <svg class="icon-trash" viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14H6L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
      </button>
    </div>
  `).join('');
}

async function carregar() {
  try {
    const res = await fetch(`${API_URL}/transacoes`);
    todasTransacoes = await res.json();
    renderizar(todasTransacoes);
  } catch {
    toast('Não foi possível conectar à API.', true);
  }
}

const modalOverlay = document.getElementById('modal-overlay');
if (modalOverlay) {
  modalOverlay.addEventListener('click', function(e) {
    if (e.target === this) fecharModal();
  });
}

if (document.getElementById('tx-list')) {
  carregar();
}