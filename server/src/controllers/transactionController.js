const { PrismaClient } = require("@prisma/client");
const { transactionSchema } = require("../validators/schemas");

const prisma = new PrismaClient();

const list = async (req, res, next) => {
  try {
    const { month, year, type, status } = req.query;

    const where = { userId: req.userId };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      where.dueDate = { gte: startDate, lte: endDate };
    }

    if (type && type !== "all") {
      where.type = type;
    }

    if (status === "paid") {
      where.paid = true;
    } else if (status === "pending") {
      where.paid = false;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { dueDate: "desc" },
    });

    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const data = transactionSchema.parse(req.body);

    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        userId: req.userId,
        dueDate: new Date(data.dueDate),
        paymentDate: data.paid ? new Date() : null,
      },
      include: { category: true },
    });

    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const transaction = await prisma.transaction.updateMany({
      where: { id, userId: req.userId },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        paymentDate: data.paid ? new Date() : null,
      },
    });

    if (transaction.count === 0) {
      return res.status(404).json({ error: "Transação não encontrada" });
    }

    res.json({ message: "Transação atualizada" });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.deleteMany({
      where: { id, userId: req.userId },
    });

    if (transaction.count === 0) {
      return res.status(404).json({ error: "Transação não encontrada" });
    }

    res.json({ message: "Transação removida" });
  } catch (error) {
    next(error);
  }
};

module.exports = { list, create, update, remove };