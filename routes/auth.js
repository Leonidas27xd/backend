const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    const existe = await req.pool.query(
      "SELECT * FROM usuarios WHERE email=$1",
      [email]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const nuevo = await req.pool.query(
      `INSERT INTO usuarios (id, nombre, email, password)
       VALUES ($1,$2,$3,$4)
       RETURNING id, nombre, email`,
      [uuidv4(), nombre, email, hashed]
    );

    res.json(nuevo.rows[0]);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await req.pool.query(
      "SELECT * FROM usuarios WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Usuario no existe" });
    }

    const valido = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!valido) {
      return res.status(400).json({ message: "Password incorrecto" });
    }

    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      usuario: {
        id: user.rows[0].id,
        nombre: user.rows[0].nombre,
        email: user.rows[0].email
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;