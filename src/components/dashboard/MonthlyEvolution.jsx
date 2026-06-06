import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { useMemo } from "react";

export default function MonthlyEvolution({ data }) {
  // Se não houver dados, mostrar mensagem
  const hasData = data && data.length > 0 && data.some(d => d.receitas > 0 || d.despesas > 0);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data;
  }, [data]);

  if (!hasData) {
    return (
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Evolução do Mês
        </h3>
        <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
          Sem dados para exibir
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Evolução do Mês
      </h3>
      <p className="mb-4 text-2xl font-bold">Receitas vs Despesas</p>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barGap={6} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="dia"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={60}
            tickFormatter={(value) =>
              value >= 1000
                ? `${(value / 1000).toFixed(0)}k`
                : value
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "0.75rem",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              fontSize: "13px",
            }}
            formatter={(value) =>
              value.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
            }
            cursor={{ fill: '#f8fafc' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs font-medium text-muted-foreground">{value}</span>
            )}
          />
          <Bar
            dataKey="receitas"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
            name="Receitas"
            animationBegin={0}
            animationDuration={600}
            maxBarSize={40}
          />
          <Bar
            dataKey="despesas"
            fill="#ef4444"
            radius={[6, 6, 0, 0]}
            name="Despesas"
            animationBegin={200}
            animationDuration={600}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}