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
  { nom: 'Equipements touristiques', nom_en: 'Tourism Equipment', nom_mg: 'Fitaovana fizahan-tany', slug: 'tourisme', icone: 'compass' },
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

// Catalogue de demonstration : equipements et materiels pour le tourisme
// (location de vehicules, camping, activites nautiques, guides et signaletique de circuits).
const DEMO_PRODUCTS_TOURISME = [
  {
    nom: '4x4 Toyota Land Cruiser tout-terrain',
    description: "Vehicule 4x4 robuste pour circuits touristiques et pistes difficiles, 7 places, double reservoir, treuil avant et galerie de toit incluse.",
    categorie_slug: 'tourisme',
    prix_propose: 95000000, prix_vente: 108000000, stock: 3, unite: 'unite',
  },
  {
    nom: 'Tente de camping 4 places impermeable',
    description: "Tente familiale 4 places, double toit impermeable, montage rapide sans outils, ideale pour les circuits dans les parcs nationaux.",
    categorie_slug: 'tourisme',
    prix_propose: 185000, prix_vente: 215000, stock: 25, unite: 'unite',
  },
  {
    nom: 'Kayak de mer 2 places polyethylene',
    description: "Kayak biplace en polyethylene haute densite, insubmersible, ideal pour la decouverte des canaux et lagons cotiers.",
    categorie_slug: 'tourisme',
    prix_propose: 1450000, prix_vente: 1650000, stock: 10, unite: 'unite',
  },
  {
    nom: 'Kit complet equipement de guide touristique',
    description: "Kit pour guide professionnel : sac a dos technique 40L, jumelles, talkie-walkie, trousse de premiers secours et lampe frontale.",
    categorie_slug: 'tourisme',
    prix_propose: 320000, prix_vente: 365000, stock: 18, unite: 'kit',
  },
  {
    nom: 'Panneau de signaletique de circuit touristique',
    description: "Panneau directionnel en aluminium trait, resistant aux intemperies, personnalisable avec pictogrammes et distances, pour balisage de circuits.",
    categorie_slug: 'tourisme',
    prix_propose: 145000, prix_vente: 168000, stock: 50, unite: 'unite',
  },
  {
    nom: 'Quad 4x4 250cc tout-terrain',
    description: "Quad utilitaire et loisir 250cc, transmission automatique, ideal pour excursions sur pistes sablonneuses et reliefs accidentes.",
    categorie_slug: 'tourisme',
    prix_propose: 12500000, prix_vente: 14200000, stock: 5, unite: 'unite',
  },
  {
    nom: 'Sac a dos de trek 65L avec housse de pluie',
    description: "Sac a dos de randonnee 65 litres, armature ajustable, housse de pluie integree, multiples points d'attache pour materiel exterieur.",
    categorie_slug: 'tourisme',
    prix_propose: 175000, prix_vente: 205000, stock: 35, unite: 'unite',
  },
  {
    nom: 'Pirogue traditionnelle a balancier motorisee',
    description: "Pirogue a balancier de style traditionnel malgache, motorisation hors-bord 15CV, capacite 6 passagers, ideale pour excursions cotieres.",
    categorie_slug: 'tourisme',
    prix_propose: 8500000, prix_vente: 9700000, stock: 4, unite: 'unite',
  },
  {
    nom: 'Jumelles longue portee 10x42 etanches',
    description: "Jumelles professionnelles 10x42, traitement etanche et antibuee, ideales pour observation de la faune lors de circuits ecotouristiques.",
    categorie_slug: 'tourisme',
    prix_propose: 240000, prix_vente: 280000, stock: 22, unite: 'unite',
  },
  {
    nom: 'Gilet de sauvetage homologue adulte',
    description: "Gilet de sauvetage homologue, flottabilite 100N, reglable, pour activites nautiques encadrees et location aux touristes.",
    categorie_slug: 'tourisme',
    prix_propose: 68000, prix_vente: 79000, stock: 60, unite: 'unite',
  },
  {
    nom: 'Moto tout-terrain 200cc pour guides',
    description: "Moto trail 200cc, suspensions renforcees, pneus mixtes route-piste, ideale pour le guidage de groupes sur circuits ruraux et forestiers.",
    categorie_slug: 'tourisme',
    prix_propose: 9800000, prix_vente: 11200000, stock: 6, unite: 'unite',
  },
  {
    nom: 'Velo VTT location tout-terrain',
    description: "VTT semi-rigide 21 vitesses, cadre aluminium, freins a disque, adapte a la location pour circuits cyclotouristiques.",
    categorie_slug: 'tourisme',
    prix_propose: 650000, prix_vente: 740000, stock: 20, unite: 'unite',
  },
  {
    nom: 'Masque et tuba de plongee snorkeling',
    description: "Kit masque panoramique et tuba sec anti-eclaboussures, pour decouverte des fonds coralliens, taille adulte ajustable.",
    categorie_slug: 'tourisme',
    prix_propose: 45000, prix_vente: 55000, stock: 80, unite: 'unite',
  },
  {
    nom: 'Paddle gonflable stand-up 10 pieds',
    description: "Planche de paddle gonflable avec pompe haute pression, pagaie ajustable et sac de transport, pour lagons et plans d'eau calmes.",
    categorie_slug: 'tourisme',
    prix_propose: 980000, prix_vente: 1120000, stock: 14, unite: 'unite',
  },
  {
    nom: 'Hamac de randonnee avec moustiquaire',
    description: "Hamac suspendu deux places avec moustiquaire integree et auvent impermeable, pour bivouac en foret tropicale.",
    categorie_slug: 'tourisme',
    prix_propose: 125000, prix_vente: 145000, stock: 30, unite: 'unite',
  },
  {
    nom: 'Matelas de sol autogonflant compact',
    description: "Matelas autogonflant compact, isolant thermique, pour le confort en bivouac et trek de plusieurs jours.",
    categorie_slug: 'tourisme',
    prix_propose: 95000, prix_vente: 112000, stock: 40, unite: 'unite',
  },
  {
    nom: 'Rechaud de camping a gaz portatif',
    description: "Rechaud pliable monobruleur, allumage piezo, compatible cartouches de gaz standard, pour cuisine en plein air.",
    categorie_slug: 'tourisme',
    prix_propose: 78000, prix_vente: 92000, stock: 35, unite: 'unite',
  },
  {
    nom: 'Glaciere rigide 50L pour excursions',
    description: "Glaciere rigide 50 litres, isolation haute performance, poignees renforcees, ideale pour les excursions de plusieurs jours.",
    categorie_slug: 'tourisme',
    prix_propose: 210000, prix_vente: 245000, stock: 18, unite: 'unite',
  },
  {
    nom: 'Lampe frontale rechargeable haute puissance',
    description: "Lampe frontale LED rechargeable USB, 400 lumens, mode rouge nocturne, pour treks et observation nocturne de la faune.",
    categorie_slug: 'tourisme',
    prix_propose: 58000, prix_vente: 68000, stock: 50, unite: 'unite',
  },
  {
    nom: 'Trousse de premiers secours randonnee',
    description: "Trousse de secours complete et compacte, pansements, antiseptiques et materiel de bandage, conforme aux sorties en milieu isole.",
    categorie_slug: 'tourisme',
    prix_propose: 65000, prix_vente: 76000, stock: 45, unite: 'unite',
  },
  {
    nom: 'GPS de randonnee outdoor etanche',
    description: "GPS portable etanche pour le trek et l'ecotourisme, cartographie hors-ligne, autonomie longue duree, boussole electronique integree.",
    categorie_slug: 'tourisme',
    prix_propose: 480000, prix_vente: 555000, stock: 16, unite: 'unite',
  },
  {
    nom: 'Bottes de randonnee imperméables tige haute',
    description: "Chaussures de randonnee tige haute, membrane impermeable respirante, semelle crampons adherence terrain mixte.",
    categorie_slug: 'tourisme',
    prix_propose: 165000, prix_vente: 195000, stock: 40, unite: 'paire',
  },
  {
    nom: 'Telescope d\'observation longue distance',
    description: "Longue-vue 20-60x60 avec trepied compact, ideale pour observation de la faune et des baleines depuis le rivage.",
    categorie_slug: 'tourisme',
    prix_propose: 385000, prix_vente: 445000, stock: 12, unite: 'unite',
  },
  {
    nom: 'Bache de sol tente familiale renforcee',
    description: "Bache de sol renforcee compatible grandes tentes familiales, protection contre l'humidite et les perforations.",
    categorie_slug: 'tourisme',
    prix_propose: 52000, prix_vente: 62000, stock: 38, unite: 'unite',
  },
  {
    nom: 'Kit de signalisation et fanions de balisage circuit',
    description: "Kit de 50 fanions reflectorisants et piquets de balisage, pour marquage temporaire de circuits de randonnee ou d'evenements touristiques.",
    categorie_slug: 'tourisme',
    prix_propose: 88000, prix_vente: 102000, stock: 25, unite: 'kit',
  },
];

