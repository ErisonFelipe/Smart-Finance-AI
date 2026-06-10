// import { useState, useRef, useEffect } from "react";
// import { Bot, SendIcon, UserIcon, SparklesIcon, LightbulbIcon } from "lucide-react";
// import iaService from "@/api/iaService";

// const suggestions = [
//   "Qual meu saldo atual?",
//   "Quanto gastei esse mês?",
//   "Mostre minhas dívidas ativas",
//   "Quais boletos estão pendentes?",
//   "Resumo financeiro do mês",
//   "Me dê dicas de economia",
// ];

// export default function AssistantPage() {
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       text: "Olá! Sou a **FinIA**, sua assistente financeira com inteligência artificial. 🚀\n\nPosso analisar seus dados em tempo real e ajudar com:\n\n📊 Saldo e resumo do mês\n💰 Análise de gastos\n📋 Dívidas ativas\n📄 Boletos pendentes\n💡 Dicas personalizadas\n\nComo posso ajudar hoje?",
//       sender: "ia",
//     },
//   ]);
//   const [input, setInput] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSend = async (text) => {
//     const messageText = text || input.trim();
//     if (!messageText) return;

//     const userMessage = {
//       id: Date.now(),
//       text: messageText,
//       sender: "user",
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");
//     setIsTyping(true);

//     try {
//       const history = messages
//         .filter((m) => m.sender === "user" || m.sender === "ia")
//         .slice(-6)
//         .map((m) => ({
//           role: m.sender === "user" ? "user" : "assistant",
//           content: m.text,
//         }));

//       const response = await iaService.chat(messageText, history);

//       const iaMessage = {
//         id: Date.now() + 1,
//         text: response.reply,
//         sender: "ia",
//       };

//       setMessages((prev) => [...prev, iaMessage]);
//     } catch (error) {
//       console.error("Erro no chat:", error);
//       const errorMessage = {
//         id: Date.now() + 1,
//         text: "❌ Erro ao processar sua mensagem. O servidor pode estar indisponível. Tente novamente.",
//         sender: "ia",
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   const renderMessage = (text) => {
//     return text.split("\n").map((line, i) => {
//       const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
//       return <p key={i} dangerouslySetInnerHTML={{ __html: boldFormatted }} />;
//     });
//   };

//   return (
//     <div className="flex h-[calc(100vh-10rem)] flex-col gap-4">
//       {/* Cabeçalho */}
//       <div>
//         <h2 className="text-2xl font-bold">Assistente IA</h2>
//         <p className="text-muted-foreground text-sm flex items-center gap-2">
//           <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
//           Google Gemini Flash conectado
//         </p>
//       </div>

//       <div className="flex flex-1 gap-6">
//         {/* Chat */}
//         <div className="flex flex-1 flex-col rounded-xl border bg-card shadow-sm overflow-hidden">
//           <div className="flex-1 overflow-y-auto p-4 space-y-4">
//             {messages.map((message) => (
//               <div
//                 key={message.id}
//                 className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
//               >
//                 <div
//                   className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
//                     message.sender === "ia"
//                       ? "bg-primary/10 text-primary"
//                       : "bg-muted text-muted-foreground"
//                   }`}
//                 >
//                   {message.sender === "ia" ? (
//                     <Bot className="h-4 w-4" />
//                   ) : (
//                     <UserIcon className="h-4 w-4" />
//                   )}
//                 </div>

//                 <div
//                   className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
//                     message.sender === "ia"
//                       ? "bg-muted text-foreground rounded-tl-sm"
//                       : "bg-primary text-primary-foreground rounded-tr-sm"
//                   }`}
//                 >
//                   {renderMessage(message.text)}
//                 </div>
//               </div>
//             ))}

//             {isTyping && (
//               <div className="flex gap-3">
//                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
//                   <Bot className="h-4 w-4 text-primary" />
//                 </div>
//                 <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
//                   <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "0ms" }} />
//                   <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "150ms" }} />
//                   <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "300ms" }} />
//                 </div>
//               </div>
//             )}

//             <div ref={messagesEndRef} />
//           </div>

//           <div className="border-t p-4 bg-card">
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" && !e.shiftKey) {
//                     e.preventDefault();
//                     handleSend();
//                   }
//                 }}
//                 placeholder="Pergunte sobre suas finanças..."
//                 className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
//                 disabled={isTyping}
//               />
//               <button
//                 onClick={() => handleSend()}
//                 disabled={!input.trim() || isTyping}
//                 className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
//               >
//                 <SendIcon className="h-4 w-4" />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Painel de sugestões */}
//         <div className="hidden w-72 flex-col gap-4 lg:flex shrink-0">
//           <div className="rounded-xl border bg-card p-4 shadow-sm">
//             <div className="mb-3 flex items-center gap-2">
//               <LightbulbIcon className="h-4 w-4 text-warning" />
//               <h3 className="text-sm font-semibold">Sugestões</h3>
//             </div>
//             <div className="flex flex-col gap-2">
//               {suggestions.map((suggestion, index) => (
//                 <button
//                   key={index}
//                   onClick={() => handleSend(suggestion)}
//                   disabled={isTyping}
//                   className="rounded-lg border px-3 py-2 text-left text-xs transition-colors hover:bg-muted disabled:opacity-50"
//                 >
//                   {suggestion}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="rounded-xl border bg-card p-4 shadow-sm">
//             <div className="mb-3 flex items-center gap-2">
//               <SparklesIcon className="h-4 w-4 text-primary" />
//               <h3 className="text-sm font-semibold">Sobre a FinIA</h3>
//             </div>
//             <div className="text-xs text-muted-foreground space-y-2">
//               <p>🤖 IA com acesso aos seus dados financeiros reais</p>
//               <p>📊 Análise personalizada de gastos</p>
//               <p>💡 Dicas baseadas no seu perfil</p>
//               <p>⚡ Respostas rápidas e objetivas</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import MaintenanceBanner from "@/components/assistant/MaintenanceBanner";

export default function AssistantPage() {
  return <MaintenanceBanner />;
}