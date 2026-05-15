const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const assetsRouter = require('./routes/assets');
const transactionsRouter = require('./routes/transactions');
const transactionService = require('./services/transactionService');

const app = express();

app.use(cors());
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname, '../../frontend')));

// Swagger ayarları
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio Manager API',
      version: '1.0.0',
      description: 'Kişisel Yatırım Portföy Yöneticisi API',
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route'lar
app.use('/api/assets', assetsRouter);
app.use('/api/transactions', transactionsRouter);

// Portföy özeti endpoint'i
app.get('/api/portfolio/summary', (req, res) => {
  const transactions = transactionService.getAllTransactions();
  const grouped = transactionService.groupByAssetType(transactions);
  const summary = {};

  for (const type in grouped) {
    const group = grouped[type];
    summary[type] = {
      totalInvested: transactionService.calculateTotalInvested(group),
      averageCost: transactionService.calculateAverageCost(group),
      transactionCount: group.length,
    };
  }

  const totalInvested = transactionService.calculateTotalInvested(transactions);

  res.json({ summary, totalInvested });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});

module.exports = app;