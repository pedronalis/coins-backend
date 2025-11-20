/**
 * Middleware para validar o header x-api-key
 * Compara o valor do header com a variável de ambiente API_KEY
 */
function authApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const expectedApiKey = process.env.API_KEY;

  if (!expectedApiKey) {
    console.error('⚠️  API_KEY não configurada nas variáveis de ambiente');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!apiKey || apiKey !== expectedApiKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
}

module.exports = authApiKey;

