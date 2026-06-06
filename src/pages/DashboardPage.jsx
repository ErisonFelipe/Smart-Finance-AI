import { useState, useEffect, useCallback } from "react";
import dashboardService from "@/api/dashboardService";
import SummaryCards from "@/components/dashboard/SummaryCards";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import UpcomingPayments from "@/components/dashboard/UpcomingPayments";
import MonthlyEvolution from "@/components/dashboard/MonthlyEvolution";
import { RefreshCwIcon } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await dashboardService.summary();

      const cores = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ec4899", "#6b7280"];
      const despesasPorCategoria = (summary.despesasPorCategoria || []).map((cat, i) => ({
        nome: cat.nome,
        valor: cat.valor || 0,
        cor: cores[i % cores.length],
      }));

      const proximosVencimentos = (summary.proximosVencimentos || []).map((v) => ({
        id: v.id,
        descricao: v.description,
        valor: v.amount,
        data: v.dueDate,
        tipo: v.type === "income" ? "renda" : v.type === "investment" ? "investimento" : "despesa",
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
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
      setError("Não foi possível carregar os dados. O servidor pode estar indisponível.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando seus dados financeiros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-destructive font-medium mb-1">Erro ao carregar</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={loadDashboard}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            <RefreshCwIcon className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-muted-foreground">Nenhum dado disponível</p>
          <p className="text-xs text-muted-foreground mt-1">Adicione transações para ver seu dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral das suas finanças em {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={loadDashboard}
          className="rounded-lg p-2 hover:bg-muted transition-colors"
          title="Atualizar dados"
        >
          <RefreshCwIcon className="h-4 w-4 text-muted-foreground" />
        </button>
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
        <div className="lg:col-span-1">
          <ExpenseChart data={data.despesasPorCategoria} />
        </div>
        <div className="lg:col-span-1">
          <UpcomingPayments items={data.proximosVencimentos} />
        </div>
        <div className="lg:col-span-1">
          <MonthlyEvolution data={data.evolucaoMensal} />
        </div>
      </div>
    </div>
  );
}