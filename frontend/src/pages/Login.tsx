import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        senha: password
      });
      login(response.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'E-mail ou senha incorretos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-f-bg relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-f-green/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md bg-f-card border border-f-border rounded-2xl p-8 relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-2xl font-bold font-syne text-f-green tracking-tight mb-2">
            Fin<span className="text-f-text">Track</span>
          </Link>
          <h1 className="text-xl font-bold font-syne text-f-text">Bem-vindo de volta</h1>
          <p className="text-sm text-f-muted mt-1">Acesse sua conta para continuar</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-f-red/10 border border-f-red/20 rounded-lg text-f-red text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-f-muted mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-f-surface border border-f-border rounded-lg px-4 py-3 text-sm text-f-text focus:outline-none focus:border-f-green transition-colors placeholder:text-f-muted"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-f-muted mb-2">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-f-surface border border-f-border rounded-lg px-4 py-3 text-sm text-f-text focus:outline-none focus:border-f-green transition-colors placeholder:text-f-muted"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-f-muted hover:text-f-text transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-f-green text-f-bg font-syne font-bold text-sm rounded-lg px-4 py-3 hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Entrar na conta'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-f-muted">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-f-green hover:underline font-bold">
            Criar agora
          </Link>
        </div>
      </div>
    </div>
  );
};
