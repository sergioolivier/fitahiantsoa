/**
 * Script d'initialisation de la base de donnees.
 * Lit le fichier schema.sql et l'execute integralement.
 *
 * Usage : npm run db:init
 * Pre-requis : la base de donnees (DB_NAME) doit deja exister.
 *   Tu peux la creer avec : createdb fitahiantsoa
 *   ou via psql : CREATE DATABASE fitahiantsoa;
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

async function init() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('[INIT] Connexion a la base de donnees...');
  try {
    await pool.query(schemaSql);
    console.log('[INIT] Schema applique avec succes. Toutes les tables sont prêtes.');
  } catch (err) {
    console.error('[INIT] Erreur lors de l\'application du schema :', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

init();
