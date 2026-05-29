import { useLocation } from "react-router-dom";
import { BellIcon } from "lucide-react";

const pageTitles = {
  "/": "Dashboard",
  "/transacoes": "Transações",
  "/dividas": "Dívidas e Boletos",
  "/calendario": "Calendário",
  "/assistente": "Assistente IA",
  "/configuracoes": "Configurações",
};

export default function Header() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "FinIA";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 backdrop-blur-sm px-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        <p className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString("pt-BR", { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 hover:bg-muted transition-colors">
          <BellIcon className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
        </button>
      </div>
    </header>
  );
}