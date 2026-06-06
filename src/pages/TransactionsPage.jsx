import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PlusIcon, FilterIcon, Trash2Icon, RefreshCwIcon } from "lucide-react";
import TransactionTable from "@/components/transactions/TransactionTable";
import TransactionModal from "@/components/transactions/TransactionModal";
import transactionService from "@/api/transactionService";

const tipos = [
  { value: "all", label: "Todos os tipos" },
  { value: "income", label: "Renda" },
  { value: "expense", label: "Despesa" },
  { value: "investment", label: "Investimento" },
];

const statusList = [
  { value: "all", label: "Todos os status" },
  { value: "paid", label: "Pago" },
  { value: "pending", label: "Pendente" },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    type: "all",
    status: "all",
  });

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await transactionService.list({
        month: filters.month + 1,
        year: filters.year,
        type: filters.type,
        status: filters.status,
      });
      setTransactions(data || []);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleAddTransaction = async (newTransaction) => {
    await transactionService.create(newTransaction);
    setIsModalOpen(false);
    loadTransactions();
  };

  const handleDeleteTransaction = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;
    await transactionService.delete(id);
    loadTransactions();
  };

  const handleDeleteAll = async () => {
    if (!confirm("⚠️ Tem certeza que deseja excluir TODAS as transações? Esta ação não pode ser desfeita!")) return;
    await transactionService.deleteAll();
    loadTransactions();
  };

  const total = transactions.reduce((acc, t) => {
    if (t.type === "expense") return acc - (t.amount || 0);
    return acc + (t.amount || 0);
  }, 0);

  const currentMonthLabel = format(new Date(filters.year, filters.month), "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Transações</h2>
          <p className="text-muted-foreground">
            {loading ? "Carregando..." : `${transactions.length} transação${transactions.length !== 1 ? "ões" : ""} em ${currentMonthLabel}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-2 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            title="Zerar todas as transações"
          >
            <Trash2Icon className="h-4 w-4" />
            <span className="hidden sm:inline">Zerar Tudo</span>
          </button>
          <button
            onClick={loadTransactions}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            title="Atualizar lista"
          >
            <RefreshCwIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors shadow-sm hover:shadow-md"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
        <FilterIcon className="h-4 w-4 text-muted-foreground shrink-0" />

        <select
          value={filters.month}
          onChange={(e) => setFilters({ ...filters, month: Number(e.target.value) })}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm flex-1 min-w-[120px]"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {format(new Date(filters.year, i), "MMMM", { locale: ptBR })}
            </option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm flex-1 min-w-[120px]"
        >
          {tipos.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm flex-1 min-w-[120px]"
        >
          {statusList.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <div className="ml-auto text-sm font-medium whitespace-nowrap">
          Total:{" "}
          <span className={total >= 0 ? "text-success font-bold" : "text-destructive font-bold"}>
            {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Carregando transações...</p>
          </div>
        </div>
      ) : (
        <TransactionTable
          transactions={transactions}
          onDelete={handleDeleteTransaction}
        />
      )}

      {/* Modal */}
      {isModalOpen && (
        <TransactionModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddTransaction}
        />
      )}
    </div>
  );
}