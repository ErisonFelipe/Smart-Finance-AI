import { useState, useEffect, useCallback } from "react";
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
import { ChevronLeftIcon, ChevronRightIcon, ArrowUpIcon, ArrowDownIcon, BarcodeIcon, TrendingUpIcon } from "lucide-react";
import transactionService from "@/api/transactionService";

const tipoConfig = {
  renda: { icone: ArrowUpIcon, cor: "text-success", bg: "bg-success/10", dot: "bg-success" },
  despesa: { icone: ArrowDownIcon, cor: "text-destructive", bg: "bg-destructive/10", dot: "bg-destructive" },
  boleto: { icone: BarcodeIcon, cor: "text-info", bg: "bg-info/10", dot: "bg-info" },
  investimento: { icone: TrendingUpIcon, cor: "text-warning", bg: "bg-warning/10", dot: "bg-warning" },
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const data = await transactionService.calendar(month, year);
      setEvents(data || []);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

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

  const selectedEvents = events.filter((event) =>
    isSameDay(parseISO(event.data), selectedDate)
  );

  const getEventsForDay = (date) => {
    return events.filter((event) => isSameDay(parseISO(event.data), date));
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Calendário Financeiro</h2>
        <p className="text-muted-foreground">Acompanhe seus vencimentos e recebimentos</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendário */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            {/* Navegação do mês */}
            <div className="mb-4 flex items-center justify-between">
              <button onClick={prevMonth} className="rounded-lg p-2 hover:bg-muted transition-colors">
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold capitalize">
                  {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                </h3>
                <button
                  onClick={goToToday}
                  className="text-xs text-primary hover:underline"
                >
                  Hoje
                </button>
              </div>
              <button onClick={nextMonth} className="rounded-lg p-2 hover:bg-muted transition-colors">
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Carregando eventos...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Dias da semana */}
                <div className="mb-2 grid grid-cols-7">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
                    <div key={dia} className="text-center text-xs font-medium text-muted-foreground py-1">
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
                            className={`flex flex-col items-center rounded-lg p-2 text-sm transition-all hover:bg-muted ${
                              !isCurrentMonth ? "opacity-30" : ""
                            } ${isSelected ? "bg-primary text-primary-foreground shadow-sm" : ""} ${
                              isDayToday && !isSelected ? "ring-2 ring-primary ring-offset-1" : ""
                            }`}
                          >
                            <span className="font-medium">{format(date, "d")}</span>
                            {dayEvents.length > 0 && (
                              <div className="mt-1 flex gap-0.5">
                                {[...new Set(dayEvents.map((e) => e.tipo))].slice(0, 3).map((tipo) => (
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
                  {Object.entries(tipoConfig).map(([key, config]) => (
                    <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Eventos do dia selecionado */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border bg-card p-4 shadow-sm sticky top-20">
            <h3 className="mb-4 text-lg font-semibold">
              {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </h3>

            {selectedEvents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-sm text-muted-foreground">Nenhum evento neste dia</p>
              </div>
            ) : (
              <>
                <ul className="flex flex-col gap-2">
                  {selectedEvents.map((event) => {
                    const config = tipoConfig[event.tipo] || tipoConfig.despesa;
                    const Icon = config.icone;

                    return (
                      <li
                        key={event.id}
                        className={`flex items-center justify-between rounded-lg border p-3 ${
                          event.pago ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                            <Icon className={`h-4 w-4 ${config.cor}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{event.descricao}</p>
                            <p className="text-xs text-muted-foreground">
                              {event.tipo} {event.pago ? "• Pago" : "• Pendente"}
                            </p>
                          </div>
                        </div>
                        <p className={`text-sm font-semibold shrink-0 ml-2 ${config.cor}`}>
                          {(event.valor || 0).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                      </li>
                    );
                  })}
                </ul>

                {/* Resumo do dia */}
                <div className="mt-4 border-t pt-4 space-y-1">
                  <p className="text-sm font-medium">Resumo do dia:</p>
                  <p className="text-sm text-success">
                    +{" "}
                    {selectedEvents
                      .filter((e) => e.tipo === "renda")
                      .reduce((acc, e) => acc + (e.valor || 0), 0)
                      .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                  <p className="text-sm text-destructive">
                    -{" "}
                    {selectedEvents
                      .filter((e) => e.tipo === "despesa" || e.tipo === "boleto")
                      .reduce((acc, e) => acc + (e.valor || 0), 0)
                      .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}