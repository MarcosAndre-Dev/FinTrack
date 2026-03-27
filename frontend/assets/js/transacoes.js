let tipoAtual = 'receita';

function setTipo(tipo) {
    tipoAtual = tipo;
    const tabR = document.getElementById('tab-receita');
    const tabD = document.getElementById('tab-despesa');
    const btn  = document.getElementById('btn-submit');
 
    tabR.className = 'tipo-tab' + (tipo === 'receita' ? ' active-receita' : '');
    tabD.className = 'tipo-tab' + (tipo === 'despesa' ? ' active-despesa' : '');
    btn.textContent = tipo === 'receita' ? '+ Adicionar Receita' : '+ Adicionar Despesa';
    btn.className = 'btn-submit' + (tipo === 'despesa' ? ' despesa-mode' : '');
    
    const select = document.getElementById('categoria');
    const grupos = select.querySelectorAll('optgroup');
 
    grupos.forEach(grupo => {
      const labelGrupo = grupo.label.toLowerCase();
      const visivel = labelGrupo.includes(tipo === 'receita' ? 'receita' : 'despesa');
      grupo.style.display = visivel ? '' : 'none';

      grupo.querySelectorAll('option').forEach(opt => {
        opt.disabled = !visivel;
      });
    });
    select.value = '';
  }

async function salvarTransacao() {
  const valor     = parseFloat(document.getElementById('valor').value);
  const categoria = document.getElementById('categoria').value;
  const descricao = document.getElementById('descricao').value;

  if (!valor || valor <= 0) return toast('Informe um valor válido.', true);
  if (!categoria)           return toast('Selecione uma categoria.', true);

  try {
    const res = await fetch(`${API_URL}/transacoes`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({tipo: tipoAtual, valor, categoria, descricao})
    });
    if (!res.ok) throw new Error();
    
    toast('✅ Transação salva com sucesso!');
    
    document.getElementById('valor').value = '';
    document.getElementById('descricao').value = '';
    document.getElementById('categoria').value = '';
    
    if(typeof carregarTudo === 'function') await carregarTudo();
    
  } catch {
    toast('Erro ao salvar. Verifique se a API está rodando.', true);
  }
}

async function deletarTransacao(id) {
  if (!confirm('Deseja excluir esta transação?')) return;
  try {
    const res = await fetch(`${API_URL}/transacoes/${id}`, {method: 'DELETE'});
    if (!res.ok) throw new Error();
    toast('🗑️ Transação removida.');
    
    if(typeof carregarTudo === 'function') await carregarTudo();
  } catch {
    toast('Erro ao deletar.', true);
  }
}

function renderHistorico(transacoes) {
  const list = document.getElementById('historico-list');
  if (!transacoes.length) {
    list.innerHTML = '<div class="empty-state">Nenhuma transação ainda.</div>';
    return;
  }
  list.innerHTML = transacoes.map(t => `
    <div class="tx-item">
      <div class="tx-dot ${t.tipo}"></div>
      <div class="tx-info">
        <div class="tx-desc">${t.descricao || t.categoria}</div>
        <div class="tx-meta">${t.categoria} · ${new Date(t.data + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
      </div>
      <div class="tx-valor ${t.tipo}">${t.tipo === 'receita' ? '+' : '-'}${fmt(t.valor)}</div>
      <button class="tx-delete" onclick="deletarTransacao(${t.id})" title="Excluir">✕</button>
    </div>
  `).join('');
}