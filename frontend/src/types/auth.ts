export interface User {
  id: number;
  nome: string; // O backend estava retornando 'nome', mas o type no DTO no Python é string. Vou corrigir para string.
  email: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}
