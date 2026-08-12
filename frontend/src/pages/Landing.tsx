import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PieChart, Shield, Zap } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-f-bg text-f-text">
      <header className="flex items-center justify-between px-6 py-4 border-b border-f-border/50 bg-f-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="text-2xl font-bold font-syne text-f-green tracking-tight">
          Fin<span className="text-f-text">Track</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 font-syne font-bold text-sm text-f-muted hover:text-f-text transition-colors">
            Entrar
          </Link>
          <Link to="/register" className="px-4 py-2 font-syne font-bold text-sm bg-f-green text-f-bg rounded-lg hover:brightness-110 transition-all">
            Criar conta grátis
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold font-syne tracking-tight mb-6 leading-tight">
            Assuma o controle do seu <span className="text-f-green">futuro financeiro</span>.
          </h1>
          <p className="text-lg text-f-muted mb-10 max-w-xl mx-auto leading-relaxed">
            O FinTrack é a plataforma inteligente que ajuda você a acompanhar despesas, monitorar receitas e receber conselhos personalizados via IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="flex items-center justify-center gap-2 px-6 py-3 font-syne font-bold text-base bg-f-green text-f-bg rounded-lg hover:brightness-110 transition-all">
              Começar agora <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="flex items-center justify-center px-6 py-3 font-syne font-bold text-base border border-f-border text-f-text rounded-lg hover:border-f-green hover:text-f-green transition-all">
              Já tenho uma conta
            </Link>
          </div>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left w-full">
          <div className="bg-f-card p-6 rounded-2xl border border-f-border">
            <div className="w-12 h-12 rounded-full bg-f-green/10 flex items-center justify-center text-f-green mb-4">
              <PieChart size={24} />
            </div>
            <h3 className="text-lg font-bold font-syne mb-2">Visão Clara</h3>
            <p className="text-sm text-f-muted">Acompanhe todas as suas transações e veja para onde seu dinheiro está indo com gráficos precisos.</p>
          </div>
          <div className="bg-f-card p-6 rounded-2xl border border-f-border">
            <div className="w-12 h-12 rounded-full bg-f-yellow/10 flex items-center justify-center text-f-yellow mb-4">
              <Zap size={24} />
            </div>
            <h3 className="text-lg font-bold font-syne mb-2">Conselhos IA</h3>
            <p className="text-sm text-f-muted">Nossa inteligência artificial analisa seus hábitos e fornece recomendações para otimizar suas finanças.</p>
          </div>
          <div className="bg-f-card p-6 rounded-2xl border border-f-border">
            <div className="w-12 h-12 rounded-full bg-f-red/10 flex items-center justify-center text-f-red mb-4">
              <Shield size={24} />
            </div>
            <h3 className="text-lg font-bold font-syne mb-2">Segurança Total</h3>
            <p className="text-sm text-f-muted">Seus dados financeiros são processados com os mais altos padrões de segurança e privacidade.</p>
          </div>
        </div>
      </main>
      
      <footer className="py-8 text-center text-xs text-f-muted border-t border-f-border/50">
        <p>&copy; 2026 FinTrack. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};
