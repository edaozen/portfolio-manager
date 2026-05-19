const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const authRouter = require('./routes/auth');
const assetsRouter = require('./routes/assets');
const transactionsRouter = require('./routes/transactions');
const transactionService = require('./services/transactionService');
const { authMiddleware } = require('./middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend')));

// Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio Manager API',
      version: '1.0.0',
      description: 'Kişisel Yatırım Portföy Yöneticisi API',
    },
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

// Route'lar
app.use('/api/auth', authRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/transactions', transactionsRouter);

// Portföy özeti
app.get('/api/portfolio/summary', authMiddleware, (req, res) => {
  const transactions = transactionService.getAllTransactions(req.user.id);
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

// Login/Register sayfaları
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/register.html'));
});

require('dotenv').config();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});

module.exports = app;