const express = require('express');
const jwt = require('jsonwebtoken');
const authApiKey = require('../middlewares/authApiKey');
const authAdminToken = require('../middlewares/authAdminToken');

const router = express.Router();

/**
 * POST /admin/login
 * Autentica o admin com email e senha
 * Retorna JWT token se credenciais válidas
 * 
 * Body: { "email": "admin@...", "password": "..." }
 * Response 200: { "token": "<jwt>", "email": "<admin_email>" }
 * Response 401: { "error": "Invalid credentials" }
 * Response 400: { "error": "Email and password are required" }
 */
router.post('/login', authApiKey, (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('⚠️  ADMIN_EMAIL ou ADMIN_PASSWORD não configuradas');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const emailMatch = email.toLowerCase().trim() === adminEmail.toLowerCase().trim();
    const passwordMatch = password === adminPassword;

    if (!emailMatch || !passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '8h';

    if (!jwtSecret) {
      console.error('⚠️  JWT_SECRET não configurada');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      {
        email: adminEmail,
        role: 'admin'
      },
      jwtSecret,
      {
        expiresIn: jwtExpiresIn
      }
    );

    res.status(200).json({
      token,
      email: adminEmail
    });

  } catch (error) {
    console.error('Erro ao fazer login admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /admin/me
 * Valida a sessão do admin e retorna informações
 * 
 * Response 200: { "email": "<admin_email>", "role": "admin" }
 * Response 401: { "error": "..." } (tratado pelo middleware authAdminToken)
 */
router.get('/me', authApiKey, authAdminToken, (req, res) => {
  res.status(200).json({
    email: req.admin.email,
    role: req.admin.role
  });
});

module.exports = router;

