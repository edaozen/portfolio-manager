const express = require('express');
const router = express.Router();
const transactionService = require('../services/transactionService');

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Tüm işlemleri listele
 *     tags: [Transactions]
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
 *         description: Varlık tipine göre filtrele (ALTIN, DOVIZ vb.)
 *     responses:
 *       200:
 *         description: İşlem listesi
 */
router.get('/', (req, res) => {
  const filters = {};
  if (req.query.asset_id) filters.asset_id = req.query.asset_id;
  if (req.query.type) filters.type = req.query.type;
  const transactions = transactionService.getAllTransactions(filters);
  res.json(transactions);
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Tek işlem getir
 *     tags: [Transactions]
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
 *         description: İşlem bulunamadı
 */
router.get('/:id', (req, res) => {
  const transaction = transactionService.getTransactionById(req.params.id);
  if (!transaction) return res.status(404).json({ error: 'İşlem bulunamadı' });
  res.json(transaction);
});

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Yeni işlem ekle
 *     tags: [Transactions]
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
 *                 example: "2026-05-15"
 *               notes:
 *                 type: string
 *                 example: "Maaştan aldım"
 *     responses:
 *       201:
 *         description: İşlem oluşturuldu
 *       400:
 *         description: Geçersiz veri
 */
router.post('/', (req, res) => {
  const error = transactionService.validateTransaction(req.body);
  if (error) return res.status(400).json({ error });
  const transaction = transactionService.createTransaction(req.body);
  res.status(201).json(transaction);
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: İşlem güncelle
 *     tags: [Transactions]
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
 *               quantity:
 *                 type: number
 *               buy_price:
 *                 type: number
 *               date:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Güncellendi
 *       404:
 *         description: Bulunamadı
 */
router.put('/:id', (req, res) => {
  const existing = transactionService.getTransactionById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'İşlem bulunamadı' });
  const error = transactionService.validateTransaction(req.body);
  if (error) return res.status(400).json({ error });
  const transaction = transactionService.updateTransaction(req.params.id, req.body);
  res.json(transaction);
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: İşlem sil
 *     tags: [Transactions]
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
router.delete('/:id', (req, res) => {
  const existing = transactionService.getTransactionById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'İşlem bulunamadı' });
  transactionService.deleteTransaction(req.params.id);
  res.status(204).send();
});

module.exports = router;