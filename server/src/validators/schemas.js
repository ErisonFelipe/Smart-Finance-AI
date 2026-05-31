const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  monthlyIncome: z.number().min(0).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

const transactionSchema = z.object({
  categoryId: z.string().uuid("Categoria inválida"),
  type: z.enum(["income", "expense", "investment"]),
  amount: z.number().positive("Valor deve ser positivo"),
  description: z.string().min(1, "Descrição é obrigatória"),
  dueDate: z.string().datetime({ message: "Data inválida" }).or(z.date()),
  recurrence: z.enum(["none", "fixed", "installment"]).optional(),
  installments: z.number().int().min(1).optional(),
  paid: z.boolean().optional(),
});

const debtSchema = z.object({
  categoryId: z.string().uuid("Categoria inválida"),
  name: z.string().min(1, "Nome é obrigatório"),
  totalAmount: z.number().positive("Valor deve ser positivo"),
  startDate: z.string().datetime().or(z.date()),
  installments: z.number().int().min(1),
});

const boletoSchema = z.object({
  barcode: z.string().optional(),
  amount: z.number().positive("Valor deve ser positivo"),
  dueDate: z.string().datetime().or(z.date()),
  description: z.string().min(1, "Descrição é obrigatória"),
});

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  icon: z.string().optional(),
  type: z.enum(["income", "expense", "investment"]),
});

module.exports = {
  registerSchema,
  loginSchema,
  transactionSchema,
  debtSchema,
  boletoSchema,
  categorySchema,
};