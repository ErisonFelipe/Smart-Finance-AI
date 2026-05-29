import { useState } from "react";
import { XIcon, SaveIcon } from "lucide-react";

const categorias = {
  renda: ["Salário", "Freelance", "Vendas", "Outros"],
  despesa: ["Alimentação", "Transporte", "Moradia", "Saúde", "Lazer", "Serviços", "Outros"],
  investimento: ["Renda Fixa", "Ações", "FIIs", "Cripto", "Outros"],
};

export default function TransactionModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    data: new Date().toISOString().slice(0, 10),
    tipo: "despesa",
    categoria: "Alimentação",
    status: "pendente",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      valor: Number(form.valor),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Nova Transação</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Tipo */}
          <div>
            <label className="mb-1 block text-sm font-medium">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value, categoria: categorias[e.target.value][0] })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="despesa">Despesa</option>
              <option value="renda">Renda</option>
              <option value="investimento">Investimento</option>
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="mb-1 block text-sm font-medium">Descrição</label>
            <input
              type="text"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Ex: Supermercado Extra"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          {/* Valor */}
          <div>
            <label className="mb-1 block text-sm font-medium">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              placeholder="0,00"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          {/* Data */}
          <div>
            <label className="mb-1 block text-sm font-medium">Data</label>
            <input
              type="date"
              value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="mb-1 block text-sm font-medium">Categoria</label>
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {categorias[form.tipo].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
            </select>
          </div>

          {/* Botão Salvar */}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <SaveIcon className="h-4 w-4" />
            Salvar Transação
          </button>
        </form>
      </div>
    </div>
  );
}