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
        <p className="text-sm">Nenhuma transação encontrada</p>
        <p className="text-xs text-muted-foreground mt-1">
          Clique em "Nova Transação" para adicionar
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                Categoria
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Valor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-10">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const config = tipoConfig[transaction.type] || tipoConfig.expense;
              const Icon = config.icone;
              const data = transaction.dueDate ? parseISO(transaction.dueDate) : new Date();

              return (
                <tr
                  key={transaction.id}
                  className="border-b transition-colors hover:bg-muted/30"
                >
                  {/* Data */}
                  <td className="px-4 py-3 text-sm whitespace-nowrap text-muted-foreground">
                    {format(data, "dd/MM/yyyy")}
                  </td>

                  {/* Descrição + categoria no mobile */}
                  <td className="px-4 py-3 text-sm font-medium">
                    <p className="truncate max-w-[150px] sm:max-w-none">
                      {transaction.description}
                    </p>
                    {/* Categoria visível só no mobile */}
                    <span
                      className={`inline-flex sm:hidden items-center gap-1 rounded-full px-2 py-0.5 text-xs mt-1 ${config.bg} ${config.cor}`}
                    >
                      <Icon className="h-3 w-3" />
                      {transaction.category?.name || config.label}
                    </span>
                  </td>

                  {/* Categoria (desktop) */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${config.bg} ${config.cor}`}
                    >
                      <Icon className="h-3 w-3" />
                      {transaction.category?.name || config.label}
                    </span>
                  </td>

                  {/* Valor */}
                  <td
                    className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${
                      transaction.type === "expense"
                        ? "text-destructive"
                        : transaction.type === "income"
                          ? "text-success"
                          : "text-warning"
                    }`}
                  >
                    {transaction.type === "expense" ? "- " : "+ "}
                    {(transaction.amount || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>

                  {/* Status (desktop) */}
                  <td className="px-4 py-3 hidden md:table-cell">
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

                  {/* Ações */}
                  <td className="px-2 py-3 text-center">
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

      {/* Contagem */}
      <div className="border-t px-4 py-2 text-xs text-muted-foreground">
        {transactions.length} transação{transactions.length !== 1 ? "ões" : ""}
      </div>
    </div>
  );
}