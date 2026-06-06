import { format, parseISO, isFuture, isPast, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpIcon, ArrowDownIcon, CalendarIcon, AlertCircleIcon, TrendingUpIcon } from "lucide-react";

export default function UpcomingPayments({ items }) {
  const tipoConfig = {
    renda: { icone: ArrowUpIcon, cor: "text-success", bg: "bg-success-light", prefixo: "+" },
    despesa: { icone: ArrowDownIcon, cor: "text-destructive", bg: "bg-destructive-light", prefixo: "-" },
    investimento: { icone: TrendingUpIcon, cor: "text-warning", bg: "bg-warning-light", prefixo: "-" },
    boleto: { icone: ArrowDownIcon, cor: "text-destructive", bg: "bg-destructive-light", prefixo: "-" },
  };

  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Próximos Vencimentos
        </h3>
        <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
          Nenhum vencimento próximo
        </div>
      </div>
    );
  }

  // Ordenar: atrasados primeiro, depois próximos
  const sorted = [...items].sort((a, b) => {
    const dataA = parseISO(a.data);
    const dataB = parseISO(b.data);
    return dataA - dataB;
  });

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Próximos Vencimentos
      </h3>
      <p className="mb-4 text-2xl font-bold">{items.length} evento{items.length !== 1 ? "s" : ""}</p>

      <ul className="flex flex-col gap-2 max-h-[350px] overflow-y-auto">
        {sorted.map((item, index) => {
          const data = parseISO(item.data);
          const isUpcoming = isFuture(data);
          const isOverdue = isPast(data) && !isFuture(data);
          const dias = Math.abs(differenceInDays(data, new Date()));

          const config = tipoConfig[item.tipo] || tipoConfig.despesa;
          const Icon = config.icone;

          return (
            <li
              key={item.id || index}
              className={`group flex items-center justify-between rounded-lg p-3 transition-all hover:bg-muted ${
                isOverdue ? "border border-destructive/20 bg-destructive/5" : ""
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isOverdue ? "bg-destructive-light" : config.bg
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isOverdue ? "text-destructive" : config.cor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.descricao}</p>
                  <p
                    className={`flex items-center gap-1 text-xs ${
                      isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {format(data, "dd 'de' MMM", { locale: ptBR })}
                    </span>
                    {isOverdue && (
                      <span className="flex items-center gap-0.5 shrink-0">
                        <AlertCircleIcon className="h-3 w-3" />
                        {dias} dia{dias > 1 ? "s" : ""}
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="text-muted-foreground shrink-0">
                        • em {dias} d
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <p
                className={`text-sm font-semibold shrink-0 ml-2 ${
                  isOverdue && item.tipo !== "renda" ? "text-destructive" : config.cor
                }`}
              >
                {config.prefixo}
                {(item.valor || 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}