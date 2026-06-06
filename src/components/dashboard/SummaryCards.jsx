import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, WalletIcon, PiggyBankIcon } from "lucide-react";

const cards = [
  {
    titulo: "Saldo Corrente",
    icone: WalletIcon,
    cor: "from-info to-blue-600",
    bgIcon: "bg-info-light",
    textIcon: "text-info",
    descricao: "Disponível em conta",
  },
  {
    titulo: "Receitas",
    icone: ArrowUpIcon,
    cor: "from-success to-emerald-600",
    bgIcon: "bg-success-light",
    textIcon: "text-success",
    descricao: "Entradas do mês",
  },
  {
    titulo: "Despesas",
    icone: ArrowDownIcon,
    cor: "from-destructive to-red-600",
    bgIcon: "bg-destructive-light",
    textIcon: "text-destructive",
    descricao: "Saídas do mês",
  },
  {
    titulo: "Investimentos",
    icone: TrendingUpIcon,
    cor: "from-warning to-amber-600",
    bgIcon: "bg-warning-light",
    textIcon: "text-warning",
    descricao: "Aportes do mês",
  },
  {
    titulo: "Patrimônio",
    icone: PiggyBankIcon,
    cor: "from-primary to-emerald-600",
    bgIcon: "bg-primary/10",
    textIcon: "text-primary",
    descricao: "Corrente + Investido",
  },
];

export default function SummaryCards({
  saldoAtual = 0,
  receitasMes = 0,
  despesasMes = 0,
  investimentosMes = 0,
  patrimonioTotal = 0,
}) {
  const valores = [saldoAtual, receitasMes, despesasMes, investimentosMes, patrimonioTotal];

  const formatCurrency = (value) => {
    // Garantir que é número
    const num = Number(value) || 0;

    // Para valores grandes, abreviar no mobile
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      if (Math.abs(num) >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
      }
      if (Math.abs(num) >= 1000) {
        return `${(num / 1000).toFixed(1)}k`;
      }
    }

    return num.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  };

  const getValueColor = (titulo, valor) => {
    if (titulo === "Saldo Corrente" || titulo === "Patrimônio") {
      return valor >= 0 ? "text-success" : "text-destructive";
    }
    if (titulo === "Despesas") return "text-destructive";
    if (titulo === "Receitas") return "text-success";
    return "";
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card, index) => (
        <div
          key={card.titulo}
          className="group relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 animate-scale-in"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          {/* Gradiente decorativo */}
          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.cor}`} />

          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
                {card.titulo}
              </p>
              <p
                className={`mt-1 text-lg font-bold tracking-tight sm:text-xl truncate ${getValueColor(
                  card.titulo,
                  valores[index]
                )}`}
                title={Number(valores[index] || 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              >
                {formatCurrency(valores[index])}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">
                {card.descricao}
              </p>
            </div>
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.bgIcon} transition-transform duration-200 group-hover:scale-110`}
            >
              <card.icone className={`h-5 w-5 ${card.textIcon}`} />
            </div>
          </div>
        </div>
      ))} 
    </div>
  );
}