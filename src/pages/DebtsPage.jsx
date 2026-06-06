import { useState, useEffect, useCallback } from "react";
import { PlusIcon, RefreshCwIcon } from "lucide-react";
import DebtList from "@/components/debts/DebtList";
import BoletoForm from "@/components/debts/BoletoForm";
import DebtModal from "@/components/debts/DebtModal";
import EditDebtModal from "@/components/debts/EditDebtModal";
import debtService from "@/api/debtService";
import boletoService from "@/api/boletoService";

const tabs = [
  { id: "dividas", label: "Dívidas Ativas" },
  { id: "boletos", label: "Boletos" },
  { id: "historico", label: "Histórico" },
];

export default function DebtsPage() {
  const [activeTab, setActiveTab] = useState("dividas");
  const [debts, setDebts] = useState([]);
  const [boletos, setBoletos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("divida");
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [debtsData, boletosData] = await Promise.all([
        debtService.list(),
        boletoService.list(),
      ]);
      setDebts(debtsData || []);
      setBoletos(boletosData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddDebt = async (newDebt) => {
    await debtService.create(newDebt);
    setIsModalOpen(false);
    loadData();
  };

  const handleAddBoleto = async (newBoleto) => {
    await boletoService.create(newBoleto);
    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteDebt = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta dívida?")) return;
    await debtService.delete(id);
    loadData();
  };

  const handleDeleteBoleto = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este boleto?")) return;
    await boletoService.delete(id);
    loadData();
  };

  const handlePayInstallment = async (installmentId, paid) => {
    await debtService.payInstallment(installmentId, paid);
    loadData();
  };

  const handleToggleBoleto = async (id, paid) => {
    await boletoService.togglePaid(id, paid);
    loadData();
  };

  const handleEdit = (item) => setEditingItem(item);

  const handleSaveEdit = async (id, data) => {
    if (editingItem?.installmentList !== undefined || editingItem?.status !== undefined) {
      await debtService.update(id, data);
    } else {
      await boletoService.update(id, data);
    }
    setEditingItem(null);
    loadData();
  };

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // Contagem para as abas
  const activeDebtsCount = debts.filter((d) => d.status !== "finished").length;
  const pendingBoletosCount = boletos.filter((b) => !b.paid).length;
  const finishedDebtsCount = debts.filter((d) => d.status === "finished").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando dívidas e boletos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Dívidas e Boletos</h2>
          <p className="text-muted-foreground">Controle suas dívidas e boletos pendentes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="rounded-lg p-2 hover:bg-muted transition-colors"
            title="Atualizar"
          >
            <RefreshCwIcon className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => openModal("boleto")}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            <PlusIcon className="h-4 w-4" /> Novo Boleto
          </button>
          <button
            onClick={() => openModal("divida")}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            <PlusIcon className="h-4 w-4" /> Nova Dívida
          </button>
        </div>
      </div>

      <div className="flex border-b">
        {[
          { id: "dividas", label: "Dívidas Ativas", count: activeDebtsCount },
          { id: "boletos", label: "Boletos", count: pendingBoletosCount },
          { id: "historico", label: "Histórico", count: finishedDebtsCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                activeTab === tab.id ? "bg-primary/20" : "bg-muted"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "dividas" && (
        <DebtList
          debts={debts.filter((d) => d.status !== "finished")}
          emptyMessage="Nenhuma dívida ativa"
          onDelete={handleDeleteDebt}
          onPayInstallment={handlePayInstallment}
          onEdit={handleEdit}
        />
      )}

      {activeTab === "boletos" && (
        <BoletoForm
          boletos={boletos}
          onDelete={handleDeleteBoleto}
          onTogglePaid={handleToggleBoleto}
          onEdit={handleEdit}
        />
      )}

      {activeTab === "historico" && (
        <DebtList
          debts={debts.filter((d) => d.status === "finished")}
          emptyMessage="Nenhuma dívida quitada"
          isHistory
        />
      )}

      {isModalOpen && (
        <DebtModal
          type={modalType}
          onClose={() => setIsModalOpen(false)}
          onSave={modalType === "divida" ? handleAddDebt : handleAddBoleto}
        />
      )}

      {editingItem && (
        <EditDebtModal
          item={editingItem}
          type={editingItem?.installmentList !== undefined || editingItem?.status !== undefined ? "divida" : "boleto"}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}