import { useState, useEffect } from "react";
import { XIcon, SaveIcon, LoaderIcon } from "lucide-react";
import categoryService from "@/api/categoryService";

export default function TransactionModal({ onClose, onSave }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    type: "expense",
    categoryId: "",
    paid: false,
  });

  // Buscar categorias da API
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await categoryService.list();
      setCategories(data);
      
      // Definir primeira categoria como padrão
      const expenseCategories = data.filter((c) => c.type === "expense");
      if (expenseCategories.length > 0) {
        setForm((prev) => ({ ...prev, categoryId: expenseCategories[0].id }));
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === form.type);

  const handleTypeChange = (type) => {
    const catsOfType = categories.filter((c) => c.type === type);
    setForm({
      ...form,
      type,
      categoryId: catsOfType.length > 0 ? catsOfType[0].id : "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.description || !form.amount || !form.categoryId) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);
      
      const dataToSend = {
        description: form.description,
        amount: parseFloat(form.amount),
        type: form.type,
        categoryId: form.categoryId,
        dueDate: new Date(form.date).toISOString(),
        paid: form.paid,
      };

      console.log("📤 Enviando:", dataToSend);
      await onSave(dataToSend);
      onClose();
    } catch (error) {
      console.error("❌ Erro ao salvar:", error);
      alert("Erro ao salvar transação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl animate-scale-in">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Nova Transação</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Tipo */}
          <div>
            <label className="mb-1 block text-sm font-medium">Tipo *</label>
            <div className="flex gap-2">
              {["expense", "income", "investment"].map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => handleTypeChange(tipo)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    form.type === tipo
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {tipo === "expense" ? "Despesa" : tipo === "income" ? "Renda" : "Invest."}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="mb-1 block text-sm font-medium">Descrição *</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: Supermercado Extra"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          {/* Valor */}
          <div>
            <label className="mb-1 block text-sm font-medium">Valor (R$) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0,00"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          {/* Data */}
          <div>
            <label className="mb-1 block text-sm font-medium">Data *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="mb-1 block text-sm font-medium">Categoria *</label>
            {loadingCategories ? (
              <p className="text-sm text-muted-foreground">Carregando categorias...</p>
            ) : (
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Selecione...</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="paid"
              checked={form.paid}
              onChange={(e) => setForm({ ...form, paid: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="paid" className="text-sm font-medium">Já foi pago/recebido</label>
          </div>

          {/* Botão Salvar */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            {loading ? (
              <LoaderIcon className="h-4 w-4 animate-spin" />
            ) : (
              <SaveIcon className="h-4 w-4" />
            )}
            {loading ? "Salvando..." : "Salvar Transação"}
          </button>
        </form>
      </div>
    </div>
  );
}