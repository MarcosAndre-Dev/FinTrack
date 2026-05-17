const API_URL = window.location.origin;

function authHeaders() {
  const token = sessionStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
    cache: 'no-store',
  });

  if (res.status === 401) {
    sessionStorage.removeItem('token');
    window.location.href = '/frontend/pages/login.html';
    return null;
  }

  return res;
}