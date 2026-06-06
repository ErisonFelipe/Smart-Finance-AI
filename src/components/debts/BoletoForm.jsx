import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarcodeIcon, CheckCircleIcon, AlertCircleIcon, ClockIcon, TrashIcon } from "lucide-react";

export default function BoletoForm({ boletos, onDelete }) {
  if (!boletos || boletos.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        Nenhum boleto cadastrado
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {boletos.map((boleto) => {
        const isAtrasado = new Date(boleto.dueDate) < new Date() && !boleto.paid;

        const statusConfig = {
          true: { icone: CheckCircleIcon, cor: "text-success", bg: "bg-success/10", label: "Pago" },
          false: { icone: ClockIcon, cor: "text-warning", bg: "bg-warning/10", label: "Pendente" },
        };

        const config = boleto.paid ? statusConfig.true : (isAtrasado ? { icone: AlertCircleIcon, cor: "text-destructive", bg: "bg-destructive/10", label: "Atrasado" } : statusConfig.false);
        const Icon = config.icone;

        return (
          <div
            key={boleto.id}
            className={`flex items-center justify-between rounded-xl border p-4 shadow-sm hover:shadow-md transition-all ${
              isAtrasado ? "border-destructive/30 bg-destructive/5" : "bg-card"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bg}`}>
                <BarcodeIcon className={`h-5 w-5 ${config.cor}`} />
              </div>
              <div>
                <h4 className="font-medium">{boleto.description}</h4>
                <p className="text-xs text-muted-foreground">
                  Vence: {format(parseISO(boleto.dueDate), "dd/MM/yyyy")}
                </p>
                {boleto.barcode && (
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    Cód: {boleto.barcode}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${config.bg} ${config.cor}`}>
                <Icon className="h-3 w-3" />
                {config.label}
              </span>
              <p className="text-lg font-bold">
                {boleto.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              {onDelete && (
                <button
                  onClick={() => onDelete(boleto.id)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Excluir boleto"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}