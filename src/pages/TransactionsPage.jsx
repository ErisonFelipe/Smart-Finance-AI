import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PlusIcon, FilterIcon, ArrowUpDown } from "lucide-react";
import TransactionTable from "@/components/transactions/TransactionTable";
import TransactionModal from "@/components/transactions/TransactionModal";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    type: "all",
    status: "all",
  });

  useEffect(() => {
    // Dados mockados
    const mockTransactions = [
      { id: 1, descricao: "Salário", valor: 5000.00, data: "2026-06-01", tipo: "renda", categoria: "Salário", status: "pago" },
      { id: 2, descricao: "Aluguel", valor: 1500.00, data: "2026-06-05", tipo: "despesa", categoria: "Moradia", status: "pago" },
      { id: 3, descricao: "Supermercado", valor: 650.30, data: "2026-06-08", tipo: "despesa", categoria: "Alimentação", status: "pago" },
      { id: 4, descricao: "Gasolina", valor: 200.00, data: "2026-06-10", tipo: "despesa", categoria: "Transporte", status: "pendente" },
      { id: 5, descricao: "Freelance", valor: 2000.00, data: "2026-06-15", tipo: "renda", categoria: "Freelance", status: "pendente" },
      { id: 6, descricao: "Internet", valor: 119.90, data: "2026-06-10", tipo: "despesa", categoria: "Serviços", status: "pendente" },
      { id: 7, descricao: "Tesouro Direto", valor: 500.00, data: "2026-06-01", tipo: "investimento", categoria: "Renda Fixa", status: "pago" },
    ];
    setTransactions(mockTransactions);
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    const transactionDate = parseISO(t.data);
    const monthMatch = transactionDate.getMonth() === filters.month;
    const yearMatch = transactionDate.getFullYear() === filters.year;
    const typeMatch = filters.type === "all" || t.tipo === filters.type;
    const statusMatch = filters.status === "all" || t.status === filters.status;
    return monthMatch && yearMatch && typeMatch && statusMatch;
  });

  const handleAddTransaction = (newTransaction) => {
    setTransactions([...transactions, { ...newTransaction, id: Date.now() }]);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transações</h2>
          <p className="text-muted-foreground">Gerencie suas receitas, despesas e investimentos</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <PlusIcon className="h-4 w-4" />
          Nova Transação
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
        <FilterIcon className="h-4 w-4 text-muted-foreground" />
        
        {/* Filtro de Mês */}
        <select
          value={filters.month}
          onChange={(e) => setFilters({ ...filters, month: Number(e.target.value) })}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {format(new Date(2026, i), "MMMM", { locale: ptBR })}
            </option>
          ))}
        </select>

        {/* Filtro de Tipo */}
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
        >
          <option value="all">Todos os tipos</option>
          <option value="renda">Renda</option>
          <option value="despesa">Despesa</option>
          <option value="investimento">Investimento</option>
        </select>

        {/* Filtro de Status */}
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
        >
          <option value="all">Todos os status</option>
          <option value="pago">Pago</option>
          <option value="pendente">Pendente</option>
        </select>

        {/* Total filtrado */}
        <div className="ml-auto text-sm font-medium">
          Total: <span className="text-primary">
            {filteredTransactions
              .reduce((acc, t) => {
                if (t.tipo === "despesa") return acc - t.valor;
                return acc + t.valor;
              }, 0)
              .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
      </div>

      {/* Tabela */}
      <TransactionTable transactions={filteredTransactions} />

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