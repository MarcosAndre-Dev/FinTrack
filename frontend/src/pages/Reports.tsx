import React, { useState } from 'react';
import { baixarRelatorio } from '../api/transactions';
import { FileDown, Loader2, Calendar } from 'lucide-react';

export const Reports: React.FC = () => {
  const [mesAno, setMesAno] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDownload = async () => {
    if (!mesAno) {
      setError('Por favor, selecione o mês e o ano.');
      return;
    }

    setError(null);
    setSuccess(false);
    setLoading(true);
    
    const [ano, mes] = mesAno.split('-');
    
    try {
      await baixarRelatorio(parseInt(mes, 10), parseInt(ano, 10));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setError('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-syne font-bold mb-8">Relatórios Financeiros</h1>
      
      <div className="bg-f-card border border-f-border rounded-2xl p-8 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-f-green/10 flex items-center justify-center text-f-green mb-6 mx-auto">
          <FileDown size={32} />
        </div>
        
        <h2 className="text-xl font-syne font-bold text-center mb-2">Gerar Relatório PDF</h2>
        <p className="text-sm text-f-muted text-center mb-8 max-w-sm mx-auto">
          Selecione o período abaixo para fazer o download de um relatório detalhado em PDF com as receitas, despesas e saldo do mês.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-f-red/10 border border-f-red/20 rounded-lg text-f-red text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-f-green/10 border border-f-green/20 rounded-lg text-f-green text-sm text-center">
            Relatório gerado com sucesso! O download deve iniciar automaticamente.
          </div>
        )}

        <div className="flex flex-col items-center gap-6">
          <div className="w-full max-w-xs relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-f-muted mb-2 text-center">Período (Mês e Ano)</label>
            <div className="relative">
              <input
                type="month"
                value={mesAno}
                onChange={(e) => setMesAno(e.target.value)}
                className="w-full bg-f-surface border border-f-border rounded-lg pl-10 pr-4 py-3 text-sm text-f-text focus:outline-none focus:border-f-green transition-colors"
              />
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-f-muted" />
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={loading || !mesAno}
            className="w-full max-w-xs flex items-center justify-center gap-2 bg-f-green text-f-bg font-syne font-bold text-sm rounded-lg px-6 py-4 hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <FileDown size={18} />
                Gerar Relatório PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
