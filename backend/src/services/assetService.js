const db = require('../models/db');

function getAllAssets() {
  return db.prepare('SELECT * FROM assets ORDER BY created_at DESC').all();
}

function getAssetById(id) {
  return db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
}

function createAsset(data) {
  const { name, type, unit } = data;
  const stmt = db.prepare('INSERT INTO assets (name, type, unit) VALUES (?, ?, ?)');
  const result = stmt.run(name, type, unit);
  return getAssetById(result.lastInsertRowid);
}

function updateAsset(id, data) {
  const { name, type, unit } = data;
  db.prepare('UPDATE assets SET name = ?, type = ?, unit = ? WHERE id = ?').run(name, type, unit, id);
  return getAssetById(id);
}

function deleteAsset(id) {
  return db.prepare('DELETE FROM assets WHERE id = ?').run(id);
}

function validateAsset(data) {
  const validTypes = ['ALTIN', 'DOVIZ', 'KRIPTO', 'HISSE', 'FON'];
  if (!data.name || data.name.trim() === '') return 'Varlık adı boş olamaz';
  if (!data.type || !validTypes.includes(data.type)) return 'Geçersiz varlık tipi';
  if (!data.unit || data.unit.trim() === '') return 'Birim boş olamaz';
  return null;
}

module.exports = { getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset, validateAsset };