const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const authRouter = require('./routes/auth');
const assetsRouter = require('./routes/assets');
const transactionsRouter = require('./routes/transactions');
const transactionService = require('./services/transactionService');
const { authMiddleware } = require('./middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend')));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio Manager API',
      version: '1.0.0',
      description: 'Kişisel Yatırım Portföy Yöneticisi API',
    },
     servers: [
      {
        url: 'http://localhost:3000',
        description: 'Geliştirme sunucusu'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/transactions', transactionsRouter);

app.get('/api/portfolio/summary', authMiddleware, (req, res) => {
  const transactions = transactionService.getAllTransactions(req.user.id);

  const assetGroups = transactions.reduce((acc, t) => {
    const key = t.asset_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const summary = {};

  Object.values(assetGroups).forEach(assetTxns => {
    const type = assetTxns[0].asset_type;
    const name = assetTxns[0].asset_name;

    const totalInvested = transactionService.calculateTotalInvested(assetTxns);
    const totalSold = transactionService.calculateTotalSold(assetTxns);
    const netQuantity = transactionService.calculateNetQuantity(assetTxns);
    const averageCost = transactionService.calculateAverageCost(
      assetTxns.filter(t => t.transaction_type === 'ALIS')
    );
    const realizedProfit = transactionService.calculateRealizedProfit(assetTxns);
    const remainingValue = netQuantity * averageCost;

    if (!summary[type]) {
      summary[type] = {
        totalInvested: 0,
        totalSold: 0,
        realizedProfit: 0,
        remainingValue: 0,
        netQuantity: 0,
        transactionCount: 0,
        assets: []
      };
    }

    summary[type].totalInvested += totalInvested;
    summary[type].totalSold += totalSold;
    summary[type].realizedProfit += realizedProfit;
    summary[type].remainingValue += remainingValue;
    summary[type].netQuantity += netQuantity;
    summary[type].transactionCount += assetTxns.length;
    summary[type].assets.push({
      name,
      totalInvested,
      totalSold,
      realizedProfit,
      netQuantity,
      averageCost,
      remainingValue
    });
  });

  const totalInvested = transactionService.calculateTotalInvested(transactions);
  const totalSold = transactionService.calculateTotalSold(transactions);
  const realizedProfit = Object.values(assetGroups).reduce((sum, assetTxns) => {
    return sum + transactionService.calculateRealizedProfit(assetTxns);
  }, 0);

  res.json({ summary, totalInvested, totalSold, realizedProfit });
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/register.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});

module.exports = app;