/**
 * Insere un catalogue de produits de demonstration pour un fournisseur donne,
 * deja valides et publies en vente. N'agit que si ce fournisseur n'a encore
 * aucun produit, pour rester idempotent entre plusieurs executions du seed.
 */
async function insererCatalogueDemo(client, supplierId, adminId, produits, libelle) {
  const existingProducts = await client.query('SELECT COUNT(*) FROM products WHERE supplier_id = $1', [supplierId]);
  if (parseInt(existingProducts.rows[0].count, 10) > 0) {
    console.log(`[SEED] Le catalogue de demonstration (${libelle}) existe deja, aucune action.`);
    return;
  }

  console.log(`[SEED] Insertion du catalogue de demonstration (${libelle})...`);
  for (const p of produits) {
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
  console.log(`[SEED] ${produits.length} produits (${libelle}) inseres et publies.`);
}

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

    // Fournisseur de demonstration specialise dans le materiel touristique
    const demoTourismeSupplierEmail = 'mada.tourisme@fitahiantsoa.mg';
    let tourismeSupplierId;
    const existingTourismeSupplier = await client.query('SELECT id FROM users WHERE email = $1', [demoTourismeSupplierEmail]);
    if (existingTourismeSupplier.rowCount === 0) {
      console.log('[SEED] Creation du fournisseur de demonstration Mada Tourisme & Aventure...');
      const hash = await bcrypt.hash('Fournisseur123!', 12);
      const result = await client.query(
        `INSERT INTO users (role, email, password_hash, nom, prenom, cin, ville, est_actif, est_verifie)
         VALUES ('fournisseur', $1, $2, 'Tourisme', 'Mada', '202020200002', 'Antananarivo', true, true)
         RETURNING id`,
        [demoTourismeSupplierEmail, hash]
      );
      tourismeSupplierId = result.rows[0].id;
      await client.query(
        `INSERT INTO supplier_profiles (user_id, nom_entreprise, secteur_activite, description, commission_taux)
         VALUES ($1, 'Mada Tourisme & Aventure', 'tourisme', 'Distributeur de materiel et vehicules pour le tourisme et l''ecotourisme a Madagascar.', 15)`,
        [tourismeSupplierId]
      );
    } else {
      tourismeSupplierId = existingTourismeSupplier.rows[0].id;
      console.log('[SEED] Le fournisseur de demonstration tourisme existe deja, aucune action.');
    }

    // Catalogue de demonstration : produits d'equipements ruraux, deja valides et en vente
    await insererCatalogueDemo(client, supplierId, adminId, DEMO_PRODUCTS, 'equipements ruraux');

    // Catalogue de demonstration : produits touristiques, deja valides et en vente
    await insererCatalogueDemo(client, tourismeSupplierId, adminId, DEMO_PRODUCTS_TOURISME, 'tourisme');

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
