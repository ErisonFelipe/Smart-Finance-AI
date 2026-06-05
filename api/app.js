const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Rotas (importe as que já existem)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/boletos", require("./routes/boletoRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

module.exports = app;