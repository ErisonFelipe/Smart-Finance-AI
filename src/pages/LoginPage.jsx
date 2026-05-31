import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { TrendingUpIcon, EyeIcon, EyeOffIcon } from "lucide-react";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    monthlyIncome: "",
  });
  const [error, setError] = useState("");

  const { login, register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          monthlyIncome: Number(form.monthlyIncome) || 0,
        });
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao processar requisição");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <TrendingUpIcon className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">FinIA</h1>
          <p className="text-muted-foreground">Assistente Financeiro Inteligente</p>
        </div>

        {/* Card do formulário */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold">
            {isRegister ? "Criar Conta" : "Entrar"}
          </h2>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <div>
                <label className="mb-1 block text-sm font-medium">Nome</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="Seu nome"
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-lg border bg-background px-3 py-2 pr-10 text-sm"
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="mb-1 block text-sm font-medium">Renda Mensal (R$)</label>
                <input
                  type="number"
                  value={form.monthlyIncome}
                  onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="0,00"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? "Carregando..." : isRegister ? "Criar Conta" : "Entrar"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isRegister ? "Já tem conta?" : "Não tem conta?"}{" "}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
              className="font-medium text-primary hover:underline"
            >
              {isRegister ? "Entrar" : "Criar conta"}
            </button>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <p className="font-medium mb-1">🔑 Demo:</p>
            <p>Email: joao@teste.com</p>
            <p>Senha: 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}