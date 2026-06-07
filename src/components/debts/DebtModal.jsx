import { useState, useEffect } from "react";
import { XIcon, SaveIcon, LoaderIcon } from "lucide-react";
import categoryService from "@/api/categoryService";

export default function DebtModal({ type, onClose, onSave }) {
  const isBoleto = type === "boleto";
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState(
    isBoleto
      ? { descricao: "", codigoBarras: "", valor: "", vencimento: "" }
      : { nome: "", valorTotal: "", parcelasTotais: "", dataInicio: new Date().toISOString().slice(0, 10), categoriaId: "" }
  );

  useEffect(() => {
    if (!isBoleto) loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.list();
      setCategories(data.filter((c) => c.type === "expense"));
      // Selecionar primeira categoria por padrão
      const expenseCats = data.filter((c) => c.type === "expense");
      if (expenseCats.length > 0) {
        setForm((prev) => ({ ...prev, categoriaId: expenseCats[0].id }));
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (isBoleto) {
      if (!form.descricao.trim()) newErrors.descricao = "Descrição é obrigatória";
      if (!form.valor || Number(form.valor) <= 0) newErrors.valor = "Valor deve ser maior que zero";
      if (!form.vencimento) newErrors.vencimento = "Data de vencimento é obrigatória";
    } else {
      if (!form.nome.trim()) newErrors.nome = "Nome é obrigatório";
      if (!form.valorTotal || Number(form.valorTotal) <= 0) newErrors.valorTotal = "Valor deve ser maior que zero";
      if (!form.parcelasTotais || Number(form.parcelasTotais) < 1) newErrors.parcelasTotais = "Mínimo 1 parcela";
      if (Number(form.parcelasTotais) > 120) newErrors.parcelasTotais = "Máximo 120 parcelas";
      if (!form.dataInicio) newErrors.dataInicio = "Data de início é obrigatória";
      if (!form.categoriaId) newErrors.categoriaId = "Selecione uma categoria";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isBoleto) {
        await onSave({
          description: form.descricao.trim(),
          amount: Number(form.valor),
          dueDate: new Date(form.vencimento).toISOString(),
          barcode: form.codigoBarras || null,
        });
      } else {
        await onSave({
          name: form.nome.trim(),
          totalAmount: Number(form.valorTotal),
          dueDate: new Date(form.vencimento + "T12:00:00").toISOString(),
          installments: Number(form.parcelasTotais),
          categoryId: form.categoriaId,
        });
      }
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
          <h3 className="text-lg font-semibold">
            {isBoleto ? "Novo Boleto" : "Nova Dívida"}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted transition-colors">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isBoleto ? (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium">Descrição *</label>
                <input
                  type="text"
                  value={form.descricao}
                  onChange={(e) => { setForm({ ...form, descricao: e.target.value }); setErrors({ ...errors, descricao: null }); }}
                  placeholder="Ex: Conta de Luz"
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ${errors.descricao ? "border-destructive" : ""}`}
                  required
                />
                {errors.descricao && <p className="text-xs text-destructive mt-1">{errors.descricao}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Código de Barras</label>
                <input
                  type="text"
                  value={form.codigoBarras}
                  onChange={(e) => setForm({ ...form, codigoBarras: e.target.value })}
                  placeholder="00000000000000000000000000000000000000000000"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.valor}
                  onChange={(e) => { setForm({ ...form, valor: e.target.value }); setErrors({ ...errors, valor: null }); }}
                  placeholder="0,00"
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ${errors.valor ? "border-destructive" : ""}`}
                  required
                />
                {errors.valor && <p className="text-xs text-destructive mt-1">{errors.valor}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Vencimento *</label>
                <input
                  type="date"
                  value={form.vencimento}
                  onChange={(e) => { setForm({ ...form, vencimento: e.target.value }); setErrors({ ...errors, vencimento: null }); }}
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ${errors.vencimento ? "border-destructive" : ""}`}
                  required
                />
                {errors.vencimento && <p className="text-xs text-destructive mt-1">{errors.vencimento}</p>}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium">Nome da Dívida *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => { setForm({ ...form, nome: e.target.value }); setErrors({ ...errors, nome: null }); }}
                  placeholder="Ex: Notebook Dell"
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ${errors.nome ? "border-destructive" : ""}`}
                  required
                />
                {errors.nome && <p className="text-xs text-destructive mt-1">{errors.nome}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Valor Total (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.valorTotal}
                  onChange={(e) => { setForm({ ...form, valorTotal: e.target.value }); setErrors({ ...errors, valorTotal: null }); }}
                  placeholder="0,00"
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ${errors.valorTotal ? "border-destructive" : ""}`}
                  required
                />
                {errors.valorTotal && <p className="text-xs text-destructive mt-1">{errors.valorTotal}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Nº de Parcelas *</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={form.parcelasTotais}
                  onChange={(e) => { setForm({ ...form, parcelasTotais: e.target.value }); setErrors({ ...errors, parcelasTotais: null }); }}
                  placeholder="12"
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ${errors.parcelasTotais ? "border-destructive" : ""}`}
                  required
                />
                {errors.parcelasTotais && <p className="text-xs text-destructive mt-1">{errors.parcelasTotais}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Data de Início *</label>
                <input
                  type="date"
                  value={form.dataInicio}
                  onChange={(e) => { setForm({ ...form, dataInicio: e.target.value }); setErrors({ ...errors, dataInicio: null }); }}
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ${errors.dataInicio ? "border-destructive" : ""}`}
                  required
                />
                {errors.dataInicio && <p className="text-xs text-destructive mt-1">{errors.dataInicio}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Categoria *</label>
                <select
                  value={form.categoriaId}
                  onChange={(e) => { setForm({ ...form, categoriaId: e.target.value }); setErrors({ ...errors, categoriaId: null }); }}
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ${errors.categoriaId ? "border-destructive" : ""}`}
                  required
                >
                  <option value="">Selecione uma categoria...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoriaId && <p className="text-xs text-destructive mt-1">{errors.categoriaId}</p>}
              </div>
            </>
          )}

          {errors.submit && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{errors.submit}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {loading ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </div>
    </div>
  );
}