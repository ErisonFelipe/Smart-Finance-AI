const { PrismaClient } = require("@prisma/client");
const { debtSchema } = require("../validators/schemas");

const prisma = new PrismaClient();

const list = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = { userId: req.userId };
    
    if (status && status !== "all") {
      where.status = status;
    }

    const debts = await prisma.debt.findMany({
      where,
      include: { 
        category: true,
        installmentList: { orderBy: { number: "asc" } }
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(debts);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const data = debtSchema.parse(req.body);

    // Criar dívida
    const debt = await prisma.debt.create({
      data: {
        userId: req.userId,
        categoryId: data.categoryId,
        name: data.name,
        totalAmount: data.totalAmount,
        startDate: new Date(data.startDate),
        installments: data.installments,
      },
    });

    // Criar parcelas automaticamente
    const installmentAmount = data.totalAmount / data.installments;
    const installments = [];

    for (let i = 0; i < data.installments; i++) {
      const dueDate = new Date(data.startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      installments.push({
        debtId: debt.id,
        number: i + 1,
        amount: Math.round(installmentAmount * 100) / 100,
        dueDate,
      });
    }

    // Ajustar a última parcela para evitar diferenças de arredondamento
    const totalCalculated = installments.reduce((acc, inst) => acc + inst.amount, 0);
    const diff = data.totalAmount - totalCalculated;
    installments[installments.length - 1].amount += diff;

    await prisma.installment.createMany({ data: installments });

    const debtWithInstallments = await prisma.debt.findUnique({
      where: { id: debt.id },
      include: { 
        category: true,
        installmentList: { orderBy: { number: "asc" } }
      },
    });

    res.status(201).json(debtWithInstallments);
  } catch (error) {
    next(error);
  }
};

module.exports = { list, create };