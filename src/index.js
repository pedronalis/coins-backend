require('dotenv').config();
const express = require('express');
const authApiKey = require('./middlewares/authApiKey');
const coinsRoutes = require('./routes/coins');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsing JSON
app.use(express.json());

// Rota de health check (sem autenticação)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware de autenticação para todas as outras rotas
app.use(authApiKey);

// Rotas
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

