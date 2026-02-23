const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const result = await req.pool.query(
    "SELECT * FROM frases_motivadoras ORDER BY RANDOM() LIMIT 1"
  );

  res.json(result.rows[0]);
});

module.exports = router;