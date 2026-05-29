import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, CheckCircleIcon, ClockIcon } from "lucide-react";

const tipoConfig = {
  renda: { icone: ArrowUpIcon, cor: "text-success", bg: "bg-success/10" },
  despesa: { icone: ArrowDownIcon, cor: "text-destructive", bg: "bg-destructive/10" },
  investimento: { icone: TrendingUpIcon, cor: "text-warning", bg: "bg-warning/10" },
};

export default function TransactionTable({ transactions }) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Nenhuma transação encontrada
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">DATA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">DESCRIÇÃO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">CATEGORIA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">VALOR</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const config = tipoConfig[transaction.tipo];
              const Icon = config.icone;
              const data = parseISO(transaction.data);

              return (
                <tr key={transaction.id} className="border-b transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm">
                    {format(data, "dd/MM/yyyy")}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{transaction.descricao}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${config.bg} ${config.cor}`}>
                      <Icon className="h-3 w-3" />
                      {transaction.categoria}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium ${
                    transaction.tipo === "despesa" ? "text-destructive" : "text-success"
                  }`}>
                    {transaction.tipo === "despesa" ? "- " : "+ "}
                    {transaction.valor.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {transaction.status === "pago" ? (
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}