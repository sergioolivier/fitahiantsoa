/**
 * Script de seed : insere les donnees de base necessaires
 * pour demarrer la plateforme (categories, compte admin, fournisseur
 * et catalogue de demonstration centre sur les equipements ruraux).
 *
 * Usage : npm run db:seed
 */
const bcrypt = require('bcryptjs');
const { pool } = require('./pool');
const { generateBarcode, generateProductQrCode } = require('../utils/codes.utils');
require('dotenv').config();

const CATEGORIES = [
  { nom: 'Equipements ruraux', nom_en: 'Rural Equipment', nom_mg: 'Fitaovana ho an\'ny ambanivohitra', slug: 'equipements-ruraux', icone: 'tractor' },
  { nom: 'Irrigation', nom_en: 'Irrigation', nom_mg: 'Fanondrahana', slug: 'irrigation', icone: 'droplet' },
  { nom: 'Materiel medical', nom_en: 'Medical Equipment', nom_mg: 'Fitaovam-pahasalamana', slug: 'materiel-medical', icone: 'stethoscope' },
  { nom: 'Outillage', nom_en: 'Tools', nom_mg: 'Fitaovana', slug: 'outillage', icone: 'wrench' },
  { nom: 'Autres', nom_en: 'Others', nom_mg: 'Hafa', slug: 'autres', icone: 'package' },
];

