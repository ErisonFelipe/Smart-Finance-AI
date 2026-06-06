import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const EMPTY_DATA = [{ nome: "Sem dados", valor: 1, cor: "#e2e8f0" }];

export default function ExpenseChart({ data = [] }) {
  const hasData = data.length > 0;
  const chartData = hasData ? data : EMPTY_DATA;
  const total = data.reduce((acc, item) => acc + item.valor, 0);

  const renderTooltip = ({ active, payload }) => {
    if (!active || !payload?.length || !hasData) return null;

    const { nome, valor } = payload[0].payload;
    const percent = total > 0 ? ((valor / total) * 100).toFixed(1) : 0;

    return (
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "0.75rem",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          fontSize: "13px",
          padding: "8px 12px",
        }}
      >
        <p className="font-medium">{nome}</p>
        <p className="text-muted-foreground">
          {valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
        <p className="text-muted-foreground">{percent}% do total</p>
      </div>
    );
  };

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Despesas por Categoria
      </h3>
      <p className="mb-4 text-2xl font-bold">
        {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </p>

      {!hasData && (
        <p className="mb-2 text-center text-xs text-muted-foreground">
          Nenhuma despesa registrada ainda
        </p>
      )}

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="valor"
            nameKey="nome"
            cx="50%"
            cy="50%"
            outerRadius={85}
            innerRadius={55}
            paddingAngle={hasData ? 2 : 0}
            animationBegin={0}
            animationDuration={800}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.nome}
                fill={entry.cor}
                stroke="transparent"
                opacity={hasData ? 1 : 0.4}
              />
            ))}
          </Pie>
          <Tooltip content={renderTooltip} />
          {hasData && (
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
              iconType="circle"
              iconSize={6}
              formatter={(value) => (
                <span className="text-xs font-medium text-muted-foreground">
                  {value}
                </span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}