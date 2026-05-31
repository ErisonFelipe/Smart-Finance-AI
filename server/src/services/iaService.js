const { GoogleGenerativeAI } = require("@google/generative-ai");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Inicializa o Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Função para buscar contexto financeiro do usuário
async function getFinancialContext(userId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [receitas, despesas, investimentos, transacoesRecentes, dividas, boletos] =
    await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: "income", dueDate: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: "expense", dueDate: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: "investment", dueDate: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
      prisma.transaction.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { dueDate: "desc" },
        take: 10,
      }),
      prisma.debt.findMany({
        where: { userId, status: { in: ["active", "late"] } },
        include: { category: true, installmentList: { orderBy: { number: "asc" } } },
      }),
      prisma.boleto.findMany({
        where: { userId, paid: false },
      }),
    ]);

  return {
    mesAtual: now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
    receitasMes: receitas._sum.amount || 0,
    despesasMes: despesas._sum.amount || 0,
    investimentosMes: investimentos._sum.amount || 0,
    saldoMes: (receitas._sum.amount || 0) - (despesas._sum.amount || 0),
    transacoesRecentes: transacoesRecentes.map((t) => ({
      descricao: t.description,
      valor: t.amount,
      tipo: t.type === "income" ? "receita" : t.type === "expense" ? "despesa" : "investimento",
      categoria: t.category?.name || "Sem categoria",
      data: t.dueDate.toLocaleDateString("pt-BR"),
      pago: t.paid,
    })),
    dividasAtivas: dividas.map((d) => {
      const paidInstallments = d.installmentList?.filter((i) => i.paid).length || 0;
      return {
        nome: d.name,
        valorTotal: d.totalAmount,
        valorPago: d.paidAmount,
        valorRestante: d.totalAmount - d.paidAmount,
        parcelas: `${paidInstallments}/${d.installments}`,
        status: d.status,
      };
    }),
    boletosPendentes: boletos.map((b) => ({
      descricao: b.description,
      valor: b.amount,
      vencimento: b.dueDate.toLocaleDateString("pt-BR"),
    })),
  };
}

// Prompt do sistema
function buildSystemPrompt(context) {
  return `Você é a FinIA, uma assistente financeira inteligente e amigável. 
Use APENAS os dados abaixo para responder. Não invente informações.

📊 DADOS FINANCEIROS DO USUÁRIO:
Mês atual: ${context?.mesAtual || "N/A"}
Receitas do mês: R$ ${context?.receitasMes?.toFixed(2) || "0.00"}
Despesas do mês: R$ ${context?.despesasMes?.toFixed(2) || "0.00"}
Investimentos do mês: R$ ${context?.investimentosMes?.toFixed(2) || "0.00"}
Saldo do mês: R$ ${context?.saldoMes?.toFixed(2) || "0.00"}

${context?.transacoesRecentes?.length ? `TRANSAÇÕES RECENTES:\n${context.transacoesRecentes.map(t => `- ${t.descricao}: R$ ${t.valor.toFixed(2)} (${t.tipo}, ${t.categoria}, ${t.pago ? "pago" : "pendente"}, ${t.data})`).join("\n")}` : ""}

${context?.dividasAtivas?.length ? `DÍVIDAS ATIVAS:\n${context.dividasAtivas.map(d => `- ${d.nome}: Total R$ ${d.valorTotal.toFixed(2)} | Restante R$ ${d.valorRestante.toFixed(2)} | Parcelas: ${d.parcelas} | Status: ${d.status}`).join("\n")}` : ""}

${context?.boletosPendentes?.length ? `BOLETOS PENDENTES:\n${context.boletosPendentes.map(b => `- ${b.descricao}: R$ ${b.valor.toFixed(2)} (Vence: ${b.vencimento})`).join("\n")}` : ""}

REGRAS:
1. Responda SEMPRE em português do Brasil
2. Use emojis e bullets para organizar
3. Máximo 250 palavras por resposta
4. Seja direta e útil
5. Se perguntarem algo fora dos dados, diga "Não tenho essa informação no momento"
6. Ofereça dicas financeiras baseadas nos dados reais`;
}

