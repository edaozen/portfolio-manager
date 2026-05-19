const express = require('express');
const router = express.Router();
const transactionService = require('../services/transactionService');
const { authMiddleware } = require('../middleware');

router.get('/', authMiddleware, (req, res) => {
  const filters = {};
  if (req.query.asset_id) filters.asset_id = req.query.asset_id;
  if (req.query.type) filters.type = req.query.type;
  const transactions = transactionService.getAllTransactions(req.user.id, filters);
  res.json(transactions);
});

router.get('/:id', authMiddleware, (req, res) => {
  const transaction = transactionService.getTransactionById(req.params.id, req.user.id);
  if (!transaction) return res.status(404).json({ error: 'İşlem bulunamadı' });
  res.json(transaction);
});

router.post('/', authMiddleware, (req, res) => {
  const error = transactionService.validateTransaction(req.body);
  if (error) return res.status(400).json({ error });
  const transaction = transactionService.createTransaction(req.body, req.user.id);
  res.status(201).json(transaction);
});

router.put('/:id', authMiddleware, (req, res) => {
  const existing = transactionService.getTransactionById(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'İşlem bulunamadı' });
  const error = transactionService.validateTransaction(req.body);
  if (error) return res.status(400).json({ error });
  const transaction = transactionService.updateTransaction(req.params.id, req.body, req.user.id);
  res.json(transaction);
});

router.delete('/:id', authMiddleware, (req, res) => {
  const existing = transactionService.getTransactionById(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'İşlem bulunamadı' });
  transactionService.deleteTransaction(req.params.id, req.user.id);
  res.status(204).send();
});

module.exports = router;