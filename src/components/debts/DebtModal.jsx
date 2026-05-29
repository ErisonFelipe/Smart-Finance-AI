import { useState } from "react";
import { XIcon, SaveIcon } from "lucide-react";

export default function DebtModal({ type, onClose, onSave }) {
  const isBoleto = type === "boleto";

  const [form, setForm] = useState(
    isBoleto
      ? { descricao: "", codigoBarras: "", valor: "", vencimento: "", status: "pendente" }
      : { nome: "", valorTotal: "", parcelasTotais: "", dataInicio: "", status: "ativa" }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isBoleto) {
      onSave({ ...form, valor: Number(form.valor) });
    } else {
      const valorTotal = Number(form.valorTotal);
      const parcelasTotais = Number(form.parcelasTotais);
      onSave({
        nome: form.nome,
        valorTotal,
        valorPago: 0,
        parcelasTotais,
        parcelasPagas: 0,
        dataInicio: form.dataInicio,
        status: form.status,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {isBoleto ? "Novo Boleto" : "Nova Dívida"}
          </h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isBoleto ? (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium">Descrição</label>
                <input
                  type="text"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Ex: Conta de Luz"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Código de Barras</label>
                <input
                  type="text"
                  value={form.codigoBarras}
                  onChange={(e) => setForm({ ...form, codigoBarras: e.target.value })}
                  placeholder="00000000000000000000000000000000000000000000"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
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
              <div>
                <label className="mb-1 block text-sm font-medium">Vencimento</label>
                <input
                  type="date"
                  value={form.vencimento}
                  onChange={(e) => setForm({ ...form, vencimento: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium">Nome da Dívida</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: Notebook Dell"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Valor Total (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valorTotal}
                  onChange={(e) => setForm({ ...form, valorTotal: e.target.value })}
                  placeholder="0,00"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Nº de Parcelas</label>
                <input
                  type="number"
                  value={form.parcelasTotais}
                  onChange={(e) => setForm({ ...form, parcelasTotais: e.target.value })}
                  placeholder="12"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Data de Início</label>
                <input
                  type="date"
                  value={form.dataInicio}
                  onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <SaveIcon className="h-4 w-4" />
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}