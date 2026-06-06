import { useState, useEffect } from "react";
import { XIcon, SaveIcon, LoaderIcon } from "lucide-react";
import categoryService from "@/api/categoryService";

export default function EditDebtModal({ item, type, onClose, onSave }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: item.name || item.description || "",
    totalAmount: item.totalAmount || item.amount || 0,
    categoryId: item.categoryId || "",
    description: item.description || "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.list();
      setCategories(data.filter((c) => c.type === "expense"));
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (type === "divida") {
      if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
      if (!form.totalAmount || Number(form.totalAmount) <= 0) newErrors.totalAmount = "Valor deve ser maior que zero";
    } else {
      if (!form.description.trim()) newErrors.description = "Descrição é obrigatória";
      if (!form.totalAmount || Number(form.totalAmount) <= 0) newErrors.totalAmount = "Valor deve ser maior que zero";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data =
        type === "divida"
          ? {
              name: form.name.trim(),
              totalAmount: Number(form.totalAmount),
              categoryId: form.categoryId || undefined,
            }
          : {
              description: form.description.trim(),
              amount: Number(form.totalAmount),
            };
      await onSave(item.id, data);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setErrors({ submit: "Erro ao salvar. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl animate-scale-in">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Editar {type === "divida" ? "Dívida" : "Boleto"}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted transition-colors">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {type === "divida" ? (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ${errors.name ? "border-destructive" : ""}`}
                  required
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Valor Total (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.totalAmount}
                  onChange={(e) => handleChange("totalAmount", e.target.value)}
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ${errors.totalAmount ? "border-destructive" : ""}`}
                  required
                />
                {errors.totalAmount && <p className="text-xs text-destructive mt-1">{errors.totalAmount}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Categoria</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => handleChange("categoryId", e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Manter atual</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  A categoria não altera as parcelas já criadas
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium">Descrição *</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ${errors.description ? "border-destructive" : ""}`}
                  required
                />
                {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.totalAmount}
                  onChange={(e) => handleChange("totalAmount", e.target.value)}
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ${errors.totalAmount ? "border-destructive" : ""}`}
                  required
                />
                {errors.totalAmount && <p className="text-xs text-destructive mt-1">{errors.totalAmount}</p>}
              </div>
            </>
          )}

          {errors.submit && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{errors.submit}</div>
          )}

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