const { Pool } = require('pg');
require('dotenv').config();

// Pool de connexions PostgreSQL partage par toute l'application.
// Toutes les requetes doivent passer par ce pool pour beneficier
// de la reutilisation des connexions.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'fitahiantsoa',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[DB] Erreur inattendue sur une connexion PostgreSQL inactive :', err);
});

/**
 * Execute une requete SQL avec parametres.
 * @param {string} text - requete SQL avec placeholders $1, $2, ...
 * @param {Array} params - valeurs des parametres
 */
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  if (process.env.NODE_ENV === 'development') {
    const duration = Date.now() - start;
    console.log('[DB]', { text: text.slice(0, 80), duration, rows: res.rowCount });
  }
  return res;
}

/**
 * Recupere un client dedie du pool pour executer une transaction.
 * Penser a appeler client.release() apres usage.
 */
async function getClient() {
  return pool.connect();
}

module.exports = { pool, query, getClient };
