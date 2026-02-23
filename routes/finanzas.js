const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// AGREGAR FINANZA
router.post("/", authMiddleware, async (req, res) => {
  const { tipo, descripcion, monto, fecha } = req.body;

  try {
    await req.pool.query(
      `INSERT INTO finanzas
       (usuario_id, tipo, descripcion, monto, fecha)
       VALUES ($1,$2,$3,$4,$5)`,
      [
        req.usuario.id, // 🔥 viene del token
        tipo,
        descripcion,
        monto,
        fecha,
      ]
    );

    res.json({ message: "Finanza guardada" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// OBTENER FINANZAS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const finanzas = await req.pool.query(
      `SELECT * FROM finanzas
       WHERE usuario_id=$1
       ORDER BY fecha DESC`,
      [req.usuario.id]
    );

    res.json(finanzas.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// EDITAR
router.put("/:id", authMiddleware, async (req, res) => {
  const { tipo, descripcion, monto } = req.body;
  const { id } = req.params;

  try {
    await req.pool.query(
      "UPDATE finanzas SET tipo=$1, descripcion=$2, monto=$3 WHERE id=$4 AND usuario_id=$5",
      [tipo, descripcion, monto, id, req.usuario.id]
    );
    res.json({ message: "Finanza actualizada" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ELIMINAR
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await req.pool.query(
      "DELETE FROM finanzas WHERE id=$1 AND usuario_id=$2",
      [id, req.usuario.id]
    );
    res.json({ message: "Finanza eliminada" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;