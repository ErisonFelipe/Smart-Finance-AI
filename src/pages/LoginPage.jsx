import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { TrendingUpIcon, EyeIcon, EyeOffIcon, CheckIcon, XIcon, LoaderIcon } from "lucide-react";
import api from "@/api/axios";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    monthlyIncome: "",
    payDay: "1",
  });
  const [error, setError] = useState("");

  const { login, register, loading } = useAuthStore();
  const navigate = useNavigate();

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-destructive";
    if (passwordStrength === 2) return "bg-warning";
    if (passwordStrength === 3) return "bg-info";
    return "bg-success";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return "Fraca";
    if (passwordStrength === 2) return "Média";
    if (passwordStrength === 3) return "Boa";
    return "Forte";
  };

  const checkEmail = async (email) => {
    if (!email || !email.includes("@")) {
      setEmailAvailable(null);
      return;
    }
    try {
      setCheckingEmail(true);
      const response = await api.post("/auth/check-email", { email });
      setEmailAvailable(!response.data.exists);
    } catch (err) {
      setEmailAvailable(null);
    } finally {
      setCheckingEmail(false);
    }
  };

 const handleEmailChange = (e) => {
  const email = e.target.value;
  setForm({ ...form, email });
  setEmailAvailable(null);

  // Só verificar email no modo registro
  if (isRegister) {
    if (window.emailTimeout) clearTimeout(window.emailTimeout);
    window.emailTimeout = setTimeout(() => checkEmail(email), 500);
  }
};

  const resetForm = () => {
    setIsRegister(!isRegister);
    setError("");
    setEmailAvailable(null);
    setPasswordStrength(0);
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isRegister) {
      if (passwordStrength < 2) {
        setError("A senha precisa ser pelo menos de força Média");
        return;
      }
      if (emailAvailable === false) {
        setError("Este email já está cadastrado");
        return;
      }
      if (!form.name.trim()) {
        setError("Nome é obrigatório");
        return;
      }
    }

    try {
      if (isRegister) {
        await register({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          monthlyIncome: Number(form.monthlyIncome) || 0,
          payDay: Number(form.payDay),
        });
      } else {
        await login({ email: form.email.trim(), password: form.password });
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao processar requisição");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-primary/5 p-4">
      <div className="w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <TrendingUpIcon className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">FinIA</h1>
          <p className="text-muted-foreground text-sm">Assistente Financeiro Inteligente</p>
        </div>

        {/* Card do formulário */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold">
            {isRegister ? "Criar Conta" : "Entrar"}
          </h2>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive animate-fade-in">
              <XIcon className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <div>
                <label className="mb-1 block text-sm font-medium">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-shadow"
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium">Email *</label>
              <div className="relative">
                <input
                  type="email"
                  value={form.email}
                  onChange={handleEmailChange}
                  className={`w-full rounded-lg border bg-background px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-primary/20 transition-shadow ${
                    emailAvailable === false ? "border-destructive" :
                    emailAvailable === true ? "border-success" : ""
                  }`}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                />
                {checkingEmail && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
                {!checkingEmail && emailAvailable === true && (
                  <CheckIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
                )}
                {!checkingEmail && emailAvailable === false && (
                  <XIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                )}
              </div>
              {emailAvailable === false && (
                <p className="text-xs text-destructive mt-1">Este email já está em uso</p>
              )}
              {emailAvailable === true && (
                <p className="text-xs text-success mt-1">Email disponível</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Senha *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (isRegister) checkPasswordStrength(e.target.value);
                  }}
                  className="w-full rounded-lg border bg-background px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-primary/20 transition-shadow"
                  placeholder="••••••"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>

              {isRegister && form.password.length > 0 && (
                <div className="mt-2 animate-fade-in">
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Força: <span className="font-medium">{getStrengthText()}</span>
                  </p>
                  <ul className="text-xs mt-2 space-y-0.5">
                    <li className={form.password.length >= 8 ? "text-success" : "text-muted-foreground"}>
                      {form.password.length >= 8 ? "✓" : "○"} Mínimo 8 caracteres
                    </li>
                    <li className={/[A-Z]/.test(form.password) ? "text-success" : "text-muted-foreground"}>
                      {/[A-Z]/.test(form.password) ? "✓" : "○"} Pelo menos 1 letra maiúscula
                    </li>
                    <li className={/[0-9]/.test(form.password) ? "text-success" : "text-muted-foreground"}>
                      {/[0-9]/.test(form.password) ? "✓" : "○"} Pelo menos 1 número
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(form.password) ? "text-success" : "text-muted-foreground"}>
                      {/[^A-Za-z0-9]/.test(form.password) ? "✓" : "○"} Pelo menos 1 caractere especial
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {isRegister && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Renda Mensal</label>
                  <input
                    type="number"
                    value={form.monthlyIncome}
                    onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-shadow"
                    placeholder="R$ 0,00"
                    min="0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Dia do recebimento</label>
                  <select
                    value={form.payDay}
                    onChange={(e) => setForm({ ...form, payDay: e.target.value })}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-shadow"
                  >
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Dia {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (isRegister && emailAvailable === false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
            >
              {loading ? (
                <LoaderIcon className="h-4 w-4 animate-spin" />
              ) : null}
              {loading ? "Aguarde..." : isRegister ? "Criar Conta" : "Entrar"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isRegister ? "Já tem conta?" : "Não tem conta?"}{" "}
            <button
              onClick={resetForm}
              className="font-medium text-primary hover:underline"
            >
              {isRegister ? "Entrar" : "Criar conta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}