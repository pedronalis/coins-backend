const express = require('express');
const pool = require('../db');

const router = express.Router();

/**
 * Valida formato de e-mail básico
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * POST /coins
 * Busca moedas de um usuário pelo e-mail
 * 
 * Body: { "email": "usuario@exemplo.com" }
 * Response 200: { "email": "usuario@exemplo.com", "coins": 123 }
 * Response 404: { "error": "Email not found" }
 * Response 400: { "error": "Email is required" } ou { "error": "Invalid email format" }
 */
router.post('/coins', async (req, res) => {
  try {
    const { email } = req.body;

    // Validação: e-mail obrigatório
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailTrimmed = email.trim().toLowerCase();

    // Validação: formato de e-mail
    if (!isValidEmail(emailTrimmed)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Busca no banco de dados
    const result = await pool.query(
      'SELECT email, coins FROM coins WHERE email = $1',
      [emailTrimmed]
    );

    // Se não encontrou, retorna 404
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Retorna os dados encontrados
    const user = result.rows[0];
    res.status(200).json({
      email: user.email,
      coins: user.coins
    });

  } catch (error) {
    console.error('Erro ao buscar moedas:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

