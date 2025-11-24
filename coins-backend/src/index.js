require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authApiKey = require('./middlewares/authApiKey');
const authAdminToken = require('./middlewares/authAdminToken');
const coinsRoutes = require('./routes/coins');
const adminAuthRouter = require('./routes/adminAuth');
const adminCoinsRouter = require('./routes/adminCoins');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS - permite requisições do front-end
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Middleware para parsing JSON
app.use(express.json());

// Rota de health check (sem autenticação)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas públicas que exigem apenas x-api-key
// Rotas admin de autenticação (login/me) - exigem x-api-key
app.use('/admin', authApiKey, adminAuthRouter);

// Rotas admin de gerenciamento (coins) - exigem x-api-key + JWT
app.use('/admin', authApiKey, authAdminToken, adminCoinsRouter);

// Rotas públicas para usuários finais - exigem apenas x-api-key
app.use(authApiKey);
app.use('/', coinsRoutes);

// Middleware de tratamento de erros 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Middleware de tratamento de erros genéricos
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

