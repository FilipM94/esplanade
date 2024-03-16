const jwt = require("jsonwebtoken");
const config = require("../config/config");

function authenticateToken(req, res, next) {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Niste prijavljeni." });

  jwt.verify(token, config.secret, (err, user) => {
    if (err) return res.status(403).json({ error: "Nevaljan token." });

    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
