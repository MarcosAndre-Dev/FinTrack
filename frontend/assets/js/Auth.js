function mostrarErro(msg) {
  const el = document.getElementById('erro-msg');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = '';
}

function esconderErro() {
  const el = document.getElementById('erro-msg');
  if (el) el.style.display = 'none';
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const text   = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  btn.disabled = loading;
  if (text)   text.style.display   = loading ? 'none'   : '';
  if (loader) loader.style.display = loading ? 'inline' : 'none';
}

function toggleSenha(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.innerHTML = isHidden
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
       </svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
       </svg>`;
}

function mostrarForca(senha) {
  const wrap  = document.getElementById('senha-strength');
  const fill  = document.getElementById('strength-fill');
  const label = document.getElementById('strength-label');
  if (!wrap || !fill || !label) return;

  if (!senha) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'flex';

  let score = 0;
  if (senha.length >= 6)  score++;
  if (senha.length >= 10) score++;
  if (/[A-Z]/.test(senha)) score++;
  if (/[0-9]/.test(senha)) score++;
  if (/[^A-Za-z0-9]/.test(senha)) score++;

  const levels = [
    { pct: '20%', color: '#ff6b6b', text: 'Fraca' },
    { pct: '40%', color: '#ff6b6b', text: 'Fraca' },
    { pct: '60%', color: '#ffd166', text: 'Média' },
    { pct: '80%', color: '#ffd166', text: 'Boa' },
    { pct: '100%', color: '#00e5a0', text: 'Forte' },
  ];
  const lv = levels[Math.min(score, 4)];
  fill.style.width      = lv.pct;
  fill.style.background = lv.color;
  label.textContent     = lv.text;
  label.style.color     = lv.color;
}


async function fazerLogin() {
  esconderErro();

  const email = document.getElementById('email')?.value.trim();
  const senha = document.getElementById('senha')?.value;

  if (!email || !senha) {
    mostrarErro('Preencha todos os campos.');
    return;
  }

  setLoading('btn-login', true);

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarErro(data.detail || 'E-mail ou senha incorretos.');
      return;
    }

    // Salva token e dados do usuário corretamente
    sessionStorage.setItem('token', data.access_token);
    sessionStorage.setItem('usuario_nome', data.user.nome);
    sessionStorage.setItem('usuario_id', data.user.id);
    window.location.href = '/';

  } catch {
    mostrarErro('Erro de conexão. Tente novamente.');
  } finally {
    setLoading('btn-login', false);
  }
}


async function fazerCadastro() {
  esconderErro();

  const nome      = document.getElementById('nome')?.value.trim();
  const email     = document.getElementById('email')?.value.trim();
  const senha     = document.getElementById('senha')?.value;
  const confirmar = document.getElementById('confirmar')?.value;

  if (!nome || !email || !senha || !confirmar) {
    mostrarErro('Preencha todos os campos.');
    return;
  }

  if (senha.length < 6) {
    mostrarErro('A senha deve ter no mínimo 6 caracteres.');
    return;
  }

  if (senha !== confirmar) {
    mostrarErro('As senhas não coincidem.');
    return;
  }

  setLoading('btn-register', true);

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarErro(data.detail || 'Erro ao criar conta.');
      return;
    }

    sessionStorage.setItem('cadastro_ok', '1');
    window.location.href = '/frontend/pages/login.html';

  } catch {
    mostrarErro('Erro de conexão. Tente novamente.');
  } finally {
    setLoading('btn-register', false);
  }
}


document.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter') return;
  if (document.getElementById('btn-login'))    fazerLogin();
  if (document.getElementById('btn-register')) fazerCadastro();
});


window.addEventListener('load', function() {
  if (sessionStorage.getItem('cadastro_ok')) {
    sessionStorage.removeItem('cadastro_ok');
    const el = document.getElementById('erro-msg');
    if (el) {
      el.textContent = '✓ Conta criada! Faça o login.';
      el.style.display = 'block';
      el.style.background = 'rgba(0,229,160,.1)';
      el.style.borderColor = 'rgba(0,229,160,.3)';
      el.style.color = '#00e5a0';
    }
  }
});