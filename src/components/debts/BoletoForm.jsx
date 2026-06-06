import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarcodeIcon, CheckCircleIcon, AlertCircleIcon, ClockIcon, TrashIcon, PencilIcon } from "lucide-react";

export default function BoletoForm({ boletos, onDelete, onTogglePaid, onEdit }) {
  if (!boletos || boletos.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <BarcodeIcon className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm">Nenhum boleto cadastrado</p>
          <p className="text-xs text-muted-foreground">Clique em "Novo Boleto" para adicionar</p>
        </div>
      </div>
    );
  }

  // Ordenar: atrasados primeiro, depois por vencimento
  const sorted = [...boletos].sort((a, b) => {
    if (!a.paid && new Date(a.dueDate) < new Date()) return -1;
    if (!b.paid && new Date(b.dueDate) < new Date()) return 1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((boleto) => {
        const isAtrasado = new Date(boleto.dueDate) < new Date() && !boleto.paid;

        const config = boleto.paid
          ? { icone: CheckCircleIcon, cor: "text-success", bg: "bg-success/10", label: "Pago" }
          : isAtrasado
            ? { icone: AlertCircleIcon, cor: "text-destructive", bg: "bg-destructive/10", label: "Atrasado" }
            : { icone: ClockIcon, cor: "text-warning", bg: "bg-warning/10", label: "Pendente" };

        const Icon = config.icone;

        return (
          <div
            key={boleto.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border p-4 shadow-sm hover:shadow-md transition-all gap-3 ${
              isAtrasado ? "border-destructive/30 bg-destructive/5" : "bg-card"
            } ${boleto.paid ? "opacity-70" : ""}`}
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
                <BarcodeIcon className={`h-5 w-5 ${config.cor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className={`font-medium truncate ${boleto.paid ? "line-through" : ""}`}>
                  {boleto.description}
                </h4>
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

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => onTogglePaid && onTogglePaid(boleto.id, !boleto.paid)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  boleto.paid
                    ? "bg-muted text-muted-foreground hover:bg-muted/80"
                    : "bg-success/10 text-success hover:bg-success/20"
                }`}
                title={boleto.paid ? "Reverter pagamento" : "Marcar como pago"}
              >
                {boleto.paid ? "Reverter" : "Pagar"}
              </button>

              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs whitespace-nowrap ${config.bg} ${config.cor}`}>
                <Icon className="h-3 w-3" />
                {config.label}
              </span>

              <p className="text-base sm:text-lg font-bold whitespace-nowrap">
                {(boleto.amount || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit && onEdit(boleto)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  title="Editar boleto"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>

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
          </div>
        );
      })}
    </div>
  );
}