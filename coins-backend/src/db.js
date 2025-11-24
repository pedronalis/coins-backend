const { Pool } = require('pg');

/**
 * Cria e exporta o pool de conexões PostgreSQL
 * Suporta variáveis de ambiente individuais ou DATABASE_URL
 */
function createPool() {
  // Se DATABASE_URL estiver definida, usa ela
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
        rejectUnauthorized: false
      }
    });
  }

  // Caso contrário, usa variáveis individuais
  const config = {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
  };

  // Validação básica
  if (!config.database || !config.user || !config.password) {
    throw new Error(
      'Configuração de banco de dados incompleta. ' +
      'Defina DATABASE_URL ou PGHOST, PGPORT, PGDATABASE, PGUSER e PGPASSWORD'
    );
  }

  return new Pool(config);
}

const pool = createPool();

// Testa a conexão ao inicializar
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool do PostgreSQL:', err);
});

module.exports = pool;

