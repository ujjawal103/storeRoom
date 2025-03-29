const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();


function verifyJWT(req, res, next) {
  const token = req.cookies?.token; // Get token from cookies

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRETS , (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    req.user = decoded; // Store decoded data in req.user
    next(); // Proceed to the next middleware
  });
}

module.exports.verifyJWT = verifyJWT;
