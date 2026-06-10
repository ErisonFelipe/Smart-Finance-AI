import { useState, useEffect, useCallback } from "react";
import { PlusIcon, TargetIcon, TrashIcon, PencilIcon, CheckCircleIcon, ClockIcon } from "lucide-react";
import goalService from "@/api/goalService";
import GoalModal from "@/components/goals/GoalModal";
import AddValueModal from "@/components/goals/AddValueModal";

const defaultColors = ["#059669", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899"];

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [addingValue, setAddingValue] = useState(null);

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await goalService.list();
      setGoals(data);
    } catch (error) {
      console.error("Erro ao carregar metas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGoals(); }, [loadGoals]);

  const handleCreate = async (data) => {
    await goalService.create(data);
    setShowModal(false);
    loadGoals();
  };

  const handleUpdate = async (id, data) => {
    await goalService.update(id, data);
    setEditingGoal(null);
    loadGoals();
  };

  const handleDelete = async (id) => {
    if (!confirm("Excluir esta meta?")) return;
    await goalService.delete(id);
    loadGoals();
  };

  const handleAddValue = async (id, amount) => {
    await goalService.addValue(id, amount);
    setAddingValue(null);
    loadGoals();
  };

  const toggleStatus = async (goal) => {
    const newStatus = goal.status === "completed" ? "active" : "completed";
    await goalService.update(goal.id, {
      status: newStatus,
      currentAmount: newStatus === "completed" ? goal.targetAmount : goal.currentAmount,
    });
    loadGoals();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Metas Financeiras</h2>
          <p className="text-muted-foreground">Defina e acompanhe seus objetivos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          <PlusIcon className="h-4 w-4" /> Nova Meta
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <TargetIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma meta definida</p>
          <p className="text-xs text-muted-foreground mt-1">Crie sua primeira meta financeira</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const percentual = goal.targetAmount > 0
              ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
              : 0;

            return (
              <div
                key={goal.id}
                className={`rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-all ${
                  goal.status === "completed" ? "border-success/30" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: goal.color + "20" }}
                    >
                      <TargetIcon className="h-4 w-4" style={{ color: goal.color }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{goal.name}</h4>
                      {goal.deadline && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          {new Date(goal.deadline).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleStatus(goal)}
                      className={`rounded-lg p-1.5 transition-colors ${
                        goal.status === "completed"
                          ? "text-success hover:bg-success/10"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                      title={goal.status === "completed" ? "Reabrir meta" : "Marcar como concluída"}
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingGoal(goal)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Excluir"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>R$ {goal.currentAmount.toFixed(2)}</span>
                    <span>{percentual}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${percentual}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Meta: R$ {goal.targetAmount.toFixed(2)}
                  </p>
                </div>

                {/* Botão adicionar valor */}
                {goal.status !== "completed" && (
                  <button
                    onClick={() => setAddingValue(goal)}
                    className="w-full mt-3 rounded-lg border border-dashed px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    + Adicionar valor
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <GoalModal onClose={() => setShowModal(false)} onSave={handleCreate} />
      )}
      {editingGoal && (
        <GoalModal
          goal={editingGoal}
          onClose={() => setEditingGoal(null)}
          onSave={(data) => handleUpdate(editingGoal.id, data)}
        />
      )}
      {addingValue && (
        <AddValueModal
          goal={addingValue}
          onClose={() => setAddingValue(null)}
          onSave={(amount) => handleAddValue(addingValue.id, amount)}
        />
      )}
    </div>
  );
}