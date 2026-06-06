import { useState, useEffect } from "react";
import { XIcon, SaveIcon, LoaderIcon } from "lucide-react";
import categoryService from "@/api/categoryService";

const tipoLabels = {
  expense: "Despesa",
  income: "Renda",
  investment: "Invest.",
};

export default function TransactionModal({ onClose, onSave }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    type: "expense",
    categoryId: "",
    paid: false,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await categoryService.list();
      setCategories(data);

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
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!form.description.trim()) newErrors.description = "Descrição é obrigatória";
    if (!form.amount || Number(form.amount) <= 0) newErrors.amount = "Valor deve ser maior que zero";
    if (!form.categoryId) newErrors.categoryId = "Selecione uma categoria";
    if (!form.date) newErrors.date = "Data é obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await onSave({
        description: form.description.trim(),
        amount: parseFloat(form.amount),
        type: form.type,
        categoryId: form.categoryId,
        dueDate: new Date(form.date).toISOString(),
        paid: form.paid,
      });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setErrors({ submit: "Erro ao salvar. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Nova Transação</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted transition-colors">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Tipo */}
          <div>
            <label className="mb-1 block text-sm font-medium">Tipo</label>
            <div className="flex gap-2">
              {Object.entries(tipoLabels).map(([tipo, label]) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => handleTypeChange(tipo)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    form.type === tipo
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {label}
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
              onChange={(e) => { setForm({ ...form, description: e.target.value }); setErrors({ ...errors, description: null }); }}
              placeholder="Ex: Supermercado Extra"
              className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ${errors.description ? "border-destructive" : ""}`}
              required
            />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
          </div>

          {/* Valor */}
          <div>
            <label className="mb-1 block text-sm font-medium">Valor (R$) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => { setForm({ ...form, amount: e.target.value }); setErrors({ ...errors, amount: null }); }}
              placeholder="0,00"
              className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ${errors.amount ? "border-destructive" : ""}`}
              required
            />
            {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
          </div>

          {/* Data */}
          <div>
            <label className="mb-1 block text-sm font-medium">Data *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => { setForm({ ...form, date: e.target.value }); setErrors({ ...errors, date: null }); }}
              className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ${errors.date ? "border-destructive" : ""}`}
              required
            />
            {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
          </div>

          {/* Categoria */}
          <div>
            <label className="mb-1 block text-sm font-medium">Categoria *</label>
            {loadingCategories ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <LoaderIcon className="h-3 w-3 animate-spin" />
                Carregando categorias...
              </div>
            ) : (
              <select
                value={form.categoryId}
                onChange={(e) => { setForm({ ...form, categoryId: e.target.value }); setErrors({ ...errors, categoryId: null }); }}
                className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ${errors.categoryId ? "border-destructive" : ""}`}
                required
              >
                <option value="">Selecione...</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            )}
            {errors.categoryId && <p className="text-xs text-destructive mt-1">{errors.categoryId}</p>}
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
            <label htmlFor="paid" className="text-sm font-medium cursor-pointer">
              Já foi {form.type === "income" ? "recebido" : "pago"}
            </label>
          </div>

          {errors.submit && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{errors.submit}</div>
          )}

          {/* Botões */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {loading ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}