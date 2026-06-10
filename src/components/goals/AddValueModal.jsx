import { useState } from "react";
import { XIcon, PlusIcon } from "lucide-react";

export default function AddValueModal({ goal, onClose, onSave }) {
  const [amount, setAmount] = useState("");
  const faltante = goal.targetAmount - goal.currentAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    onSave(Number(amount));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-xl animate-scale-in">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Adicionar Valor</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Meta: <strong>{goal.name}</strong><br />
          Faltam: R$ {faltante.toFixed(2)}
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={faltante}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="R$ 0,00"
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
            autoFocus
            required
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            <PlusIcon className="h-4 w-4" />
            Adicionar
          </button>
        </form>

        {/* Valores rápidos */}
        <div className="flex gap-2 mt-3">
          {[50, 100, 200, 500].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(String(val))}
              className="flex-1 rounded-md border px-2 py-1 text-xs hover:bg-muted transition-colors"
            >
              +R$ {val}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}