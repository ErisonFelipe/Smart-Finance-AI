import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function MonthlyEvolution({ data }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Evolução do Mês
      </h3>
      <p className="mb-4 text-2xl font-bold">Receitas vs Despesas</p>
      
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={4}>
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
          />
          <Legend
            iconType="circle"
            iconSize={6}
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
          />
          <Bar 
            dataKey="despesas" 
            fill="#ef4444" 
            radius={[6, 6, 0, 0]} 
            name="Despesas"
            animationBegin={200}
            animationDuration={600}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}