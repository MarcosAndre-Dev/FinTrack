async function carregarResumo() {
  try {
    const res = await fetch(`${API_URL}/transacoes/resumo`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    toast('Não foi possível carregar o resumo.', true);
    return null;
  }
}

async function carregarTransacoes() {
  try {
    const res = await fetch(`${API_URL}/transacoes/`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    toast('Não foi possível carregar as transações.', true);
    return [];
  }
}