// Função principal do chat com Gemini
async function chatWithIA(userId, userMessage, conversationHistory = []) {
  let context = null;

  try {
    context = await getFinancialContext(userId);
  } catch (err) {
    console.error("Erro ao buscar contexto:", err);
  }

  // Verificar se tem API Key configurada
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("sua-chave")) {
    console.log("⚠️ Gemini API Key não configurada, usando fallback local");
    return {
      reply: getFallbackResponse(userMessage, context),
      context: {
        receitasMes: context?.receitasMes || 0,
        despesasMes: context?.despesasMes || 0,
        saldoMes: context?.saldoMes || 0,
      },
      fallback: true,
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Construir histórico da conversa
    const history = conversationHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Olá! Quem é você?" }],
        },
        {
          role: "model",
          parts: [{ text: buildSystemPrompt(context) }],
        },
        ...history,
      ],
      generationConfig: {
        maxOutputTokens: 400,
        temperature: 0.7,
        topP: 0.8,
      },
    });

    const result = await chat.sendMessage(userMessage);
    const reply = result.response.text();

    return {
      reply,
      context: {
        receitasMes: context?.receitasMes || 0,
        despesasMes: context?.despesasMes || 0,
        saldoMes: context?.saldoMes || 0,
      },
      fallback: false,
    };
  } catch (error) {
    console.error("Erro no chat Gemini:", error.message);
    return {
      reply: getFallbackResponse(userMessage, context),
      context: {
        receitasMes: context?.receitasMes || 0,
        despesasMes: context?.despesasMes || 0,
        saldoMes: context?.saldoMes || 0,
      },
      fallback: true,
    };
  }
}

// Fallback local (sem IA)
function getFallbackResponse(message, context) {
  const msg = message.toLowerCase();

  if (msg.includes("saldo") || msg.includes("quanto tenho")) {
    const saldo = context?.saldoMes || 0;
    const receitas = context?.receitasMes || 0;
    const despesas = context?.despesasMes || 0;
    return `💰 **Resumo Financeiro**\n\n📥 Receitas: R$ ${receitas.toFixed(2)}\n📤 Despesas: R$ ${despesas.toFixed(2)}\n💵 Saldo: R$ ${saldo.toFixed(2)}`;
  }

  if (msg.includes("dívida") || msg.includes("divida") || msg.includes("devo")) {
    if (context?.dividasAtivas?.length > 0) {
      const dividas = context.dividasAtivas
        .map((d) => `• ${d.nome}: R$ ${d.valorRestante.toFixed(2)} restantes (${d.parcelas} parcelas)`)
        .join("\n");
      return `📋 **Dívidas ativas:**\n${dividas}`;
    }
    return "🎉 Você não tem dívidas ativas!";
  }

  if (msg.includes("boleto") || msg.includes("pagar")) {
    if (context?.boletosPendentes?.length > 0) {
      const boletos = context.boletosPendentes
        .map((b) => `• ${b.descricao}: R$ ${b.valor.toFixed(2)} (Vence: ${b.vencimento})`)
        .join("\n");
      return `📄 **Boletos pendentes:**\n${boletos}`;
    }
    return "✅ Não há boletos pendentes!";
  }

  if (msg.includes("gastei") || msg.includes("despesa") || msg.includes("gasto")) {
    return `📊 Este mês você gastou **R$ ${(context?.despesasMes || 0).toFixed(2)}** no total.\n\nPara ver o detalhamento por categoria, acesse o Dashboard.`;
  }

  if (msg.includes("dica") || msg.includes("economizar") || msg.includes("economia")) {
    const despesas = context?.despesasMes || 0;
    const receitas = context?.receitasMes || 0;
    const porcentagem = receitas > 0 ? ((despesas / receitas) * 100).toFixed(1) : 0;
    return `💡 **Dicas personalizadas:**\n\n📊 Você gasta ${porcentagem}% da sua renda.\n\n✅ Tente manter as despesas abaixo de 70% da renda\n✅ Reserve 10% para investimentos\n✅ Tenha uma reserva de emergência de 3-6 meses\n✅ Categorize todos os gastos para identificar excessos`;
  }

  return `Olá! Sou a FinIA, sua assistente financeira. 💚\n\nPosso ajudar com:\n📊 Saldo e resumo do mês\n💰 Análise de gastos\n📋 Dívidas ativas\n📄 Boletos pendentes\n💡 Dicas de economia\n\nO que você gostaria de saber?`;
}

// Categorização automática via Gemini
async function categorizeTransaction(description, amount, categories) {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("sua-chave")) {
      return null;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const categoryNames = categories.map((c) => c.name).join(", ");

    const prompt = `Categorize esta transação financeira em uma das categorias listadas.\n\nDescrição: "${description}"\nValor: R$ ${amount}\nCategorias: ${categoryNames}\n\nResponda APENAS com o nome exato da categoria.`;

    const result = await model.generateContent(prompt);
    const suggestedCategory = result.response.text().trim();

    const match = categories.find(
      (c) => c.name.toLowerCase() === suggestedCategory.toLowerCase()
    );

    return match ? match.id : null;
  } catch (error) {
    console.error("Erro na categorização:", error.message);
    return null;
  }
}

module.exports = { chatWithIA, categorizeTransaction };