import { apiClient } from './client';

export interface Transacao {
  id: number;
  tipo: 'receita' | 'despesa';
  valor: number;
  categoria: string;
  descricao?: string;
  data: string;
}

export interface TransacaoResumo {
  total_receitas: number;
  total_despesas: number;
  saldo: number;
}

export interface EvolucaoItem {
  mes: string;
  receita: number;
  despesa: number;
  saldo: number;
}

export interface DashboardData {
  transacoes: Transacao[];
  cotacao_dolar?: number | null;
}

export const getResumo = async (mes?: number, ano?: number): Promise<TransacaoResumo> => {
  const params = { mes, ano };
  const res = await apiClient.get<TransacaoResumo>('/transacoes/resumo', { params });
  return res.data;
};

export const getEvolucao = async (): Promise<EvolucaoItem[]> => {
  const res = await apiClient.get<EvolucaoItem[]>('/transacoes/evolucao');
  return res.data;
};

export const getTransacoes = async (mes?: number, ano?: number): Promise<DashboardData> => {
  const params = { mes, ano };
  const res = await apiClient.get<DashboardData>('/transacoes/', { params });
  return res.data;
};

export const createTransacao = async (data: Omit<Transacao, 'id'>): Promise<Transacao> => {
  const res = await apiClient.post<Transacao>('/transacoes/', data);
  return res.data;
};

export const deleteTransacao = async (id: number): Promise<void> => {
  await apiClient.delete(`/transacoes/${id}`);
};

export const baixarRelatorio = async (mes: number, ano: number): Promise<void> => {
  const res = await apiClient.get('/transacoes/relatorio', {
    params: { mes, ano },
    responseType: 'blob'
  });
  
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `relatorio_${String(mes).padStart(2, '0')}_${ano}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
