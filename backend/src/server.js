require('dotenv').config();
const app = require('./app');
const { pool } = require('./db/pool');

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Verifie que la connexion a PostgreSQL fonctionne avant de demarrer le serveur HTTP.
    await pool.query('SELECT 1');
    console.log('[DB] Connexion a PostgreSQL etablie avec succes.');

    app.listen(PORT, () => {
      console.log(`[SERVER] FITAHIANTSOA backend demarre sur http://localhost:${PORT}`);
      console.log(`[SERVER] Environnement : ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('[SERVER] Impossible de demarrer : connexion a la base de donnees echouee.');
    console.error(err.message);
    console.error('Verifiez votre fichier .env et que PostgreSQL est bien demarre.');
    process.exit(1);
  }
}

startServer();

// Arret propre du serveur (Ctrl+C, ou signal du systeme)
process.on('SIGINT', async () => {
  console.log('\n[SERVER] Arret en cours...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});
