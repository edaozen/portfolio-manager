const db = require('../models/db');

function getAllTransactions(filters = {}) {
  let query = `
    SELECT t.*, a.name as asset_name, a.type as asset_type, a.unit
    FROM transactions t
    JOIN assets a ON t.asset_id = a.id
  `;
  const params = [];

  if (filters.asset_id) {
    query += ' WHERE t.asset_id = ?';
    params.push(filters.asset_id);
  } else if (filters.type) {
    query += ' WHERE a.type = ?';
    params.push(filters.type);
  }

  query += ' ORDER BY t.date DESC';
  return db.prepare(query).all(...params);
}

function getTransactionById(id) {
  return db.prepare(`
    SELECT t.*, a.name as asset_name, a.type as asset_type, a.unit
    FROM transactions t
    JOIN assets a ON t.asset_id = a.id
    WHERE t.id = ?
  `).get(id);
}

function createTransaction(data) {
  const { asset_id, quantity, buy_price, date, notes } = data;
  const stmt = db.prepare(
    'INSERT INTO transactions (asset_id, quantity, buy_price, date, notes) VALUES (?, ?, ?, ?, ?)'
  );
  const result = stmt.run(asset_id, quantity, buy_price, date, notes || null);
  return getTransactionById(result.lastInsertRowid);
}

function updateTransaction(id, data) {
  const { quantity, buy_price, date, notes } = data;
  db.prepare(
    'UPDATE transactions SET quantity = ?, buy_price = ?, date = ?, notes = ? WHERE id = ?'
  ).run(quantity, buy_price, date, notes || null, id);
  return getTransactionById(id);
}

function deleteTransaction(id) {
  return db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
}

function calculateTotalInvested(transactions) {
  return transactions.reduce((sum, t) => sum + t.quantity * t.buy_price, 0);
}

function calculateAverageCost(transactions) {
  if (!transactions || transactions.length === 0) return 0;
  const totalQuantity = transactions.reduce((sum, t) => sum + t.quantity, 0);
  const totalCost = transactions.reduce((sum, t) => sum + t.quantity * t.buy_price, 0);
  if (totalQuantity === 0) return 0;
  return totalCost / totalQuantity;
}

function groupByAssetType(transactions) {
  return transactions.reduce((groups, t) => {
    const type = t.asset_type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(t);
    return groups;
  }, {});
}

function validateTransaction(data) {
  if (!data.asset_id) return 'Varlık seçilmedi';
  if (!data.quantity || data.quantity <= 0) return 'Miktar sıfırdan büyük olmalı';
  if (!data.buy_price || data.buy_price <= 0) return 'Fiyat sıfırdan büyük olmalı';
  if (!data.date) return 'Tarih boş olamaz';
  return null;
}

module.exports = {
  getAllTransactions, getTransactionById, createTransaction,
  updateTransaction, deleteTransaction, calculateTotalInvested,
  calculateAverageCost, groupByAssetType, validateTransaction
};