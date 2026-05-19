const db = require('../models/db');

function getAllTransactions(user_id, filters = {}) {
  let query = `
    SELECT t.*, a.name as asset_name, a.type as asset_type, a.unit
    FROM transactions t
    JOIN assets a ON t.asset_id = a.id
    WHERE t.user_id = ?
  `;
  const params = [user_id];

  if (filters.asset_id) {
    query += ' AND t.asset_id = ?';
    params.push(filters.asset_id);
  } else if (filters.type) {
    query += ' AND a.type = ?';
    params.push(filters.type);
  }

  if (filters.transaction_type) {
    query += ' AND t.transaction_type = ?';
    params.push(filters.transaction_type);
  }

  query += ' ORDER BY t.date ASC';
  return db.prepare(query).all(...params);
}

function getTransactionById(id, user_id) {
  return db.prepare(`
    SELECT t.*, a.name as asset_name, a.type as asset_type, a.unit
    FROM transactions t
    JOIN assets a ON t.asset_id = a.id
    WHERE t.id = ? AND t.user_id = ?
  `).get(id, user_id);
}

function createTransaction(data, user_id) {
  const { asset_id, transaction_type, quantity, buy_price, sell_price, date, notes } = data;
  const stmt = db.prepare(`
    INSERT INTO transactions (user_id, asset_id, transaction_type, quantity, buy_price, sell_price, date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    user_id, asset_id, transaction_type || 'ALIS',
    quantity, buy_price || null, sell_price || null, date, notes || null
  );
  return getTransactionById(result.lastInsertRowid, user_id);
}

function updateTransaction(id, data, user_id) {
  const { transaction_type, quantity, buy_price, sell_price, date, notes } = data;
  db.prepare(`
    UPDATE transactions
    SET transaction_type = ?, quantity = ?, buy_price = ?, sell_price = ?, date = ?, notes = ?
    WHERE id = ? AND user_id = ?
  `).run(transaction_type, quantity, buy_price || null, sell_price || null, date, notes || null, id, user_id);
  return getTransactionById(id, user_id);
}

function deleteTransaction(id, user_id) {
  return db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(id, user_id);
}

function calculateTotalInvested(transactions) {
  return transactions
    .filter(t => t.transaction_type === 'ALIS')
    .reduce((sum, t) => sum + t.quantity * t.buy_price, 0);
}

function calculateTotalSold(transactions) {
  return transactions
    .filter(t => t.transaction_type === 'SATIS')
    .reduce((sum, t) => sum + t.quantity * t.sell_price, 0);
}

function calculateAverageCost(transactions) {
  const alisList = transactions.filter(t => t.transaction_type === 'ALIS');
  if (!alisList || alisList.length === 0) return 0;
  const totalQuantity = alisList.reduce((sum, t) => sum + t.quantity, 0);
  const totalCost = alisList.reduce((sum, t) => sum + t.quantity * t.buy_price, 0);
  if (totalQuantity === 0) return 0;
  return totalCost / totalQuantity;
}

function calculateRealizedProfit(transactions) {
  const satisList = transactions.filter(t => t.transaction_type === 'SATIS');
  if (satisList.length === 0) return 0;

  const alisList = transactions.filter(t => t.transaction_type === 'ALIS');
  const avgCost = calculateAverageCost(alisList);

  return satisList.reduce((profit, t) => {
    return profit + (t.sell_price - avgCost) * t.quantity;
  }, 0);
}

function calculateNetQuantity(transactions) {
  const totalBought = transactions
    .filter(t => t.transaction_type === 'ALIS')
    .reduce((sum, t) => sum + t.quantity, 0);
  const totalSold = transactions
    .filter(t => t.transaction_type === 'SATIS')
    .reduce((sum, t) => sum + t.quantity, 0);
  return totalBought - totalSold;
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
  if (!data.transaction_type || !['ALIS', 'SATIS'].includes(data.transaction_type)) return 'İşlem tipi ALIS veya SATIS olmalı';
  if (!data.quantity || data.quantity <= 0) return 'Miktar sıfırdan büyük olmalı';
  if (data.transaction_type === 'ALIS' && (!data.buy_price || data.buy_price <= 0)) return 'Alış fiyatı sıfırdan büyük olmalı';
  if (data.transaction_type === 'SATIS' && (!data.sell_price || data.sell_price <= 0)) return 'Satış fiyatı sıfırdan büyük olmalı';
  if (!data.date) return 'Tarih boş olamaz';
  return null;
}

module.exports = {
  getAllTransactions, getTransactionById, createTransaction,
  updateTransaction, deleteTransaction, calculateTotalInvested,
  calculateTotalSold, calculateRealizedProfit, calculateAverageCost,
  calculateNetQuantity, groupByAssetType, validateTransaction
};