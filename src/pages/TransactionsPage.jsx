import { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PlusIcon, FilterIcon, TrashIcon, Trash2Icon, RefreshCwIcon } from "lucide-react";
import TransactionTable from "@/components/transactions/TransactionTable";
import TransactionModal from "@/components/transactions/TransactionModal";
import transactionService from "@/api/transactionService";

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
      setTransactions(data);
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
    try {
      await transactionService.create(newTransaction);
      loadTransactions(); // Recarregar lista
    } catch (error) {
      console.error("Erro ao adicionar:", error);
      throw error;
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;
    try {
      await transactionService.delete(id);
      loadTransactions();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir transação");
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("⚠️ Tem certeza que deseja excluir TODAS as transações? Esta ação não pode ser desfeita!")) return;
    try {
      await transactionService.deleteAll();
      loadTransactions();
    } catch (error) {
      console.error("Erro ao excluir todas:", error);
      alert("Erro ao excluir transações");
    }
  };

  const total = transactions.reduce((acc, t) => {
    if (t.type === "expense") return acc - t.amount;
    return acc + t.amount;
  }, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Transações</h2>
          <p className="text-muted-foreground">{transactions.length} transações encontradas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-2 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            title="Zerar todas as transações"
          >
            <Trash2Icon className="h-4 w-4" />
            Zerar Tudo
          </button>
          <button
            onClick={loadTransactions}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            title="Atualizar lista"
          >
            <RefreshCwIcon className="h-4 w-4" />
            Atualizar
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            <PlusIcon className="h-4 w-4" />
            Nova Transação
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
        <FilterIcon className="h-4 w-4 text-muted-foreground" />
        
        <select
          value={filters.month}
          onChange={(e) => setFilters({ ...filters, month: Number(e.target.value) })}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {format(new Date(2026, i), "MMMM", { locale: ptBR })}
            </option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm"
        >
          <option value="all">Todos os tipos</option>
          <option value="income">Renda</option>
          <option value="expense">Despesa</option>
          <option value="investment">Investimento</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm"
        >
          <option value="all">Todos os status</option>
          <option value="paid">Pago</option>
          <option value="pending">Pendente</option>
        </select>

        <div className="ml-auto text-sm font-medium">
          Total: <span className={total >= 0 ? "text-success" : "text-destructive"}>
            {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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