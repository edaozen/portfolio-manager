const express = require('express');
const router = express.Router();
const transactionService = require('../services/transactionService');
const { authMiddleware } = require('../middleware');

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Tüm işlemleri listele
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: asset_id
 *         schema:
 *           type: integer
 *         description: Varlık ID'sine göre filtrele
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Tipe göre filtrele (ALTIN, DOVIZ vb.)
 *     responses:
 *       200:
 *         description: İşlem listesi
 */
router.get('/', authMiddleware, (req, res) => {
  const filters = {};
  if (req.query.asset_id) filters.asset_id = req.query.asset_id;
  if (req.query.type) filters.type = req.query.type;
  const transactions = transactionService.getAllTransactions(req.user.id, filters);
  res.json(transactions);
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Tek işlem getir
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: İşlem bulundu
 *       404:
 *         description: Bulunamadı
 */
router.get('/:id', authMiddleware, (req, res) => {
  const transaction = transactionService.getTransactionById(req.params.id, req.user.id);
  if (!transaction) return res.status(404).json({ error: 'İşlem bulunamadı' });
  res.json(transaction);
});

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Yeni işlem ekle
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [asset_id, quantity, buy_price, date]
 *             properties:
 *               asset_id:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: number
 *                 example: 5
 *               buy_price:
 *                 type: number
 *                 example: 4250
 *               date:
 *                 type: string
 *                 example: "2026-05-19"
 *               notes:
 *                 type: string
 *                 example: "Maaştan aldım"
 *     responses:
 *       201:
 *         description: İşlem oluşturuldu
 *       400:
 *         description: Geçersiz veri
 */
router.post('/', authMiddleware, (req, res) => {
  const error = transactionService.validateTransaction(req.body);
  if (error) return res.status(400).json({ error });
  const transaction = transactionService.createTransaction(req.body, req.user.id);
  res.status(201).json(transaction);
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: İşlem güncelle
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               asset_id:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: number
 *                 example: 5
 *               buy_price:
 *                 type: number
 *                 example: 4250
 *               date:
 *                 type: string
 *                 example: "2026-05-19"
 *               notes:
 *                 type: string
 *                 example: "Güncellendi"
 *     responses:
 *       200:
 *         description: Güncellendi
 *       404:
 *         description: Bulunamadı
 */
router.put('/:id', authMiddleware, (req, res) => {
  const existing = transactionService.getTransactionById(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'İşlem bulunamadı' });
  const error = transactionService.validateTransaction(req.body);
  if (error) return res.status(400).json({ error });
  const transaction = transactionService.updateTransaction(req.params.id, req.body, req.user.id);
  res.json(transaction);
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: İşlem sil
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Silindi
 *       404:
 *         description: Bulunamadı
 */
router.delete('/:id', authMiddleware, (req, res) => {
  const existing = transactionService.getTransactionById(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'İşlem bulunamadı' });
  transactionService.deleteTransaction(req.params.id, req.user.id);
  res.status(204).send();
});

module.exports = router;