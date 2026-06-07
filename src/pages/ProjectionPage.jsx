import { useState, useEffect } from "react";
import { TrendingUpIcon, TrendingDownIcon, DollarSignIcon, PiggyBankIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Line, ComposedChart, ReferenceLine } from "recharts";
import projectionService from "@/api/projectionService";

export default function ProjectionPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProjection(); }, []);

  const loadProjection = async () => {
    try {
      setLoading(true);
      const result = await projectionService.get();
      setData(result);
    } catch (error) {
      console.error("Erro ao carregar projeção:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) return <p className="text-center text-muted-foreground">Erro ao carregar projeção</p>;

  const chartData = data.meses.map((m) => ({
    ...m,
    nome: m.mes.split(" ")[0].substring(0, 3) + "/" + m.mes.split(" ")[2]?.substring(2),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Projeção Financeira</h2>
        <p className="text-muted-foreground">Previsão dos próximos 6 meses baseada na sua média</p>
      </div>

      {/* Cards de média */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Média Receitas", valor: data.mediaReceitas, icone: TrendingUpIcon, cor: "text-success" },
          { label: "Média Despesas", valor: data.mediaDespesas, icone: TrendingDownIcon, cor: "text-destructive" },
          { label: "Média Invest.", valor: data.mediaInvestimentos, icone: PiggyBankIcon, cor: "text-warning" },
          { label: "Saldo Atual", valor: data.saldoAtual, icone: DollarSignIcon, cor: data.saldoAtual >= 0 ? "text-success" : "text-destructive" },
        ].map((card, i) => (
          <div key={i} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase">{card.label}</p>
            <div className="flex items-center gap-2 mt-1">
              <card.icone className={`h-5 w-5 ${card.cor}`} />
              <p className="text-xl font-bold">{card.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de projeção */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-lg font-semibold mb-4">Evolução do Saldo Projetado</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="nome" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
            <Tooltip
              contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e2e8f0", fontSize: "13px" }}
              formatter={(value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            />
            <Legend />
            <Bar dataKey="receitas" fill="#10b981" radius={[6, 6, 0, 0]} name="Receitas" />
            <Bar dataKey="despesas" fill="#ef4444" radius={[6, 6, 0, 0]} name="Despesas" />
            <Line type="monotone" dataKey="saldoProjetado" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} name="Saldo Projetado" />
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela de meses */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Mês</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Receitas</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Despesas</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Parcelas</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Saldo Mês</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Saldo Acumulado</th>
            </tr>
          </thead>
          <tbody>
            {data.meses.map((m, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-4 py-3 text-sm font-medium capitalize">{m.mes}</td>
                <td className="px-4 py-3 text-sm text-right text-success">+{m.receitas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td className="px-4 py-3 text-sm text-right text-destructive">-{m.despesas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td className="px-4 py-3 text-sm text-right text-warning">{m.parcelas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td className={`px-4 py-3 text-sm text-right font-medium ${m.saldoMes >= 0 ? "text-success" : "text-destructive"}`}>
                  {m.saldoMes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className={`px-4 py-3 text-sm text-right font-bold ${m.saldoProjetado >= 0 ? "text-success" : "text-destructive"}`}>
                  {m.saldoProjetado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}