const jwt = require('jsonwebtoken');

// Secret key untuk JWT (harus sama dengan di routes/users.js)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware untuk verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Token tidak ditemukan. Silakan login terlebih dahulu.' });
  }

  // Format: "Bearer token"
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token format tidak valid. Gunakan "Bearer token".' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Simpan user info di request
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token sudah expired. Silakan login kembali.' });
    }
    return res.status(403).json({ message: 'Token tidak valid', error: err.message });
  }
};

module.exports = { verifyToken };
