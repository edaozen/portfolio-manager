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
 *           enum: [ALTIN, DOVIZ, KRIPTO, HISSE, FON]
 *         description: Tipe göre filtrele
 *       - in: query
 *         name: transaction_type
 *         schema:
 *           type: string
 *           enum: [ALIS, SATIS]
 *         description: İşlem tipine göre filtrele
 *     responses:
 *       200:
 *         description: İşlem listesi
 *       401:
 *         description: Yetkisiz erişim
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const filters = {};
    if (req.query.asset_id) filters.asset_id = req.query.asset_id;
    if (req.query.type) filters.type = req.query.type;
    if (req.query.transaction_type) filters.transaction_type = req.query.transaction_type;
    const transactions = transactionService.getAllTransactions(req.user.id, filters);
    res.json(transactions);
  } catch (e) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
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
 *       401:
 *         description: Yetkisiz erişim
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const transaction = transactionService.getTransactionById(req.params.id, req.user.id);
    if (!transaction) return res.status(404).json({ error: 'İşlem bulunamadı' });
    res.json(transaction);
  } catch (e) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Yeni işlem ekle (Alış veya Satış)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [asset_id, transaction_type, quantity, date]
 *             properties:
 *               asset_id:
 *                 type: integer
 *                 example: 1
 *               transaction_type:
 *                 type: string
 *                 enum: [ALIS, SATIS]
 *                 example: ALIS
 *               quantity:
 *                 type: number
 *                 example: 5
 *               buy_price:
 *                 type: number
 *                 description: Alış işleminde zorunlu
 *                 example: 4250
 *               sell_price:
 *                 type: number
 *                 description: Satış işleminde zorunlu
 *                 example: 4500
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
 *         description: Geçersiz veri veya yetersiz miktar
 *       401:
 *         description: Yetkisiz erişim
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const error = transactionService.validateTransaction(req.body);
    if (error) return res.status(400).json({ error });

    if (req.body.transaction_type === 'SATIS') {
      const mevcutIslemler = transactionService.getAllTransactions(req.user.id, { asset_id: req.body.asset_id });
      const kalanMiktar = transactionService.calculateNetQuantity(mevcutIslemler);
      if (req.body.quantity > kalanMiktar) {
        return res.status(400).json({ error: `Yetersiz miktar. Elinizdeki: ${kalanMiktar}` });
      }
    }

    const transaction = transactionService.createTransaction(req.body, req.user.id);
    res.status(201).json(transaction);
  } catch (e) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
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
 *               transaction_type:
 *                 type: string
 *                 enum: [ALIS, SATIS]
 *               quantity:
 *                 type: number
 *               buy_price:
 *                 type: number
 *               sell_price:
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
 *       401:
 *         description: Yetkisiz erişim
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const existing = transactionService.getTransactionById(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'İşlem bulunamadı' });
    const error = transactionService.validateTransaction(req.body);
    if (error) return res.status(400).json({ error });

    if (req.body.transaction_type === 'SATIS') {
      const assetId = parseInt(req.body.asset_id);
      const mevcutIslemler = transactionService.getAllTransactions(req.user.id, { asset_id: assetId });
      const eskiIslem = mevcutIslemler.find(t => t.id === parseInt(req.params.id));
      const eskiMiktar = (eskiIslem && eskiIslem.transaction_type === 'SATIS') ? eskiIslem.quantity : 0;
      const kalanMiktar = transactionService.calculateNetQuantity(mevcutIslemler) + eskiMiktar;
      if (req.body.quantity > kalanMiktar) {
        return res.status(400).json({ error: `Yetersiz miktar. Elinizdeki: ${kalanMiktar}` });
      }
    }
    const transaction = transactionService.updateTransaction(req.params.id, req.body, req.user.id);
    res.json(transaction);
  } catch (e) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
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
 *       401:
 *         description: Yetkisiz erişim
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const existing = transactionService.getTransactionById(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'İşlem bulunamadı' });
    transactionService.deleteTransaction(req.params.id, req.user.id);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;