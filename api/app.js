const express = require("express");
const cors = require("cors");
require("dotenv").config();

const errorHandler = require("./middlewares/errorHandler");

const app = express();

// CORS manual para garantir funcionamento
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Rotas
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/debts", require("./routes/debtRoutes"));
app.use("/api/boletos", require("./routes/boletoRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/ia", require("./routes/iaRoutes"));
app.use("/api/user", require("./routes/userRoutes"));

// Servir arquivos estáticos (uploads)
app.use("/uploads", express.static("uploads"));

// Error handler (último middleware)
app.use(errorHandler);

module.exports = app;