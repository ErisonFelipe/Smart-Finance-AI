import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircleIcon, CheckCircleIcon, ClockIcon, TrashIcon, PencilIcon } from "lucide-react";

export default function DebtList({ debts, emptyMessage, isHistory = false, onDelete, onPayInstallment, onEdit }) {
  if (!debts || debts.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {debts.map((debt) => {
        const paidInstallments = debt.installmentList?.filter((i) => i.paid).length || 0;
        const percentual = debt.installments > 0 ? Math.round((paidInstallments / debt.installments) * 100) : 0;
        const valorRestante = debt.totalAmount - (debt.paidAmount || 0);

        const statusConfig = {
          active: { icone: ClockIcon, cor: "text-info", bg: "bg-info/10", label: "Em andamento" },
          finished: { icone: CheckCircleIcon, cor: "text-success", bg: "bg-success/10", label: "Quitada" },
          late: { icone: AlertCircleIcon, cor: "text-destructive", bg: "bg-destructive/10", label: "Atrasada" },
        };

        const config = statusConfig[debt.status] || statusConfig.active;
        const Icon = config.icone;

        return (
          <div key={debt.id} className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-all">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{debt.name}</h4>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${config.bg} ${config.cor}`}>
                  <Icon className="h-3 w-3" />
                  {config.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {debt.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Restante: {valorRestante.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
                {!isHistory && (
                  <>
                    <button
                      onClick={() => onEdit && onEdit(debt)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      title="Editar dívida"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(debt.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Excluir dívida"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              Início: {format(parseISO(debt.startDate), "dd/MM/yyyy")}
            </p>

            <div className="mb-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{paidInstallments} de {debt.installments} parcelas</span>
                <span>{percentual}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full transition-all ${
                    debt.status === "finished" ? "bg-success" :
                    debt.status === "late" ? "bg-destructive" : "bg-primary"
                  }`}
                  style={{ width: `${percentual}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between text-sm mb-3">
              <span>Pago: {(debt.paidAmount || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              <span>Parcela: {(debt.totalAmount / debt.installments).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>

            {!isHistory && debt.installmentList && debt.installmentList.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-2">Parcelas:</p>
                <div className="flex flex-wrap gap-2">
                  {debt.installmentList.map((inst) => (
                    <button
                      key={inst.id}
                      onClick={() => onPayInstallment && onPayInstallment(inst.id, !inst.paid)}
                      className={`px-2 py-1 text-xs rounded-md transition-colors ${
                        inst.paid
                          ? "bg-success/10 text-success hover:bg-success/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                      title={`Parcela ${inst.number}ª - ${inst.paid ? "Paga" : "Pendente"} - Clique para alternar`}
                    >
                      {inst.number}ª
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}