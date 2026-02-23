const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// CREAR ACTIVIDAD
router.post("/", authMiddleware, async (req, res) => {
  const { titulo, descripcion, fecha, hora } = req.body;

  try {
    await req.pool.query(
      `INSERT INTO actividades
       (usuario_id, titulo, descripcion, fecha, hora)
       VALUES ($1,$2,$3,$4,$5)`,
      [
        req.usuario.id, // 🔥 id viene del token
        titulo,
        descripcion,
        fecha,
        hora,
      ]
    );

    res.json({ message: "Actividad guardada" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// OBTENER ACTIVIDADES POR FECHA
router.get("/:fecha", authMiddleware, async (req, res) => {
  try {
    const actividades = await req.pool.query(
      `SELECT * FROM actividades
       WHERE usuario_id=$1 AND fecha=$2
       ORDER BY hora`,
      [req.usuario.id, req.params.fecha]
    );

    res.json(actividades.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// EDITAR
router.put("/:id", authMiddleware, async (req, res) => {
  const { titulo, descripcion } = req.body;
  const { id } = req.params;

  try {
    await req.pool.query(
      "UPDATE actividades SET titulo=$1, descripcion=$2 WHERE id=$3 AND usuario_id=$4",
      [titulo, descripcion, id, req.usuario.id]
    );
    res.json({ message: "Actividad actualizada" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ELIMINAR
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await req.pool.query(
      "DELETE FROM actividades WHERE id=$1 AND usuario_id=$2",
      [id, req.usuario.id]
    );
    res.json({ message: "Actividad eliminada" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;