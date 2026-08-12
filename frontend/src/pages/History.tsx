import React, { useEffect, useState } from 'react';
import { getTransacoes, deleteTransacao, type Transacao } from '../api/transactions';
import { ArrowUpCircle, ArrowDownCircle, Trash2, Filter, Loader2, AlertCircle } from 'lucide-react';

export const History: React.FC = () => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [mesAno, setMesAno] = useState('');
  
  // Modal state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      let mes: number | undefined;
      let ano: number | undefined;
      if (mesAno) {
        const [a, m] = mesAno.split('-');
        ano = parseInt(a, 10);
        mes = parseInt(m, 10);
      }
      const data = await getTransacoes(mes, ano);
      setTransacoes(data.transacoes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [mesAno]);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteTransacao(deletingId);
      setDeletingId(null);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTransacoes = transacoes.filter(t => 
    filtroTipo === 'todos' ? true : t.tipo === filtroTipo
  );

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-syne font-bold">Histórico de Transações</h1>
        
        <div className="flex items-center gap-3">
          <div className="bg-f-card border border-f-border rounded-lg p-1 flex">
            <button onClick={() => setFiltroTipo('todos')} className={`px-4 py-1.5 text-xs font-bold font-syne rounded-md transition-colors ${filtroTipo === 'todos' ? 'bg-f-surface text-f-text' : 'text-f-muted hover:text-f-text'}`}>Todos</button>
            <button onClick={() => setFiltroTipo('receita')} className={`px-4 py-1.5 text-xs font-bold font-syne rounded-md transition-colors ${filtroTipo === 'receita' ? 'bg-f-green/10 text-f-green' : 'text-f-muted hover:text-f-text'}`}>Receitas</button>
            <button onClick={() => setFiltroTipo('despesa')} className={`px-4 py-1.5 text-xs font-bold font-syne rounded-md transition-colors ${filtroTipo === 'despesa' ? 'bg-f-red/10 text-f-red' : 'text-f-muted hover:text-f-text'}`}>Despesas</button>
          </div>
          
          <input 
            type="month" 
            value={mesAno} 
            onChange={(e) => setMesAno(e.target.value)}
            className="bg-f-card border border-f-border rounded-lg px-3 py-1.5 text-sm text-f-text focus:outline-none focus:border-f-green"
          />
        </div>
      </div>

      <div className="bg-f-card border border-f-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center text-f-muted"><Loader2 className="animate-spin" size={32} /></div>
        ) : filteredTransacoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-f-muted">
            <Filter size={48} className="mb-4 opacity-20" />
            <p className="text-sm">Nenhuma transação encontrada para este filtro.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-f-border bg-f-surface/50 text-xs uppercase tracking-wider text-f-muted">
                  <th className="p-4 font-bold">Descrição</th>
                  <th className="p-4 font-bold">Categoria</th>
                  <th className="p-4 font-bold">Data</th>
                  <th className="p-4 font-bold text-right">Valor</th>
                  <th className="p-4 font-bold text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransacoes.map((t) => (
                  <tr key={t.id} className="border-b border-f-border/50 hover:bg-f-surface transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.tipo === 'receita' ? 'bg-f-green/10 text-f-green' : 'bg-f-red/10 text-f-red'}`}>
                          {t.tipo === 'receita' ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                        </div>
                        <span className="font-bold text-sm text-f-text">{t.descricao || '-'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-f-muted capitalize">{t.categoria}</td>
                    <td className="p-4 text-sm text-f-muted">{new Date(t.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td className={`p-4 text-sm font-syne font-bold text-right ${t.tipo === 'receita' ? 'text-f-green' : 'text-f-text'}`}>
                      {t.tipo === 'receita' ? '+' : '-'} {formatCurrency(t.valor)}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setDeletingId(t.id)}
                        className="p-2 text-f-muted hover:text-f-red hover:bg-f-red/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-f-card border border-f-border rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-f-red/10 text-f-red flex items-center justify-center shrink-0">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-syne font-bold text-f-text">Excluir transação?</h3>
                <p className="text-sm text-f-muted">Essa ação não pode ser desfeita.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setDeletingId(null)} 
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-bold text-f-text border border-f-border hover:bg-f-surface rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-bold text-f-bg bg-f-red hover:brightness-110 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
