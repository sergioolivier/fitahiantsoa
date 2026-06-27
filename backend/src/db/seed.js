/**
 * Script de seed : insere les donnees de base necessaires
 * pour demarrer la plateforme (categories + compte admin).
 *
 * Usage : npm run db:seed
 */
const bcrypt = require('bcryptjs');
const { pool } = require('./pool');
require('dotenv').config();

const CATEGORIES = [
  { nom: 'Agriculture', nom_en: 'Agriculture', nom_mg: 'Fambolena', slug: 'agriculture', icone: 'wheat' },
  { nom: 'Tourisme', nom_en: 'Tourism', nom_mg: 'Fizahantany', slug: 'tourisme', icone: 'palm-tree' },
  { nom: 'Sante', nom_en: 'Health', nom_mg: 'Fahasalamana', slug: 'sante', icone: 'heart-pulse' },
  { nom: 'Materiel medical', nom_en: 'Medical Equipment', nom_mg: 'Fitaovam-pahasalamana', slug: 'materiel-medical', icone: 'stethoscope' },
  { nom: 'Autres', nom_en: 'Others', nom_mg: 'Hafa', slug: 'autres', icone: 'package' },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('[SEED] Insertion des categories...');
    for (const cat of CATEGORIES) {
      await client.query(
        `INSERT INTO categories (nom, nom_en, nom_mg, slug, icone)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug) DO NOTHING`,
        [cat.nom, cat.nom_en, cat.nom_mg, cat.slug, cat.icone]
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@fitahiantsoa.mg';
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMoi123!';
    const adminCin = process.env.ADMIN_CIN || '000000000000';

    const existing = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    if (existing.rowCount === 0) {
      console.log('[SEED] Creation du compte administrateur initial...');
      const hash = await bcrypt.hash(adminPassword, 12);
      await client.query(
        `INSERT INTO users (role, email, password_hash, nom, prenom, cin, est_actif, est_verifie)
         VALUES ('admin', $1, $2, 'Administrateur', 'Principal', $3, true, true)`,
        [adminEmail, hash, adminCin]
      );
      console.log(`[SEED] Compte admin cree : ${adminEmail} / mot de passe defini dans .env`);
    } else {
      console.log('[SEED] Le compte admin existe deja, aucune action.');
    }

    await client.query('COMMIT');
    console.log('[SEED] Termine avec succes.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[SEED] Erreur, rollback effectue :', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
