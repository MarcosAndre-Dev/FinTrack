import { apiClient } from './client';

export interface Conselho {
  id?: number;
  texto: string;
  criado_em?: string;
}

export const gerarConselho = async (): Promise<Conselho> => {
  const res = await apiClient.get('/conselhos/');
  return { texto: res.data.conselho };
};

export const getHistoricoConselhos = async (): Promise<Conselho[]> => {
  const res = await apiClient.get<Conselho[]>('/conselhos/historico');
  return res.data;
};
