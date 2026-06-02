import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale"; 
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, CheckCircleIcon, ClockIcon, TrashIcon } from "lucide-react";

const tipoConfig = {
  income: { icone: ArrowUpIcon, cor: "text-success", bg: "bg-success/10", label: "Renda" },
  expense: { icone: ArrowDownIcon, cor: "text-destructive", bg: "bg-destructive/10", label: "Despesa" },
  investment: { icone: TrendingUpIcon, cor: "text-warning", bg: "bg-warning/10", label: "Invest." },
};

export default function TransactionTable({ transactions, onDelete }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        Nenhuma transação encontrada
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">DATA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">DESCRIÇÃO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">CATEGORIA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">VALOR</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">STATUS</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const config = tipoConfig[transaction.type] || tipoConfig.expense;
              const Icon = config.icone;
              const data = transaction.dueDate ? parseISO(transaction.dueDate) : new Date();

              return (
                <tr key={transaction.id} className="border-b transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {format(data, "dd/MM/yyyy")}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{transaction.description}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${config.bg} ${config.cor}`}>
                      <Icon className="h-3 w-3" />
                      {transaction.category?.name || config.label}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${
                    transaction.type === "expense" ? "text-destructive" : "text-success"
                  }`}>
                    {transaction.type === "expense" ? "- " : "+ "}
                    {transaction.amount?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {transaction.paid ? (
                      <span className="inline-flex items-center gap-1 text-xs text-success">
                        <CheckCircleIcon className="h-3 w-3" />
                        Pago
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-warning">
                        <ClockIcon className="h-3 w-3" />
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onDelete && onDelete(transaction.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Excluir transação"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}