import { Bot, WrenchIcon, ClockIcon } from "lucide-react";

export default function MaintenanceBanner() {
  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold">Assistente IA</h2>
        <p className="text-muted-foreground">Em manutenção</p>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="text-center max-w-md animate-scale-in">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-warning/10">
            <WrenchIcon className="h-10 w-10 text-warning" />
          </div>

          <h3 className="text-xl font-bold mb-2">IA em Manutenção</h3>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            Nossa inteligência artificial está passando por uma atualização para
            oferecer respostas ainda mais precisas sobre suas finanças.
          </p>

          <div className="rounded-xl border bg-card p-5 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Bot className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">O que está mudando?</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-2 text-left">
              <li>• Novo modelo de IA mais rápido e preciso</li>
              <li>• Melhor análise de gastos por categoria</li>
              <li>• Dicas personalizadas baseadas no seu perfil</li>
              <li>• Respostas em português mais naturais</li>
            </ul>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ClockIcon className="h-3 w-3" />
            <span>Previsão de retorno: em breve</span>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Enquanto isso, você pode consultar seu Dashboard, Transações e Dívidas
            normalmente.
          </p>
        </div>
      </div>
    </div>
  );
}