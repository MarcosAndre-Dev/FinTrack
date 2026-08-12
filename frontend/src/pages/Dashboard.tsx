import React, { useEffect, useState } from 'react';
import { getResumo, getTransacoes, createTransacao, type TransacaoResumo, type Transacao } from '../api/transactions';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, Wallet, Loader2 } from 'lucide-react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const Dashboard: React.FC = () => {
  const [resumo, setResumo] = useState<TransacaoResumo | null>(null);
  const [dolar, setDolar] = useState<number | null>(null);
  const [recentes, setRecentes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(() => new Date().toISOString().split('T')[0]);
  const [categoria, setCategoria] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [resumoData, dashData] = await Promise.all([
        getResumo(),
        getTransacoes()
      ]);
      setResumo(resumoData);
      setDolar(dashData.cotacao_dolar || null);
      setRecentes(dashData.transacoes.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTransacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTransacao({
        tipo,
        valor: parseFloat(valor),
        descricao,
        data,
        categoria
      });
      // Reset form
      setValor('');
      setDescricao('');
      // Reload
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-f-muted"><Loader2 className="animate-spin" size={32} /></div>;
  }

  // Prepara dados para os gráficos com base no histórico recente e resumo (dummy data pra estrutura)
  // Em uma versão completa buscaríamos da API ou processaríamos a lista toda de transações
  const pieData = recentes.filter(t => t.tipo === 'despesa').reduce((acc: any[], t) => {
    const ex = acc.find(x => x.name === t.categoria);
    if (ex) ex.value += t.valor;
    else acc.push({ name: t.categoria, value: t.valor });
    return acc;
  }, []);
  const pieColors = ['#FF6B6B', '#FFD166', '#00E5A0', '#4A90E2', '#B554FF'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-syne font-bold">Dashboard</h1>
        {dolar && (
          <div className="bg-f-card border border-f-border px-4 py-2 rounded-lg text-sm text-f-muted flex items-center gap-2">
            <DollarSign size={16} className="text-f-yellow" />
            <span>US$ 1 = {formatCurrency(dolar)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-f-card border border-f-border rounded-xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowUpCircle size={64} className="text-f-green" />
          </div>
          <p className="text-sm font-bold uppercase tracking-wider text-f-muted mb-2">Receitas</p>
          <p className="text-3xl font-syne font-bold text-f-green">{formatCurrency(resumo?.total_receitas || 0)}</p>
        </div>
        <div className="bg-f-card border border-f-border rounded-xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowDownCircle size={64} className="text-f-red" />
          </div>
          <p className="text-sm font-bold uppercase tracking-wider text-f-muted mb-2">Despesas</p>
          <p className="text-3xl font-syne font-bold text-f-red">{formatCurrency(resumo?.total_despesas || 0)}</p>
        </div>
        <div className="bg-f-card border border-f-border rounded-xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={64} className="text-f-text" />
          </div>
          <p className="text-sm font-bold uppercase tracking-wider text-f-muted mb-2">Saldo</p>
          <p className="text-3xl font-syne font-bold text-f-text">{formatCurrency(resumo?.saldo || 0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-f-card border border-f-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-syne font-bold mb-4">Nova Transação</h2>
          
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTipo('receita')}
              className={`flex-1 py-2 font-syne font-bold text-sm rounded-lg border transition-colors ${tipo === 'receita' ? 'bg-f-green/10 border-f-green text-f-green' : 'border-f-border text-f-muted hover:border-f-green/50'}`}
            >
              Receita
            </button>
            <button
              onClick={() => setTipo('despesa')}
              className={`flex-1 py-2 font-syne font-bold text-sm rounded-lg border transition-colors ${tipo === 'despesa' ? 'bg-f-red/10 border-f-red text-f-red' : 'border-f-border text-f-muted hover:border-f-red/50'}`}
            >
              Despesa
            </button>
          </div>

          <form onSubmit={handleAddTransacao} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-f-muted mb-1">Valor</label>
              <input type="number" step="0.01" required value={valor} onChange={e => setValor(e.target.value)} className="w-full bg-f-surface border border-f-border rounded-lg px-3 py-2 text-sm text-f-text focus:outline-none focus:border-f-green" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-f-muted mb-1">Descrição</label>
              <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full bg-f-surface border border-f-border rounded-lg px-3 py-2 text-sm text-f-text focus:outline-none focus:border-f-green" placeholder="Ex: Salário..." />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-f-muted mb-1">Categoria</label>
              <select required value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full bg-f-surface border border-f-border rounded-lg px-3 py-2 text-sm text-f-text focus:outline-none focus:border-f-green">
                <option value="" disabled>Selecione</option>
                {tipo === 'receita' ? (
                  <>
                    <option value="salario">Salário</option>
                    <option value="freelance">Freelance</option>
                    <option value="investimentos">Investimentos</option>
                    <option value="outros">Outros</option>
                  </>
                ) : (
                  <>
                    <option value="moradia">Moradia</option>
                    <option value="alimentacao">Alimentação</option>
                    <option value="transporte">Transporte</option>
                    <option value="saude">Saúde</option>
                    <option value="lazer">Lazer</option>
                    <option value="educacao">Educação</option>
                    <option value="outros">Outros</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-f-muted mb-1">Data</label>
              <input type="date" required value={data} onChange={e => setData(e.target.value)} className="w-full bg-f-surface border border-f-border rounded-lg px-3 py-2 text-sm text-f-text focus:outline-none focus:border-f-green" />
            </div>
            <button type="submit" disabled={submitting} className={`w-full font-syne font-bold text-sm py-3 rounded-lg text-f-bg transition-colors ${tipo === 'receita' ? 'bg-f-green hover:brightness-110' : 'bg-f-red hover:brightness-110'}`}>
              {submitting ? <Loader2 className="animate-spin mx-auto" size={18}/> : `Adicionar ${tipo === 'receita' ? 'Receita' : 'Despesa'}`}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-f-card border border-f-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-syne font-bold mb-6">Gastos por Categoria (Recentes)</h2>
            <div className="h-48">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1A1D24', border: '1px solid #2A2D36', borderRadius: '8px' }} itemStyle={{ color: '#E8EAF0' }} formatter={(val: any) => formatCurrency(Number(val))} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-f-muted">Sem dados suficientes para o gráfico</div>
              )}
            </div>
          </div>

          <div className="bg-f-card border border-f-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-syne font-bold mb-4">Últimas Transações</h2>
            <div className="space-y-3">
              {recentes.length === 0 ? (
                <div className="text-center py-6 text-f-muted text-sm">Nenhuma transação encontrada.</div>
              ) : (
                recentes.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-f-surface border border-f-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.tipo === 'receita' ? 'bg-f-green/10 text-f-green' : 'bg-f-red/10 text-f-red'}`}>
                        {t.tipo === 'receita' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{t.descricao || t.categoria}</p>
                        <p className="text-xs text-f-muted">{new Date(t.data + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className={`font-syne font-bold ${t.tipo === 'receita' ? 'text-f-green' : 'text-f-text'}`}>
                      {t.tipo === 'receita' ? '+' : '-'} {formatCurrency(t.valor)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
