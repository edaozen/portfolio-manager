const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: kullanici1
 *               password:
 *                 type: string
 *                 example: sifre123
 *     responses:
 *       201:
 *         description: Kayıt başarılı
 *       400:
 *         description: Hata
 */
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  const result = authService.register(username, password);
  if (result.error) return res.status(400).json({ error: result.error });
  res.status(201).json(result);
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: kullanici1
 *               password:
 *                 type: string
 *                 example: sifre123
 *     responses:
 *       200:
 *         description: Giriş başarılı, token döner
 *       400:
 *         description: Hata
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const result = authService.login(username, password);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result);
});

module.exports = router;