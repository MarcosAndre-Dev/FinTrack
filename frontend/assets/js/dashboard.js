let chartPizza = null;
let chartBarras = null;

function renderResumo(r) {
  document.getElementById('total-receitas').textContent = fmt(r.receitas);
  document.getElementById('total-despesas').textContent = fmt(r.despesas);

  const saldoEl = document.getElementById('total-saldo');
  saldoEl.textContent = fmt(r.saldo);
  saldoEl.className = 'saldo-value ' + (r.saldo >= 0 ? 'green' : 'red');

  if (r.dica_economia) {
    document.getElementById('dica-box').style.display = 'block';
    document.getElementById('dica-text').textContent = r.dica_economia;
  } else {
    document.getElementById('dica-box').style.display = 'none';
  }

  const cats  = r.categorias_despesa.map(c => c.categoria);
  const vals  = r.categorias_despesa.map(c => c.total);
  const cores = ['#ff6b6b','#ffd166','#06d6a0','#118ab2','#9b5de5','#f15bb5','#00bbf9','#00f5d4'];

  if (chartPizza) chartPizza.destroy();
  chartPizza = new Chart(document.getElementById('chartPizza'), {
    type: 'doughnut',
    data: {
      labels: cats,
      datasets: [{data: vals, backgroundColor: cores, borderColor: '#1a1d24', borderWidth: 2}]
    },
    options: {
      plugins: {legend: {labels: {color: '#7a7f94', font: {family: 'DM Mono', size: 10}}}},
      cutout: '60%'
    }
  });

  if (chartBarras) chartBarras.destroy();
  chartBarras = new Chart(document.getElementById('chartBarras'), {
    type: 'bar',
    data: {
      labels: ['Receitas', 'Despesas'],
      datasets: [{
        data: [r.receitas, r.despesas],
        backgroundColor: ['rgba(0,229,160,0.2)', 'rgba(255,107,107,0.2)'],
        borderColor: ['#00e5a0', '#ff6b6b'],
        borderWidth: 2,
        borderRadius: 6,
      }]
    },
    options: {
      plugins: {legend: {display: false}},
      scales: {
        x: {ticks: {color: '#7a7f94', font: {family: 'DM Mono'}}, grid: {color: '#2a2d36'}},
        y: {ticks: {color: '#7a7f94', font: {family: 'DM Mono'}, callback: v => 'R$' + v}, grid: {color: '#2a2d36'}}
      }
    }
  });

  const catList = document.getElementById('cat-list');
  if (!r.categorias_despesa.length) {
    catList.innerHTML = '<div class="empty-state">Sem despesas registradas.</div>';
    return;
  }
  const max = r.categorias_despesa[0].total;
  catList.innerHTML = r.categorias_despesa.slice(0, 6).map(c => `
    <div class="cat-item">
      <div class="cat-name">${c.categoria}</div>
      <div class="cat-bar-wrap">
        <div class="cat-bar" style="width:${(c.total / max * 100).toFixed(1)}%"></div>
      </div>
      <div class="cat-val">${fmt(c.total)}</div>
    </div>
  `).join('');
}

// CORREÇÃO AQUI: Agora ele carrega os gráficos E a pequena lista de histórico da home
async function carregarTudo() {
  const resumo = await carregarResumo();
  if (resumo) renderResumo(resumo);
  
  if (typeof renderHistorico === 'function') {
    const transacoes = await carregarTransacoes();
    renderHistorico(transacoes);
  }
}