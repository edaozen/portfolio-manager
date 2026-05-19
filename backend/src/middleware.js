const { verifyToken } = require('./services/authService');

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'Token gerekli' });

  const token = header.split(' ')[1];
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });

  req.user = user;
  next();
}

module.exports = { authMiddleware };