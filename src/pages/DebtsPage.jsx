import { useState, useEffect, useCallback } from "react";
import { PlusIcon } from "lucide-react";
import DebtList from "@/components/debts/DebtList";
import BoletoForm from "@/components/debts/BoletoForm";
import DebtModal from "@/components/debts/DebtModal";
import EditDebtModal from "@/components/debts/EditDebtModal";
import debtService from "@/api/debtService";
import boletoService from "@/api/boletoService";

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
      setDebts(debtsData);
      setBoletos(boletosData);
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
    try {
      await debtService.create(newDebt);
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Erro ao adicionar dívida:", error);
      throw error;
    }
  };

  const handleAddBoleto = async (newBoleto) => {
    try {
      await boletoService.create(newBoleto);
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Erro ao adicionar boleto:", error);
      throw error;
    }
  };

  const handleDeleteDebt = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta dívida?")) return;
    try {
      await debtService.delete(id);
      loadData();
    } catch (error) {
      console.error("Erro ao excluir dívida:", error);
    }
  };

  const handleDeleteBoleto = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este boleto?")) return;
    try {
      await boletoService.delete(id);
      loadData();
    } catch (error) {
      console.error("Erro ao excluir boleto:", error);
    }
  };

  const handlePayInstallment = async (installmentId, paid) => {
    try {
      await debtService.payInstallment(installmentId, paid);
      loadData();
    } catch (error) {
      console.error("Erro ao pagar parcela:", error);
    }
  };

  const handleToggleBoleto = async (id, paid) => {
    try {
      await boletoService.togglePaid(id, paid);
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar boleto:", error);
    }
  };

  const handleEdit = (item) => setEditingItem(item);

  const handleSaveEdit = async (id, data) => {
    try {
      if (editingItem?.installmentList !== undefined || editingItem?.status !== undefined) {
        await debtService.update(id, data);
      } else {
        await boletoService.update(id, data);
      }
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error("Erro ao editar:", error);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
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
        {["dividas", "boletos", "historico"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "dividas" ? "Dívidas Ativas" : tab === "boletos" ? "Boletos" : "Histórico"}
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