import { useState, useEffect } from "react";
import SummaryCards from "@/components/dashboard/SummaryCards";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import UpcomingPayments from "@/components/dashboard/UpcomingPayments";
import MonthlyEvolution from "@/components/dashboard/MonthlyEvolution";

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Dados mockados (futuramente virão da store/API)
    const mockData = {
      saldoAtual: 4250.75,
      receitasMes: 8000.00,
      despesasMes: 3249.25,
      investimentosMes: 500.00,
      despesasPorCategoria: [
        { nome: "Alimentação", valor: 1200.50, cor: "#ef4444" },
        { nome: "Transporte", valor: 450.30, cor: "#f59e0b" },
        { nome: "Moradia", valor: 800.00, cor: "#3b82f6" },
        { nome: "Lazer", valor: 350.20, cor: "#8b5cf6" },
        { nome: "Saúde", valor: 248.25, cor: "#10b981" },
        { nome: "Outros", valor: 200.00, cor: "#6b7280" },
      ],
      proximosVencimentos: [
        { descricao: "Aluguel", valor: 1500.00, data: "2026-06-05", tipo: "despesa" },
        { descricao: "Salário", valor: 5000.00, data: "2026-06-01", tipo: "renda" },
        { descricao: "Internet", valor: 119.90, data: "2026-06-10", tipo: "despesa" },
        { descricao: "Freelance", valor: 2000.00, data: "2026-06-15", tipo: "renda" },
      ],
      evolucaoMensal: [
        { dia: "Sem 1", receitas: 2000, despesas: 800 },
        { dia: "Sem 2", receitas: 500, despesas: 1200 },
        { dia: "Sem 3", receitas: 3000, despesas: 600 },
        { dia: "Sem 4", receitas: 1500, despesas: 649.25 },
      ],
    };
    setData(mockData);
  }, []);

  if (!data) return <div className="p-6">Carregando...</div>;

  return (
    <div className="flex flex-col gap-6">
      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral das suas finanças</p>
      </div>

      {/* Cards de Resumo */}
      <SummaryCards 
        saldoAtual={data.saldoAtual}
        receitasMes={data.receitasMes}
        despesasMes={data.despesasMes}
        investimentosMes={data.investimentosMes}
      />

      {/* Gráficos e Lista */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Gráfico de Pizza */}
        <div className="lg:col-span-1">
          <ExpenseChart data={data.despesasPorCategoria} />
        </div>

        {/* Próximos Vencimentos */}
        <div className="lg:col-span-1">
          <UpcomingPayments items={data.proximosVencimentos} />
        </div>

        {/* Evolução Mensal */}
        <div className="lg:col-span-1">
          <MonthlyEvolution data={data.evolucaoMensal} />
        </div>
      </div>
    </div>
  );
}