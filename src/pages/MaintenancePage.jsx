import { useState, useEffect } from "react";
import { WrenchIcon, TrendingUpIcon, ClockIcon, RefreshCwIcon } from "lucide-react";

export default function MaintenancePage() {
  const [countdown, setCountdown] = useState("");
  const [dots, setDots] = useState("");

  useEffect(() => {
    // Animação dos pontinhos
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    // Contagem regressiva estimada
    const estimatedReturn = new Date();
    estimatedReturn.setHours(estimatedReturn.getHours() + 2);

    const timer = setInterval(() => {
      const now = new Date();
      const diff = estimatedReturn - now;

      if (diff <= 0) {
        setCountdown("Em breve");
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-primary/5 p-4">
      <div className="w-full max-w-lg text-center animate-scale-in">
        {/* Ícone */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-warning/10">
          <WrenchIcon className="h-10 w-10 text-warning" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Em Manutenção{dots}
        </h1>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          Estamos realizando melhorias no sistema para oferecer uma experiência
          ainda melhor. Voltaremos em instantes.
        </p>

        {/* Cards de informação */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="rounded-xl border bg-card p-4">
            <ClockIcon className="h-5 w-5 text-info mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Previsão de retorno</p>
            <p className="text-lg font-bold text-info">{countdown || "Calculando..."}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <TrendingUpIcon className="h-5 w-5 text-success mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Novidades</p>
            <p className="text-sm font-medium text-success">Projeção 6 meses</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <RefreshCwIcon className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm font-medium text-primary">Atualizando</p>
          </div>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
            <TrendingUpIcon className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium">FinIA</span>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Obrigado pela paciência! Nossos dados continuam seguros.
        </p>
      </div>
    </div>
  );
}