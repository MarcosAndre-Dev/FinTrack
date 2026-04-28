const fmt = v => 'R$ ' + parseFloat(v).toLocaleString('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function toast(msg, err = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'show' + (err ? ' error' : '');
  setTimeout(() => el.className = '', 3000);
}

(function authGuard() {
  const token = sessionStorage.getItem('token');
  if (!token) {
    window.location.href = '/frontend/pages/login.html';
  }
})();

window.addEventListener('load', function() {
  const nome = sessionStorage.getItem('usuario_nome');
  const el = document.getElementById('usuario-nome');
  if (el && nome) el.textContent = nome;
});
function logout() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('usuario_nome');
  window.location.href = '/frontend/pages/login.html';
}