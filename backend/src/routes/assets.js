const express = require('express');
const router = express.Router();
const assetService = require('../services/assetService');
const { authMiddleware } = require('../middleware');
const db = require('../models/db');

/**
 * @swagger
 * /api/assets:
 *   get:
 *     summary: Tüm varlıkları listele
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Varlık listesi
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const assets = assetService.getAllAssets(req.user.id);
    res.json(assets);
  } catch (e) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

/**
 * @swagger
 * /api/assets/{id}:
 *   get:
 *     summary: Tek varlık getir
 *     tags: [Assets]
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
 *         description: Varlık bulundu
 *       404:
 *         description: Bulunamadı
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const asset = assetService.getAssetById(req.params.id, req.user.id);
    if (!asset) return res.status(404).json({ error: 'Varlık bulunamadı' });
    res.json(asset);
  } catch (e) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

/**
 * @swagger
 * /api/assets:
 *   post:
 *     summary: Yeni varlık oluştur
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type, unit]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Gram Altın
 *               type:
 *                 type: string
 *                 example: ALTIN
 *               unit:
 *                 type: string
 *                 example: gram
 *     responses:
 *       201:
 *         description: Varlık oluşturuldu
 *       400:
 *         description: Geçersiz veri
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const error = assetService.validateAsset(req.body);
    if (error) return res.status(400).json({ error });
    const asset = assetService.createAsset(req.body, req.user.id);
    res.status(201).json(asset);
  } catch (e) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

/**
 * @swagger
 * /api/assets/{id}:
 *   put:
 *     summary: Varlık güncelle
 *     tags: [Assets]
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
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               unit:
 *                 type: string
 *     responses:
 *       200:
 *         description: Güncellendi
 *       404:
 *         description: Bulunamadı
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const existing = assetService.getAssetById(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Varlık bulunamadı' });
    const error = assetService.validateAsset(req.body);
    if (error) return res.status(400).json({ error });
    const asset = assetService.updateAsset(req.params.id, req.body, req.user.id);
    res.json(asset);
  } catch (e) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

/**
 * @swagger
 * /api/assets/{id}:
 *   delete:
 *     summary: Varlık sil
 *     tags: [Assets]
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
 *       400:
 *         description: İşlemleri olan varlık silinemez
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const existing = assetService.getAssetById(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Varlık bulunamadı' });
    assetService.deleteAsset(req.params.id, req.user.id);
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: 'Bu varlığa ait işlemler var, önce onları silin' });
  }
});

/**
 * @swagger
 * /api/assets:
 *   delete:
 *     summary: Tüm varlıkları ve işlemleri sil
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Tümü silindi
 */
router.delete('/', authMiddleware, async (req, res) => {
  try {
    db.prepare('DELETE FROM transactions WHERE user_id = ?').run(req.user.id);
    db.prepare('DELETE FROM assets WHERE user_id = ?').run(req.user.id);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;