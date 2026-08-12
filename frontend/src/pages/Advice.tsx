import React, { useEffect, useState } from 'react';
import { getHistoricoConselhos, gerarConselho, type Conselho } from '../api/advice';
import { Sparkles, Loader2, Bot, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export const Advice: React.FC = () => {
  const [historico, setHistorico] = useState<Conselho[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  const [conselhoAtual, setConselhoAtual] = useState<Conselho | null>(null);
  const [generating, setGenerating] = useState(false);
  
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchHistorico = async () => {
    try {
      const data = await getHistoricoConselhos();
      setHistorico(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistorico();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setConselhoAtual(null);
    try {
      const conselho = await gerarConselho();
      setConselhoAtual(conselho);
      await fetchHistorico(); // Atualiza a lista logo em seguida
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-syne font-bold flex items-center gap-2">
            Conselhos IA <Sparkles className="text-f-yellow" size={24} />
          </h1>
          <p className="text-sm text-f-muted mt-1">Nossa inteligência artificial analisa seus hábitos e sugere melhorias.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center justify-center gap-2 px-6 py-3 font-syne font-bold text-sm bg-f-yellow text-[#0B0C0F] rounded-xl hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,209,102,0.15)] hover:shadow-[0_0_25px_rgba(255,209,102,0.3)]"
        >
          {generating ? <Loader2 size={18} className="animate-spin" /> : <Bot size={18} />}
          Gerar Novo Conselho
        </button>
      </div>

      {generating && (
        <div className="bg-f-card border border-f-yellow/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(255,209,102,0.05)] animate-pulse">
          <Bot size={48} className="text-f-yellow mb-4" />
          <h2 className="text-lg font-syne font-bold text-f-text mb-2">Analisando suas finanças...</h2>
          <p className="text-sm text-f-muted">A IA está processando suas receitas e despesas para gerar um conselho personalizado.</p>
        </div>
      )}

      {conselhoAtual && !generating && (
        <div className="bg-f-card border border-f-yellow/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(255,209,102,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Sparkles size={120} className="text-f-yellow" />
          </div>
          <div className="flex items-center gap-2 mb-4 text-f-yellow">
            <Sparkles size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Conselho Gerado Agora</span>
          </div>
          <div className="text-sm text-f-text leading-relaxed whitespace-pre-wrap relative z-10">
            {conselhoAtual.texto}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-f-muted mb-4 flex items-center gap-2">
          <Clock size={16} /> Histórico de Conselhos
        </h2>
        
        {loadingHistory ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-f-muted" size={24} /></div>
        ) : historico.length === 0 ? (
          <div className="bg-f-surface border border-f-border border-dashed rounded-xl p-8 text-center text-f-muted">
            <p className="text-sm">Você ainda não gerou nenhum conselho.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {historico.map((c) => {
              const isExpanded = expandedId === c.id;
              return (
                <div key={c.id} className="bg-f-card border border-f-border rounded-xl overflow-hidden transition-colors hover:border-f-border/80">
                  <button 
                    onClick={() => setExpandedId(isExpanded ? null : c.id!)}
                    className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-f-surface flex items-center justify-center text-f-yellow shrink-0">
                        <Bot size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-f-text">Conselho #{c.id}</p>
                        <p className="text-xs text-f-muted">
                          {c.criado_em ? new Date(c.criado_em).toLocaleString('pt-BR') : 'Data desconhecida'}
                        </p>
                      </div>
                    </div>
                    <div className="text-f-muted">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-f-border/30 text-sm text-f-text leading-relaxed whitespace-pre-wrap bg-f-surface/30">
                      <div className="pt-4">{c.texto}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
