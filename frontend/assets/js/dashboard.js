let chartPizza = null;
let chartBarras = null;

async function carregarConselhoGemini() {
  const dicaBox = document.getElementById('dica-box');
  const dicaText = document.getElementById('dica-text');
  
  dicaBox.style.display = 'block';
  dicaText.textContent = 'Analisando suas finanças...';

  try {
    const token = sessionStorage.getItem('token'); // ← corrigido aqui
    const res = await fetch('/conselhos/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    dicaText.textContent = data.conselho;
  } catch (e) {
    dicaText.textContent = 'Não foi possível carregar o conselho financeiro.';
  }
}

function renderResumo(r) {
  document.getElementById('total-receitas').textContent = fmt(r.receitas);
  document.getElementById('total-despesas').textContent = fmt(r.despesas);

  const saldoEl = document.getElementById('total-saldo');
  saldoEl.textContent = fmt(r.saldo);
  saldoEl.className = 'saldo-value ' + (r.saldo >= 0 ? 'green' : 'red');

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

let dbFiltroMes = null;
let dbFiltroAno = null;
let chartEvolucao = null;

async function carregarTudo() {
  let resumoUrl = '/transacoes/resumo';
  let transacoesUrl = '/transacoes/';
  const params = [];
  if (dbFiltroMes) params.push(`mes=${dbFiltroMes}`);
  if (dbFiltroAno) params.push(`ano=${dbFiltroAno}`);
  if (params.length) {
    const qs = '?' + params.join('&');
    resumoUrl += qs;
    transacoesUrl += qs;
  }

  try {
    const res = await apiFetch(resumoUrl);
    if (res && res.ok) {
      const resumo = await res.json();
      renderResumo(resumo);
    }
  } catch (e) {
    toast('Não foi possível carregar o resumo.', true);
  }
  
  carregarConselhoGemini();

  if (typeof renderHistorico === 'function') {
    try {
      const res = await apiFetch(transacoesUrl);
      if (res && res.ok) {
        const data = await res.json();
        renderHistorico(data.transacoes || []);
      }
    } catch {
      toast('Não foi possível carregar as transações.', true);
    }
  }

  await carregarEvolucao();
}

async function limparFiltroDashboard() {
  const el = document.getElementById('dashboard-filtro-mes-ano');
  if (el) el.value = '';
  dbFiltroMes = null;
  dbFiltroAno = null;
  await carregarTudo();
}

async function carregarEvolucao() {
  try {
    const res = await apiFetch('/transacoes/evolucao');
    if (!res || !res.ok) return;
    const data = await res.json();
    renderEvolucao(data);
  } catch (e) {
    console.error("Erro ao carregar evolução:", e);
  }
}

function renderEvolucao(evolucao) {
  const canvas = document.getElementById('chartEvolucao');
  if (!canvas) return;
  
  if (chartEvolucao) chartEvolucao.destroy();
  
  const labels = evolucao.map(item => item.mes_nome);
  const receitas = evolucao.map(item => item.receitas);
  const despesas = evolucao.map(item => item.despesas);
  const saldos = evolucao.map(item => item.saldo);
  
  chartEvolucao = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Receitas',
          data: receitas,
          backgroundColor: 'rgba(0, 229, 160, 0.4)',
          borderColor: '#00e5a0',
          borderWidth: 2,
          borderRadius: 4,
        },
        {
          label: 'Despesas',
          data: despesas,
          backgroundColor: 'rgba(255, 107, 107, 0.4)',
          borderColor: '#ff6b6b',
          borderWidth: 2,
          borderRadius: 4,
        },
        {
          label: 'Saldo',
          data: saldos,
          type: 'line',
          borderColor: '#ffd166',
          borderWidth: 3,
          backgroundColor: 'transparent',
          tension: 0.3,
          pointBackgroundColor: '#ffd166',
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: '#7a7f94', font: { family: 'DM Mono', size: 10 } }
        }
      },
      scales: {
        x: {
          ticks: { color: '#7a7f94', font: { family: 'DM Mono' } },
          grid: { color: '#2a2d36' }
        },
        y: {
          ticks: {
            color: '#7a7f94',
            font: { family: 'DM Mono' },
            callback: v => 'R$ ' + v
          },
          grid: { color: '#2a2d36' }
        }
      }
    }
  });
}

window.addEventListener('load', () => {
  const dbFiltroInput = document.getElementById('dashboard-filtro-mes-ano');
  if (dbFiltroInput) {
    dbFiltroInput.addEventListener('change', async (e) => {
      const val = e.target.value;
      if (val) {
        const [ano, mes] = val.split('-');
        dbFiltroMes = parseInt(mes);
        dbFiltroAno = parseInt(ano);
      } else {
        dbFiltroMes = null;
        dbFiltroAno = null;
      }
      await carregarTudo();
    });
  }
});