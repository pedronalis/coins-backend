const express = require('express');
const pool = require('../db');

const router = express.Router();

/**
 * GET /admin/coins
 * Lista registros da tabela coins com filtros opcionais
 * 
 * Query params opcionais:
 * - name: filtro por nome (ILIKE)
 * - email: filtro por email (ILIKE)
 * 
 * Response 200: { "items": [...], "count": N }
 */
router.get('/coins', async (req, res) => {
  try {
    const { name, email } = req.query;

    let query = `
      SELECT
        id,
        name,
        email,
        coins,
        user_consults_quantity,
        user_consulted_at,
        admin_consulted_at,
        created_at,
        updated_at,
        spend_history
      FROM coins
      WHERE ($1::text IS NULL OR LOWER(name) LIKE LOWER('%' || $1 || '%'))
        AND ($2::text IS NULL OR LOWER(email) LIKE LOWER('%' || $2 || '%'))
      ORDER BY created_at DESC
    `;

    const nameParam = name && name.trim() !== '' ? name.trim() : null;
    const emailParam = email && email.trim() !== '' ? email.trim() : null;

    const result = await pool.query(query, [nameParam, emailParam]);

    res.status(200).json({
      items: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Erro ao listar coins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /admin/coins
 * Atualiza a quantidade de coins de um usuário
 * 
 * Body permitido:
 * a) Valor absoluto: { "email": "user@example.com", "coins": 150 }
 * b) Delta: { "email": "user@example.com", "coinsDelta": 10 }
 * 
 * Regras:
 * - email obrigatório
 * - Pelo menos um entre coins ou coinsDelta
 * - Se ambos vierem, prioriza coins e ignora coinsDelta
 * - Não permite coins negativos
 * 
 * Response 200: { registro atualizado }
 * Response 404: { "error": "Email not found" }
 * Response 400: { "error": "..." }
 */
router.patch('/coins', async (req, res) => {
  try {
    const { email, coins, coinsDelta, name, spend_history } = req.body;

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (coins === undefined && coinsDelta === undefined && name === undefined && spend_history === undefined) {
      return res.status(400).json({ 
        error: 'At least one of "coins", "coinsDelta", "name", or "spend_history" is required' 
      });
    }

    const emailTrimmed = email.trim().toLowerCase();
    const updates = [];
    const params = [emailTrimmed];
    let paramIndex = 2;

    // Atualizar nome se fornecido
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return res.status(400).json({ error: 'Name must be a string' });
      }
      updates.push(`name = $${paramIndex}`);
      params.push(name.trim());
      paramIndex++;
    }

    // Atualizar histórico de gastos se fornecido
    if (spend_history !== undefined) {
      if (!Array.isArray(spend_history)) {
        return res.status(400).json({ error: 'spend_history must be an array' });
      }
      updates.push(`spend_history = $${paramIndex}`);
      params.push(JSON.stringify(spend_history));
      paramIndex++;
    }

    // Atualizar moedas
    if (coins !== undefined) {
      const coinsValue = parseInt(coins, 10);
      
      if (isNaN(coinsValue) || coinsValue < 0) {
        return res.status(400).json({ error: 'Coins cannot be negative' });
      }

      updates.push(`coins = $${paramIndex}`);
      params.push(coinsValue);
      paramIndex++;
    } else if (coinsDelta !== undefined) {
      const deltaValue = parseInt(coinsDelta, 10);
      
      if (isNaN(deltaValue)) {
        return res.status(400).json({ error: 'coinsDelta must be a valid number' });
      }

      updates.push(`coins = coins + $${paramIndex}`);
      params.push(deltaValue);
      paramIndex++;
    }

    // Sempre atualizar timestamps
    updates.push('admin_consulted_at = now()');
    updates.push('updated_at = now()');

    const query = `
      UPDATE coins
      SET ${updates.join(', ')}
      WHERE email = $1
      RETURNING
        id, name, email, coins, user_consults_quantity,
        user_consulted_at, admin_consulted_at, created_at,
        updated_at, spend_history
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const updatedRecord = result.rows[0];

    if (updatedRecord.coins < 0) {
      return res.status(400).json({ error: 'Coins cannot be negative' });
    }

    res.status(200).json(updatedRecord);

  } catch (error) {
    console.error('Erro ao atualizar coins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /admin/coins
 * Cria um novo registro na tabela coins
 * 
 * Body: { "name": "Nome do usuário", "email": "user@example.com", "coins": 0 }
 * 
 * Response 201: { registro criado }
 * Response 400: { "error": "..." }
 * Response 409: { "error": "Email already exists" }
 */
router.post('/coins', async (req, res) => {
  try {
    const { name, email, coins } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailTrimmed = email.trim().toLowerCase();
    const nameTrimmed = name.trim();
    const coinsValue = coins !== undefined ? parseInt(coins, 10) : 0;

    if (isNaN(coinsValue) || coinsValue < 0) {
      return res.status(400).json({ error: 'Coins must be a non-negative number' });
    }

    const query = `
      INSERT INTO coins (name, email, coins, created_at, updated_at)
      VALUES ($1, $2, $3, now(), now())
      RETURNING
        id, name, email, coins, user_consults_quantity,
        user_consulted_at, admin_consulted_at, created_at,
        updated_at, spend_history
    `;

    const result = await pool.query(query, [nameTrimmed, emailTrimmed, coinsValue]);

    res.status(201).json(result.rows[0]);

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error('Erro ao criar coin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /admin/coins
 * Remove um registro da tabela coins pelo email
 * 
 * Body: { "email": "user@example.com" }
 * 
 * Response 200: { "message": "User deleted successfully" }
 * Response 404: { "error": "Email not found" }
 */
router.delete('/coins', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailTrimmed = email.trim().toLowerCase();

    const query = 'DELETE FROM coins WHERE email = $1 RETURNING email';

    const result = await pool.query(query, [emailTrimmed]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Erro ao deletar coin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

