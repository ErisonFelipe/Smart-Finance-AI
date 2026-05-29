import { format, parseISO, isFuture, isPast, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpIcon, ArrowDownIcon, CalendarIcon, AlertCircleIcon } from "lucide-react";

export default function UpcomingPayments({ items }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Próximos Vencimentos
      </h3>
      <p className="mb-4 text-2xl font-bold">{items.length} eventos</p>
      
      <ul className="flex flex-col gap-2">
        {items.map((item, index) => {
          const data = parseISO(item.data);
          const isUpcoming = isFuture(data);
          const isOverdue = isPast(data) && !isUpcoming;
          const dias = Math.abs(differenceInDays(data, new Date()));

          return (
            <li
              key={index}
              className={`group flex items-center justify-between rounded-lg p-3 transition-all hover:bg-muted ${
                isOverdue ? "border border-destructive/20 bg-destructive/5" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  item.tipo === "renda" ? "bg-success-light" : 
                  isOverdue ? "bg-destructive-light" : "bg-muted"
                }`}>
                  {item.tipo === "renda" ? (
                    <ArrowUpIcon className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowDownIcon className={`h-4 w-4 ${isOverdue ? "text-destructive" : "text-muted-foreground"}`} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{item.descricao}</p>
                  <p className={`flex items-center gap-1 text-xs ${
                    isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                  }`}>
                    <CalendarIcon className="h-3 w-3" />
                    {format(data, "dd 'de' MMM", { locale: ptBR })}
                    {isOverdue && (
                      <span className="flex items-center gap-0.5">
                        <AlertCircleIcon className="h-3 w-3" />
                        {dias} dia{dias > 1 ? "s" : ""}
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="text-muted-foreground">
                        • em {dias} dia{dias > 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <p className={`text-sm font-semibold ${
                item.tipo === "renda" ? "text-success" : 
                isOverdue ? "text-destructive" : "text-foreground"
              }`}>
                {item.tipo === "renda" ? "+" : "-"}
                {item.valor.toLocaleString("pt-BR", {
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