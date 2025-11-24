const jwt = require('jsonwebtoken');

/**
 * Middleware para validar o token JWT do admin
 * Espera header Authorization: Bearer <token>
 * Se válido, anexa req.admin com { email, role: 'admin' }
 */
function authAdminToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = parts[1];

  if (!process.env.JWT_SECRET) {
    console.error('⚠️  JWT_SECRET não configurada nas variáveis de ambiente');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.admin = {
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    console.error('Erro ao validar token JWT:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authAdminToken;