// Catalogue de demonstration : equipements ruraux et materiels professionnels,
// deja valides et en vente, pour qu'un nouveau visiteur voie un catalogue rempli.
const DEMO_PRODUCTS = [
  {
    nom: 'Motoculteur diesel 6CV',
    description: "Motoculteur robuste pour le labour et le binage des petites et moyennes parcelles. Moteur diesel 6 chevaux, demarrage manuel, fraise de 80cm incluse.",
    categorie_slug: 'equipements-ruraux',
    prix_propose: 2100000, prix_vente: 2450000, stock: 8, unite: 'unite',
  },
  {
    nom: 'Tracteur compact 25CV',
    description: "Tracteur compact ideal pour les exploitations familiales. Prise de force arriere, attelage 3 points, faible consommation de carburant.",
    categorie_slug: 'equipements-ruraux',
    prix_propose: 18500000, prix_vente: 21000000, stock: 2, unite: 'unite',
  },
  {
    nom: 'Kit d\'irrigation goutte-a-goutte 500m',
    description: "Systeme complet d'irrigation goutte-a-goutte pour 500 metres lineaires : tuyaux, goutteurs, raccords et filtre inclus.",
    categorie_slug: 'irrigation',
    prix_propose: 320000, prix_vente: 380000, stock: 25, unite: 'kit',
  },
  {
    nom: 'Motopompe a essence 3 pouces',
    description: "Motopompe pour irrigation et drainage, debit eleve, ideal pour les rizieres et bas-fonds. Moteur essence 4 temps.",
    categorie_slug: 'equipements-ruraux',
    prix_propose: 780000, prix_vente: 890000, stock: 12, unite: 'unite',
  },
  {
    nom: 'Pulverisateur a dos 16L',
    description: "Pulverisateur manuel a dos pour traitement phytosanitaire, capacite 16 litres, lance reglable, pression manuelle.",
    categorie_slug: 'outillage',
    prix_propose: 65000, prix_vente: 78000, stock: 40, unite: 'unite',
  },
  {
    nom: 'Charrue a disques pour tracteur',
    description: "Charrue a disques 2 corps, compatible avec tracteurs 20-40CV, ideal pour le labour profond des sols argileux.",
    categorie_slug: 'equipements-ruraux',
    prix_propose: 1450000, prix_vente: 1650000, stock: 6, unite: 'unite',
  },
  {
    nom: 'Decortiqueuse a riz mobile',
    description: "Decortiqueuse a riz de petite capacite, moteur essence integre, ideale pour les cooperatives rurales.",
    categorie_slug: 'equipements-ruraux',
    prix_propose: 3200000, prix_vente: 3650000, stock: 4, unite: 'unite',
  },
  {
    nom: 'Brouette renforcee 100L',
    description: "Brouette renforcee, cuve 100 litres, roue gonflable, chassis acier galvanise.",
    categorie_slug: 'outillage',
    prix_propose: 95000, prix_vente: 115000, stock: 30, unite: 'unite',
  },
  {
    nom: 'Kit de tuyaux d\'arrosage 100m',
    description: "Tuyau d'arrosage renforce, 100 metres, diametre 25mm, raccords rapides inclus.",
    categorie_slug: 'irrigation',
    prix_propose: 145000, prix_vente: 170000, stock: 20, unite: 'kit',
  },
  {
    nom: 'Faucheuse debroussailleuse professionnelle',
    description: "Debroussailleuse a moteur thermique 2 temps, pour entretien de grandes parcelles et bordures.",
    categorie_slug: 'outillage',
    prix_propose: 410000, prix_vente: 470000, stock: 15, unite: 'unite',
  },
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

    let adminId;
    const existingAdmin = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    if (existingAdmin.rowCount === 0) {
      console.log('[SEED] Creation du compte administrateur initial...');
      const hash = await bcrypt.hash(adminPassword, 12);
      const result = await client.query(
        `INSERT INTO users (role, email, password_hash, nom, prenom, cin, est_actif, est_verifie)
         VALUES ('admin', $1, $2, 'Administrateur', 'Principal', $3, true, true)
         RETURNING id`,
        [adminEmail, hash, adminCin]
      );
      adminId = result.rows[0].id;
      console.log(`[SEED] Compte admin cree : ${adminEmail} / mot de passe defini dans .env`);
    } else {
      adminId = existingAdmin.rows[0].id;
      console.log('[SEED] Le compte admin existe deja, aucune action.');
    }

    // Fournisseur de demonstration specialise en equipements ruraux
    const demoSupplierEmail = 'agromada.equipements@fitahiantsoa.mg';
    let supplierId;
    const existingSupplier = await client.query('SELECT id FROM users WHERE email = $1', [demoSupplierEmail]);
    if (existingSupplier.rowCount === 0) {
      console.log('[SEED] Creation du fournisseur de demonstration AgroMada Equipements...');
      const hash = await bcrypt.hash('Fournisseur123!', 12);
      const result = await client.query(
        `INSERT INTO users (role, email, password_hash, nom, prenom, cin, ville, est_actif, est_verifie)
         VALUES ('fournisseur', $1, $2, 'Equipements', 'AgroMada', '202020200001', 'Antsirabe', true, true)
         RETURNING id`,
        [demoSupplierEmail, hash]
      );
      supplierId = result.rows[0].id;
      await client.query(
        `INSERT INTO supplier_profiles (user_id, nom_entreprise, secteur_activite, description, commission_taux)
         VALUES ($1, 'AgroMada Equipements', 'equipements_ruraux', 'Distributeur d''equipements ruraux et d''irrigation a Madagascar.', 15)`,
        [supplierId]
      );
    } else {
      supplierId = existingSupplier.rows[0].id;
      console.log('[SEED] Le fournisseur de demonstration existe deja, aucune action.');
    }

    // Catalogue de demonstration : produits d'equipements ruraux, deja valides et en vente
    const existingProducts = await client.query('SELECT COUNT(*) FROM products WHERE supplier_id = $1', [supplierId]);
    if (parseInt(existingProducts.rows[0].count, 10) === 0) {
      console.log('[SEED] Insertion du catalogue de demonstration (equipements ruraux)...');
      for (const p of DEMO_PRODUCTS) {
        const categoryResult = await client.query('SELECT id FROM categories WHERE slug = $1', [p.categorie_slug]);
        const categoryId = categoryResult.rows[0]?.id || null;
        const barcode = generateBarcode();

        const productResult = await client.query(
          `INSERT INTO products (supplier_id, category_id, validated_by, nom, description, prix_propose, prix_vente,
                                  devise, stock_theorique, unite, code_barre, statut, est_populaire)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'MGA', $8, $9, $10, 'en_vente', true)
           RETURNING id`,
          [supplierId, categoryId, adminId, p.nom, p.description, p.prix_propose, p.prix_vente, p.stock, p.unite, barcode]
        );
        const { dataUrl } = await generateProductQrCode(productResult.rows[0].id);
        await client.query('UPDATE products SET qr_code_data = $1 WHERE id = $2', [dataUrl, productResult.rows[0].id]);
      }
      console.log(`[SEED] ${DEMO_PRODUCTS.length} produits d'equipements ruraux inseres et publies.`);
    } else {
      console.log('[SEED] Le catalogue de demonstration existe deja, aucune action.');
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
