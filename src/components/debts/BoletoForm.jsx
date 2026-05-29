import { format, parseISO, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarcodeIcon, CheckCircleIcon, AlertCircleIcon, ClockIcon } from "lucide-react";

export default function BoletoForm({ boletos }) {
  if (boletos.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Nenhum boleto cadastrado
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {boletos.map((boleto) => {
        const isAtrasado = isPast(parseISO(boleto.vencimento)) && boleto.status !== "pago";
        
        const statusConfig = {
          pago: { icone: CheckCircleIcon, cor: "text-success", bg: "bg-success/10", label: "Pago" },
          pendente: { icone: ClockIcon, cor: "text-warning", bg: "bg-warning/10", label: "Pendente" },
          atrasado: { icone: AlertCircleIcon, cor: "text-destructive", bg: "bg-destructive/10", label: "Atrasado" },
        };

        const config = statusConfig[isAtrasado ? "atrasado" : boleto.status] || statusConfig.pendente;
        const Icon = config.icone;

        return (
          <div
            key={boleto.id}
            className={`flex items-center justify-between rounded-lg border p-4 shadow-sm ${
              isAtrasado ? "border-destructive/30 bg-destructive/5" : "bg-card"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-full p-2 ${config.bg}`}>
                <BarcodeIcon className={`h-5 w-5 ${config.cor}`} />
              </div>
              <div>
                <h4 className="font-medium">{boleto.descricao}</h4>
                <p className="text-xs text-muted-foreground">
                  Vencimento: {format(parseISO(boleto.vencimento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  Cód: {boleto.codigoBarras}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${config.bg} ${config.cor}`}>
                <Icon className="h-3 w-3" />
                {config.label}
              </span>
              <p className="text-lg font-bold">
                {boleto.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}