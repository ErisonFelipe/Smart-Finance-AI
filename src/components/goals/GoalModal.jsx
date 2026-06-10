import { useState } from "react";
import { XIcon, SaveIcon, LoaderIcon } from "lucide-react";

const defaultColors = ["#059669", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899"];

export default function GoalModal({ goal, onClose, onSave }) {
  const isEditing = !!goal;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: goal?.name || "",
    targetAmount: goal?.targetAmount || "",
    deadline: goal?.deadline ? new Date(goal.deadline).toISOString().slice(0, 10) : "",
    color: goal?.color || "#059669",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        name: form.name.trim(),
        targetAmount: Number(form.targetAmount),
        deadline: form.deadline || null,
        color: form.color,
      });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl animate-scale-in">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{isEditing ? "Editar Meta" : "Nova Meta"}</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nome *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Comprar um carro"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Valor da Meta (R$) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.targetAmount}
              onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
              placeholder="0,00"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Prazo (opcional)</label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Cor</label>
            <div className="flex gap-2">
              {defaultColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    form.color === color ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            {loading ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </div>
    </div>
  );
}