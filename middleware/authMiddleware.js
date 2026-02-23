const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Formato de token inválido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = decoded; // { id: ... }

    next();
  } catch (error) {
    console.log("Error JWT:", error.message);
    return res.status(401).json({ message: "Token inválido" });
  }
};
