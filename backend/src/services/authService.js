const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = 'portfolio_secret_key_2026';

function register(username, password) {
  if (!username || username.trim() === '') return { error: 'Kullanıcı adı boş olamaz' };
  if (!password || password.length < 4) return { error: 'Şifre en az 4 karakter olmalı' };

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return { error: 'Bu kullanıcı adı zaten alınmış' };

  const hashed = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashed);
  const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '24h' });
  return { user, token };
}

function login(username, password) {
  if (!username || !password) return { error: 'Kullanıcı adı ve şifre gerekli' };

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return { error: 'Kullanıcı bulunamadı' };

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return { error: 'Şifre hatalı' };

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '24h' });
  return { user: { id: user.id, username: user.username }, token };
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}

module.exports = { register, login, verifyToken };