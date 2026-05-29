import { useState, useRef, useEffect } from "react";
import { Bot, SendIcon, UserIcon, SparklesIcon, LightbulbIcon } from "lucide-react";

const suggestions = [
  "Quanto gastei com alimentação esse mês?",
  "Qual o total de despesas pendentes?",
  "Mostre minhas dívidas ativas",
  "Quando vence o aluguel?",
  "Resumo financeiro de junho",
  "Adicione despesa de 150 reais de farmácia",
];

// Simulação de respostas da IA
const mockResponses = {
  "alimentação": "Você gastou **R$ 1.200,50** com alimentação este mês. Isso representa **37%** das suas despesas totais. As principais compras foram no supermercado (R$ 650,30) e restaurantes (R$ 550,20).",
  "pendentes": "Você tem **3 despesas pendentes** totalizando **R$ 769,90**:\n• Internet - R$ 119,90 (vence 10/06)\n• Gasolina - R$ 200,00 (vence 10/06)\n• Freelance a receber - R$ 2.000,00 (previsto 15/06)",
  "dívidas": "Você tem **2 dívidas ativas**:\n• Notebook Dell: R$ 4.800,00 (4/12 parcelas pagas)\n• Reforma Cozinha: R$ 8.000,00 (2/10 parcelas pagas)\n\nTotal pendente: R$ 9.200,00",
  "aluguel": "O aluguel vence no **dia 5 de cada mês**. O valor é de **R$ 1.500,00**. O próximo vencimento é em **5 de julho de 2026**.",
  "resumo": "📊 **Resumo Financeiro - Junho 2026**\n\n• Receitas: R$ 7.000,00\n• Despesas: R$ 3.249,25\n• Investimentos: R$ 500,00\n• Saldo: R$ 3.250,75\n\n💡 Você economizou 15% mais que no mês anterior!",
  "farmácia": "✅ Despesa adicionada com sucesso!\n• Descrição: Farmácia\n• Valor: R$ 150,00\n• Categoria: Saúde\n• Data: Hoje\n• Status: Pendente",
  "default": "Entendi! Com base nos seus dados financeiros, aqui está o que encontrei. Posso ajudar com mais alguma coisa? Use as sugestões abaixo ou digite sua pergunta.",
};

function getResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes("alimentação") || lower.includes("comida") || lower.includes("mercado")) return mockResponses["alimentação"];
  if (lower.includes("pendente")) return mockResponses["pendentes"];
  if (lower.includes("dívida") || lower.includes("divida")) return mockResponses["dívidas"];
  if (lower.includes("aluguel") || lower.includes("aluguél")) return mockResponses["aluguel"];
  if (lower.includes("resumo") || lower.includes("junho")) return mockResponses["resumo"];
  if (lower.includes("farmácia") || lower.includes("farmacia") || lower.includes("150")) return mockResponses["farmácia"];
  return mockResponses["default"];
}

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Olá! Sou a **FinIA**, sua assistente financeira. Posso ajudar com:\n\n📊 Consultar gastos por categoria\n💰 Ver despesas pendentes\n📅 Lembrar vencimentos\n➕ Adicionar transações\n📈 Mostrar resumos financeiros\n\nComo posso ajudar hoje?",
      sender: "ia",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simular delay da IA
    setTimeout(() => {
      const iaMessage = {
        id: Date.now() + 1,
        text: getResponse(messageText),
        sender: "ia",
      };
      setMessages((prev) => [...prev, iaMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Função para renderizar texto com markdown simples
  const renderMessage = (text) => {
    return text.split("\n").map((line, i) => {
      // Negrito
      const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return <p key={i} dangerouslySetInnerHTML={{ __html: boldFormatted }} />;
    });
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col gap-4">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold">Assistente IA</h2>
        <p className="text-muted-foreground">Tire dúvidas sobre suas finanças com inteligência artificial</p>
      </div>

      <div className="flex flex-1 gap-6">
        {/* Chat */}
        <div className="flex flex-1 flex-col rounded-lg border bg-card shadow-sm">
          {/* Área de mensagens */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      message.sender === "ia"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {message.sender === "ia" ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <UserIcon className="h-4 w-4" />
                    )}
                  </div>

                  {/* Balão de mensagem */}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 text-sm ${
                      message.sender === "ia"
                        ? "bg-muted text-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {renderMessage(message.text)}
                  </div>
                </div>
              ))}

              {/* Indicador de digitando */}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-muted px-3 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua pergunta..."
                className="flex-1 rounded-md border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <SendIcon className="h-4 w-4" />
                Enviar
              </button>
            </div>
          </div>
        </div>

        {/* Painel de sugestões */}
        <div className="hidden w-72 flex-col gap-4 lg:flex">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <LightbulbIcon className="h-4 w-4 text-warning" />
              <h3 className="text-sm font-semibold">Sugestões</h3>
            </div>
            <div className="flex flex-col gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(suggestion)}
                  disabled={isTyping}
                  className="rounded-md border px-3 py-2 text-left text-xs transition-colors hover:bg-muted disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Dica do dia</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Você pode me pedir para <strong>adicionar transações</strong> diretamente pelo chat! 
              Exemplo: "Adicione uma despesa de 50 reais de transporte"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}