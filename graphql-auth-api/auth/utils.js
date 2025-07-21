const jwt = require("jsonwebtoken");
const users = require("../data/users");

function getUserFromToken(token) {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return users.find((u) => u.id === decoded.id);
  } catch {
    return null;
  }
}

module.exports = { getUserFromToken };
