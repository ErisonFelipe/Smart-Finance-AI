import { format, parseISO, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircleIcon, CheckCircleIcon, ClockIcon } from "lucide-react";

export default function DebtList({ debts, emptyMessage, isHistory = false }) {
  if (debts.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {debts.map((debt) => {
        const percentual = Math.round((debt.parcelasPagas / debt.parcelasTotais) * 100);
        const valorRestante = debt.valorTotal - debt.valorPago;

        const statusConfig = {
          ativa: { icone: ClockIcon, cor: "text-info", bg: "bg-info/10", label: "Em andamento" },
          quitada: { icone: CheckCircleIcon, cor: "text-success", bg: "bg-success/10", label: "Quitada" },
          atrasada: { icone: AlertCircleIcon, cor: "text-destructive", bg: "bg-destructive/10", label: "Atrasada" },
        };

        const config = statusConfig[debt.status] || statusConfig.ativa;
        const Icon = config.icone;

        return (
          <div key={debt.id} className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{debt.nome}</h4>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${config.bg} ${config.cor}`}>
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Início: {format(parseISO(debt.dataInicio), "dd/MM/yyyy")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  {debt.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
                <p className="text-xs text-muted-foreground">
                  Restante: {valorRestante.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{debt.parcelasPagas} de {debt.parcelasTotais} parcelas</span>
                <span>{percentual}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full transition-all ${
                    debt.status === "quitada" ? "bg-success" :
                    debt.status === "atrasada" ? "bg-destructive" : "bg-primary"
                  }`}
                  style={{ width: `${percentual}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span>Valor pago: {debt.valorPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              <span>Parcela: {(debt.valorTotal / debt.parcelasTotais).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}