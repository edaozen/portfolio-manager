const db = require('../models/db');

function getAllAssets(user_id) {
  return db.prepare('SELECT * FROM assets WHERE user_id = ? ORDER BY created_at DESC').all(user_id);
}

function getAssetById(id, user_id) {
  return db.prepare('SELECT * FROM assets WHERE id = ? AND user_id = ?').get(id, user_id);
}

function createAsset(data, user_id) {
  const { name, type, unit } = data;
  const stmt = db.prepare('INSERT INTO assets (user_id, name, type, unit) VALUES (?, ?, ?, ?)');
  const result = stmt.run(user_id, name, type, unit);
  return getAssetById(result.lastInsertRowid, user_id);
}

function updateAsset(id, data, user_id) {
  const { name, type, unit } = data;
  db.prepare('UPDATE assets SET name = ?, type = ?, unit = ? WHERE id = ? AND user_id = ?').run(name, type, unit, id, user_id);
  return getAssetById(id, user_id);
}

function deleteAsset(id, user_id) {
  return db.prepare('DELETE FROM assets WHERE id = ? AND user_id = ?').run(id, user_id);
}

function validateAsset(data) {
  const validTypes = ['ALTIN', 'DOVIZ', 'KRIPTO', 'HISSE', 'FON'];
  if (!data.name || data.name.trim() === '') return 'Varlık adı boş olamaz';
  if (!data.type || !validTypes.includes(data.type)) return 'Geçersiz varlık tipi';
  if (!data.unit || data.unit.trim() === '') return 'Birim boş olamaz';
  return null;
}

module.exports = { getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset, validateAsset };