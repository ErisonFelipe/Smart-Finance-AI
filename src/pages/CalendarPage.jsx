import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon, ArrowUpIcon, ArrowDownIcon, BarcodeIcon } from "lucide-react";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Eventos mockados (transações + boletos)
    const mockEvents = [
      { id: 1, descricao: "Salário", data: "2026-06-01", tipo: "renda", valor: 5000.00 },
      { id: 2, descricao: "Aluguel", data: "2026-06-05", tipo: "despesa", valor: 1500.00 },
      { id: 3, descricao: "Internet", data: "2026-06-10", tipo: "despesa", valor: 119.90 },
      { id: 4, descricao: "Supermercado", data: "2026-06-08", tipo: "despesa", valor: 650.30 },
      { id: 5, descricao: "Freelance", data: "2026-06-15", tipo: "renda", valor: 2000.00 },
      { id: 6, descricao: "Plano de Saúde", data: "2026-06-10", tipo: "boleto", valor: 450.00 },
      { id: 7, descricao: "Seguro Auto", data: "2026-06-05", tipo: "boleto", valor: 320.00 },
      { id: 8, descricao: "Gasolina", data: "2026-06-15", tipo: "despesa", valor: 200.00 },
      { id: 9, descricao: "Investimento", data: "2026-06-20", tipo: "investimento", valor: 500.00 },
      { id: 10, descricao: "Venda produto", data: "2026-05-28", tipo: "renda", valor: 350.00 },
    ];
    setEvents(mockEvents);
  }, []);

  // Gerar dias do calendário
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const rows = [];
  let days = [];
  let day = calendarStart;

  while (day <= calendarEnd) {
    for (let i = 0; i < 7; i++) {
      days.push(day);
      day = addDays(day, 1);
    }
    rows.push(days);
    days = [];
  }

  // Eventos do dia selecionado
  const selectedEvents = events.filter((event) =>
    isSameDay(parseISO(event.data), selectedDate)
  );

  // Eventos de um dia específico (para dots)
  const getEventsForDay = (date) => {
    return events.filter((event) => isSameDay(parseISO(event.data), date));
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const tipoConfig = {
    renda: { icone: ArrowUpIcon, cor: "text-success", bg: "bg-success/10", dot: "bg-success" },
    despesa: { icone: ArrowDownIcon, cor: "text-destructive", bg: "bg-destructive/10", dot: "bg-destructive" },
    boleto: { icone: BarcodeIcon, cor: "text-info", bg: "bg-info/10", dot: "bg-info" },
    investimento: { icone: ArrowUpIcon, cor: "text-warning", bg: "bg-warning/10", dot: "bg-warning" },
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold">Calendário Financeiro</h2>
        <p className="text-muted-foreground">Acompanhe seus vencimentos e recebimentos</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendário */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            {/* Navegação do mês */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={prevMonth}
                className="rounded p-1 hover:bg-muted"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-semibold capitalize">
                {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
              </h3>
              <button
                onClick={nextMonth}
                className="rounded p-1 hover:bg-muted"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Dias da semana */}
            <div className="mb-2 grid grid-cols-7">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
                <div key={dia} className="text-center text-xs font-medium text-muted-foreground">
                  {dia}
                </div>
              ))}
            </div>

            {/* Grid do calendário */}
            <div className="flex flex-col gap-1">
              {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-7 gap-1">
                  {row.map((date, dayIndex) => {
                    const dayEvents = getEventsForDay(date);
                    const isCurrentMonth = isSameMonth(date, currentMonth);
                    const isSelected = isSameDay(date, selectedDate);
                    const isDayToday = isToday(date);

                    return (
                      <button
                        key={dayIndex}
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center rounded-md p-2 text-sm transition-colors hover:bg-muted ${
                          !isCurrentMonth ? "text-muted-foreground/40" : ""
                        } ${isSelected ? "bg-primary text-primary-foreground" : ""} ${
                          isDayToday && !isSelected ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <span>{format(date, "d")}</span>
                        {/* Dots de eventos */}
                        {dayEvents.length > 0 && (
                          <div className="mt-1 flex gap-0.5">
                            {[...new Set(dayEvents.map((e) => e.tipo))].map((tipo) => (
                              <span
                                key={tipo}
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isSelected ? "bg-primary-foreground" : tipoConfig[tipo]?.dot || "bg-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legenda */}
            <div className="mt-4 flex flex-wrap gap-4 border-t pt-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-success" />
                Receita
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                Despesa
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-info" />
                Boleto
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-warning" />
                Investimento
              </div>
            </div>
          </div>
        </div>

        {/* Eventos do dia selecionado */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">
              {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </h3>

            {selectedEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum evento neste dia</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {selectedEvents.map((event) => {
                  const config = tipoConfig[event.tipo] || tipoConfig.despesa;
                  const Icon = config.icone;

                  return (
                    <li
                      key={event.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full p-1.5 ${config.bg}`}>
                          <Icon className={`h-4 w-4 ${config.cor}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{event.descricao}</p>
                          <p className="text-xs capitalize text-muted-foreground">{event.tipo}</p>
                        </div>
                      </div>
                      <p className={`text-sm font-medium ${config.cor}`}>
                        {event.valor.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Resumo do dia */}
            {selectedEvents.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <p className="text-sm font-medium">Resumo do dia:</p>
                <p className="text-sm text-success">
                  Entradas: +{" "}
                  {selectedEvents
                    .filter((e) => e.tipo === "renda")
                    .reduce((acc, e) => acc + e.valor, 0)
                    .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
                <p className="text-sm text-destructive">
                  Saídas: -{" "}
                  {selectedEvents
                    .filter((e) => e.tipo === "despesa" || e.tipo === "boleto")
                    .reduce((acc, e) => acc + e.valor, 0)
                    .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}