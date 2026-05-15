const express = require('express');
const router = express.Router();
const assetService = require('../services/assetService');

/**
 * @swagger
 * components:
 *   schemas:
 *     Asset:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [ALTIN, DOVIZ, KRIPTO, HISSE, FON]
 *         unit:
 *           type: string
 *         created_at:
 *           type: string
 */

/**
 * @swagger
 * /api/assets:
 *   get:
 *     summary: Tüm varlıkları listele
 *     tags: [Assets]
 *     responses:
 *       200:
 *         description: Varlık listesi
 */
router.get('/', (req, res) => {
  const assets = assetService.getAllAssets();
  res.json(assets);
});

/**
 * @swagger
 * /api/assets/{id}:
 *   get:
 *     summary: Tek varlık getir
 *     tags: [Assets]
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
 *         description: Varlık bulunamadı
 */
router.get('/:id', (req, res) => {
  const asset = assetService.getAssetById(req.params.id);
  if (!asset) return res.status(404).json({ error: 'Varlık bulunamadı' });
  res.json(asset);
});

/**
 * @swagger
 * /api/assets:
 *   post:
 *     summary: Yeni varlık oluştur
 *     tags: [Assets]
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
router.post('/', (req, res) => {
  const error = assetService.validateAsset(req.body);
  if (error) return res.status(400).json({ error });
  const asset = assetService.createAsset(req.body);
  res.status(201).json(asset);
});

/**
 * @swagger
 * /api/assets/{id}:
 *   put:
 *     summary: Varlık güncelle
 *     tags: [Assets]
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
router.put('/:id', (req, res) => {
  const existing = assetService.getAssetById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Varlık bulunamadı' });
  const error = assetService.validateAsset(req.body);
  if (error) return res.status(400).json({ error });
  const asset = assetService.updateAsset(req.params.id, req.body);
  res.json(asset);
});

/**
 * @swagger
 * /api/assets/{id}:
 *   delete:
 *     summary: Varlık sil
 *     tags: [Assets]
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
  const existing = assetService.getAssetById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Varlık bulunamadı' });
  try {
    assetService.deleteAsset(req.params.id);
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: 'Bu varlığa ait işlemler var, önce onları silin' });
  }
});

module.exports = router;