import { useState, useEffect } from "react";
import dashboardService from "@/api/dashboardService";
import SummaryCards from "@/components/dashboard/SummaryCards";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import UpcomingPayments from "@/components/dashboard/UpcomingPayments";
import MonthlyEvolution from "@/components/dashboard/MonthlyEvolution";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const summary = await dashboardService.summary();

      const cores = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ec4899", "#6b7280"];
      const despesasPorCategoria = (summary.despesasPorCategoria || []).map((cat, i) => ({
        nome: cat.nome,
        valor: cat.valor,
        cor: cores[i % cores.length],
      }));

      const proximosVencimentos = (summary.proximosVencimentos || []).map((v) => ({
        descricao: v.description,
        valor: v.amount,
        data: v.dueDate,
        tipo: v.type === "income" ? "renda" : "despesa",
      }));

      const totalReceitas = summary.receitasMes || 0;
      const totalDespesas = summary.despesasMes || 0;
      const patrimonioTotal = (summary.saldoAtual || 0) + (summary.investimentosMes || 0);

      setData({
        saldoAtual: summary.saldoAtual || 0,
        receitasMes: totalReceitas,
        despesasMes: totalDespesas,
        investimentosMes: summary.investimentosMes || 0,
        patrimonioTotal,
        despesasPorCategoria,
        proximosVencimentos,
        evolucaoMensal: [
          { dia: "Sem 1", receitas: totalReceitas * 0.25, despesas: totalDespesas * 0.2 },
          { dia: "Sem 2", receitas: totalReceitas * 0.15, despesas: totalDespesas * 0.3 },
          { dia: "Sem 3", receitas: totalReceitas * 0.4, despesas: totalDespesas * 0.25 },
          { dia: "Sem 4", receitas: totalReceitas * 0.2, despesas: totalDespesas * 0.25 },
        ],
      });
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
      setError("Não foi possível carregar os dados. Verifique se o servidor está rodando.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-destructive text-lg mb-2">⚠️</div>
          <p className="text-destructive font-medium">{error}</p>
          <button
            onClick={loadDashboard}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary-hover"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

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
        patrimonioTotal={data.patrimonioTotal}
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