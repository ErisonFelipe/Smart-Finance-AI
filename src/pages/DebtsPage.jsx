import { useState, useEffect } from "react";
import { PlusIcon } from "lucide-react";
import DebtList from "@/components/debts/DebtList";
import BoletoForm from "@/components/debts/BoletoForm";
import DebtModal from "@/components/debts/DebtModal";

export default function DebtsPage() {
  const [activeTab, setActiveTab] = useState("dividas");
  const [debts, setDebts] = useState([]);
  const [boletos, setBoletos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("divida"); // "divida" ou "boleto"

  useEffect(() => {
    // Dívidas mockadas
    const mockDebts = [
      {
        id: 1,
        nome: "Notebook Dell",
        valorTotal: 4800.00,
        valorPago: 1600.00,
        parcelasTotais: 12,
        parcelasPagas: 4,
        dataInicio: "2026-02-10",
        status: "ativa",
      },
      {
        id: 2,
        nome: "Curso de Inglês",
        valorTotal: 2400.00,
        valorPago: 2400.00,
        parcelasTotais: 6,
        parcelasPagas: 6,
        dataInicio: "2025-11-15",
        status: "quitada",
      },
      {
        id: 3,
        nome: "Reforma Cozinha",
        valorTotal: 8000.00,
        valorPago: 2000.00,
        parcelasTotais: 10,
        parcelasPagas: 2,
        dataInicio: "2026-04-20",
        status: "atrasada",
      },
    ];

    // Boletos mockados
    const mockBoletos = [
      {
        id: 1,
        descricao: "Plano de Saúde",
        codigoBarras: "34191790010104351004791020150008291070026000",
        valor: 450.00,
        vencimento: "2026-06-10",
        status: "pendente",
      },
      {
        id: 2,
        descricao: "Seguro Auto",
        codigoBarras: "00190000090312934000900005333175872600000018900",
        valor: 320.00,
        vencimento: "2026-06-05",
        status: "pago",
      },
      {
        id: 3,
        descricao: "IPTU 3ª parcela",
        codigoBarras: "85820000026017860180201506304072867300123456789",
        valor: 280.00,
        vencimento: "2026-05-30",
        status: "atrasado",
      },
    ];

    setDebts(mockDebts);
    setBoletos(mockBoletos);
  }, []);

  const handleAddDebt = (newDebt) => {
    setDebts([...debts, { ...newDebt, id: Date.now() }]);
    setIsModalOpen(false);
  };

  const handleAddBoleto = (newBoleto) => {
    setBoletos([...boletos, { ...newBoleto, id: Date.now() }]);
    setIsModalOpen(false);
  };

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dívidas e Boletos</h2>
          <p className="text-muted-foreground">Controle suas dívidas e boletos pendentes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openModal("boleto")}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <PlusIcon className="h-4 w-4" />
            Novo Boleto
          </button>
          <button
            onClick={() => openModal("divida")}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <PlusIcon className="h-4 w-4" />
            Nova Dívida
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("dividas")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "dividas"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Dívidas Ativas
        </button>
        <button
          onClick={() => setActiveTab("boletos")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "boletos"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Boletos
        </button>
        <button
          onClick={() => setActiveTab("historico")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "historico"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Histórico
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === "dividas" && (
        <DebtList
          debts={debts.filter((d) => d.status !== "quitada")}
          emptyMessage="Nenhuma dívida ativa"
        />
      )}

      {activeTab === "boletos" && (
        <BoletoForm boletos={boletos} />
      )}

      {activeTab === "historico" && (
        <DebtList
          debts={debts.filter((d) => d.status === "quitada")}
          emptyMessage="Nenhuma dívida quitada"
          isHistory
        />
      )}

      {/* Modal */}
      {isModalOpen && (
        <DebtModal
          type={modalType}
          onClose={() => setIsModalOpen(false)}
          onSave={modalType === "divida" ? handleAddDebt : handleAddBoleto}
        />
      )}
    </div>
  );
}