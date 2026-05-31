import { useState, useRef, useEffect } from "react";
import { Bot, SendIcon, UserIcon, SparklesIcon, LightbulbIcon, AlertCircleIcon } from "lucide-react";
import iaService from "@/api/iaService";

const suggestions = [
  "Qual meu saldo atual?",
  "Quanto gastei esse mês?",
  "Mostre minhas dívidas ativas",
  "Quais boletos estão pendentes?",
  "Resumo financeiro do mês",
  "Me dê dicas de economia",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Olá! Sou a **FinIA**, sua assistente financeira com inteligência artificial. 🚀\n\nPosso analisar seus dados em tempo real e ajudar com:\n\n📊 Saldo e resumo do mês\n💰 Análise de gastos\n📋 Dívidas ativas\n📄 Boletos pendentes\n💡 Dicas personalizadas\n\nComo posso ajudar hoje?",
      sender: "ia",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [useAI, setUseAI] = useState(true); // Toggle IA real vs fallback
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text) => {
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

    try {
      let reply;

      if (useAI) {
        // Chamada real à API
        const history = messages
          .filter((m) => m.sender === "user" || m.sender === "ia")
          .slice(-6)
          .map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          }));

        const response = await iaService.chat(messageText, history);
        reply = response.reply;

        // Se foi fallback, avisa
        if (response.fallback) {
          reply += "\n\n⚠️ *Modo offline - usando respostas locais*";
        }
      } else {
        // Fallback local
        await new Promise((resolve) => setTimeout(resolve, 1000));
        reply = getLocalResponse(messageText);
      }

      const iaMessage = {
        id: Date.now() + 1,
        text: reply,
        sender: "ia",
      };

      setMessages((prev) => [...prev, iaMessage]);
    } catch (error) {
      console.error("Erro no chat:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "❌ Erro ao processar sua mensagem. Verifique se o servidor está rodando e tente novamente.",
        sender: "ia",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Fallback local (quando toggle está desligado)
  const getLocalResponse = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes("saldo")) return "💰 Seu saldo este mês é calculado como: Receitas - Despesas. Consulte o Dashboard para o valor exato!";
    if (msg.includes("dívida")) return "📋 Consulte a página de Dívidas para ver todas as dívidas ativas e seu progresso.";
    if (msg.includes("boleto")) return "📄 Acesse Dívidas e Boletos > Boletos para ver todos os boletos pendentes.";
    return "💡 Posso ajudar com suas finanças! Pergunte sobre saldo, gastos, dívidas ou boletos.";
  };

  const renderMessage = (text) => {
    return text.split("\n").map((line, i) => {
      const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return <p key={i} dangerouslySetInnerHTML={{ __html: boldFormatted }} />;
    });
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col gap-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Assistente IA</h2>
          <p className="text-muted-foreground">
            {useAI ? "🤖 IA conectada - respostas personalizadas" : "📴 Modo local - respostas básicas"}
          </p>
        </div>
        <button
          onClick={() => setUseAI(!useAI)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            useAI
              ? "bg-success/10 text-success border border-success/30"
              : "bg-muted text-muted-foreground border"
          }`}
        >
          {useAI ? "IA Online" : "Modo Local"}
        </button>
      </div>

      <div className="flex flex-1 gap-6">
        {/* Chat */}
        <div className="flex flex-1 flex-col rounded-lg border bg-card shadow-sm">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                >
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

          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={useAI ? "Fale com a FinIA (Gemini)..." : "Modo local ativado..."}
                className="flex-1 rounded-md border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
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
              <h3 className="text-sm font-semibold">Status da IA</h3>
            </div>
            <div className="text-xs text-muted-foreground space-y-2">
              <p className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${useAI ? "bg-success" : "bg-muted-foreground"}`} />
                {useAI ? "Google Gemini Flash" : "Respostas locais"}
              </p>
              <p>Modelo mais rápido e econômico, otimizado para respostas concisas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}