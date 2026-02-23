require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());

// ------------------- Conexión a la BD -------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Middleware para adjuntar pool en cada request
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// ------------------- Middleware de autenticación -------------------
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No autorizado" });

  try {
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: decoded.id };
    next();
  } catch (err) {
    res.status(401).json({ message: "Token inválido" });
  }
}

// ------------------- Rutas -------------------
app.use("/api/auth", require("./routes/auth")); // login y registro
app.use("/api/actividades", require("./routes/actividades")); // CRUD actividades
app.use("/api/finanzas", require("./routes/finanzas")); // CRUD finanzas
app.use("/api/frases", require("./routes/frases")); // frases motivadoras

// ------------------- Ruta raíz -------------------
app.get("/", (req, res) => {
  res.send("API Calendario Inteligente funcionando ✅");
});

// ------------------- Servidor -------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});