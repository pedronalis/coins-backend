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
    const { email, consultType } = req.body;

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
      'SELECT email, coins, spend_history FROM coins WHERE email = $1',
      [emailTrimmed]
    );

    // Se não encontrou, retorna 404
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Você ainda não possui moedas de ouro 😢' });
    }

    // Atualizar contador de consultas baseado no tipo
    // consultType: 'statement' -> statement_consults_quantity, qualquer outro ou undefined -> user_consults_quantity
    if (consultType === 'statement') {
      // Atualizar statement_consults_quantity quando visualiza o extrato
      await pool.query(
        `UPDATE coins 
         SET 
           statement_consults_quantity = COALESCE(statement_consults_quantity, 0) + 1,
           user_consulted_at = now(),
           updated_at = now()
         WHERE email = $1`,
        [emailTrimmed]
      );
    } else {
      // Atualizar user_consults_quantity quando carrega a página com as moedas
      await pool.query(
        `UPDATE coins 
         SET 
           user_consults_quantity = COALESCE(user_consults_quantity, 0) + 1,
           user_consulted_at = now(),
           updated_at = now()
         WHERE email = $1`,
        [emailTrimmed]
      );
    }

    // Retorna os dados encontrados
    const user = result.rows[0];
    
    // Garantir que spend_history seja sempre um array
    let spendHistory = user.spend_history;
    if (!spendHistory) {
      spendHistory = [];
    } else if (typeof spendHistory === 'string') {
      try {
        spendHistory = JSON.parse(spendHistory);
      } catch (e) {
        console.error('Erro ao fazer parse do spend_history:', e);
        spendHistory = [];
      }
    } else if (!Array.isArray(spendHistory)) {
      spendHistory = [];
    }
    
    res.status(200).json({
      email: user.email,
      coins: user.coins,
      spend_history: spendHistory
    });

  } catch (error) {
    console.error('Erro ao buscar moedas:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

