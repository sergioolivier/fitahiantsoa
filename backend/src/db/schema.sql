-- ============================================================
-- FITAHIANTSOA - Schema de base de donnees PostgreSQL
-- Plateforme de commerce electronique multi-roles
-- ============================================================

-- Extension pour generer des UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('client', 'fournisseur', 'employe', 'admin', 'partenaire_logistique');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE product_status AS ENUM ('en_attente', 'valide', 'refuse', 'en_vente', 'suspendu');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('en_attente', 'confirmee', 'en_preparation', 'prise_en_charge', 'en_transit', 'livree', 'annulee', 'remboursee');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE delivery_status AS ENUM ('demande', 'acceptee', 'refusee', 'ramassage', 'en_transit', 'livree', 'echouee');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('en_attente', 'paye', 'echoue', 'rembourse');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('mobile_money', 'carte_bancaire', 'virement', 'especes_livraison', 'paypal');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE staff_type AS ENUM ('interne', 'externe');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- UTILISATEURS (table commune a tous les roles)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  telephone VARCHAR(30),
  cin VARCHAR(20),                 -- numero de Carte d'Identite Nationale (obligatoire pour securite)
  pays VARCHAR(100) DEFAULT 'Madagascar',
  ville VARCHAR(100),
  adresse TEXT,
  langue_preferee VARCHAR(10) DEFAULT 'fr',   -- fr, en, mg
  devise_preferee VARCHAR(10) DEFAULT 'MGA',
  avatar_url TEXT,
  est_actif BOOLEAN DEFAULT true,
  est_verifie BOOLEAN DEFAULT false,
  type_personnel staff_type,        -- 'interne' (salarie fixe FITAHIANTSOA) ou 'externe' (mission courte duree). Applicable uniquement au role 'employe'.
  date_fin_mission DATE,            -- date de fin prevue pour le personnel externe en mission, optionnel
  derniere_connexion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- PROFILS FOURNISSEUR (infos supplementaires specifiques)
-- ============================================================
CREATE TABLE IF NOT EXISTS supplier_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nom_entreprise VARCHAR(255),
  secteur_activite VARCHAR(100),     -- equipements_ruraux, irrigation, outillage, materiel_medical, autre
  description TEXT,
  numero_fiscal VARCHAR(50),
  solde_disponible NUMERIC(14,2) DEFAULT 0,    -- revenus dus au fournisseur apres commission
  commission_taux NUMERIC(5,2) DEFAULT 15.00,  -- pourcentage pris par la plateforme
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================================
-- PROFILS PARTENAIRE LOGISTIQUE
-- ============================================================
CREATE TABLE IF NOT EXISTS logistics_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nom_societe VARCHAR(255),
  zones_couvertes TEXT[],            -- liste de villes/regions couvertes
  vehicule_type VARCHAR(50),
  capacite_kg NUMERIC(8,2),
  note_moyenne NUMERIC(3,2) DEFAULT 0,
  revenus_generes NUMERIC(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================================
-- CATEGORIES (avec sous-categories via parent_id)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(150) NOT NULL,
  nom_en VARCHAR(150),
  nom_mg VARCHAR(150),
  slug VARCHAR(150) UNIQUE NOT NULL,
  icone VARCHAR(100),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  ordre_affichage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PRODUITS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  validated_by UUID REFERENCES users(id) ON DELETE SET NULL,   -- employe qui a valide

  nom VARCHAR(255) NOT NULL,
  description TEXT,
  caracteristiques_techniques JSONB DEFAULT '{}',

  prix_propose NUMERIC(14,2) NOT NULL,        -- prix suggere par le fournisseur
  prix_vente NUMERIC(14,2),                   -- prix final fixe par l'entreprise
  devise VARCHAR(10) DEFAULT 'MGA',

  stock_theorique INTEGER DEFAULT 0,
  unite VARCHAR(30) DEFAULT 'unite',

  statut product_status DEFAULT 'en_attente',
  motif_refus TEXT,

  qr_code_data TEXT,                -- contenu encode dans le QR code
  code_barre VARCHAR(50) UNIQUE,

  note_moyenne NUMERIC(3,2) DEFAULT 0,
  nombre_avis INTEGER DEFAULT 0,
  nombre_ventes INTEGER DEFAULT 0,

  est_sponsorise BOOLEAN DEFAULT false,
  est_populaire BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_statut ON products(statut);
CREATE INDEX IF NOT EXISTS idx_products_nom ON products USING gin (to_tsvector('french', nom));

-- ============================================================
-- IMAGES / MEDIAS PRODUITS
-- ============================================================
CREATE TABLE IF NOT EXISTS product_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL DEFAULT 'image',  -- image | video
  url TEXT NOT NULL,
  ordre_affichage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PANIER
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantite INTEGER NOT NULL DEFAULT 1 CHECK (quantite > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, product_id)
);

-- ============================================================
-- COMMANDES
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_commande VARCHAR(30) UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  montant_total NUMERIC(14,2) NOT NULL,
  frais_livraison NUMERIC(14,2) DEFAULT 0,
  devise VARCHAR(10) DEFAULT 'MGA',

  statut order_status DEFAULT 'en_attente',

  adresse_livraison TEXT NOT NULL,
  ville_livraison VARCHAR(100),
  pays_livraison VARCHAR(100) DEFAULT 'Madagascar',
  telephone_contact VARCHAR(30),

  note_client TEXT,
  traite_par UUID REFERENCES users(id) ON DELETE SET NULL, -- employe assigne

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_statut ON orders(statut);

-- ============================================================
-- LIGNES DE COMMANDE
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  supplier_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  quantite INTEGER NOT NULL CHECK (quantite > 0),
  prix_unitaire NUMERIC(14,2) NOT NULL,
  commission_montant NUMERIC(14,2) DEFAULT 0,
  montant_du_fournisseur NUMERIC(14,2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_supplier ON order_items(supplier_id);

-- ============================================================
-- PAIEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  methode payment_method NOT NULL,
  statut payment_status DEFAULT 'en_attente',
  montant NUMERIC(14,2) NOT NULL,
  devise VARCHAR(10) DEFAULT 'MGA',
  reference_transaction VARCHAR(150),
  payload_brut JSONB DEFAULT '{}',   -- reponse brute du fournisseur de paiement (a brancher plus tard)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- LIVRAISONS
-- ============================================================
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  logistics_partner_id UUID REFERENCES users(id) ON DELETE SET NULL,

  statut delivery_status DEFAULT 'demande',
  code_confirmation VARCHAR(10),     -- code remis au client pour confirmer reception

  date_demande TIMESTAMPTZ DEFAULT now(),
  date_acceptation TIMESTAMPTZ,
  date_ramassage TIMESTAMPTZ,
  date_livraison TIMESTAMPTZ,

  historique_statuts JSONB DEFAULT '[]',  -- trace chaque changement de statut avec horodatage

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_order ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_partner ON deliveries(logistics_partner_id);

-- ============================================================
-- AVIS / EVALUATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  note INTEGER NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, client_id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,   -- commande, livraison, promotion, message, systeme
  titre VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  lien_action TEXT,
  est_lue BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, est_lue);

-- ============================================================
-- MESSAGERIE INTERNE
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sujet VARCHAR(255),
  contenu TEXT NOT NULL,
  est_lu BOOLEAN DEFAULT false,
  related_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, est_lu);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- ============================================================
-- PROMOTIONS / CAMPAGNES MARKETING
-- ============================================================
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  code_promo VARCHAR(50) UNIQUE,
  type_reduction VARCHAR(20) DEFAULT 'pourcentage',  -- pourcentage | montant_fixe
  valeur_reduction NUMERIC(10,2) NOT NULL,
  date_debut TIMESTAMPTZ NOT NULL,
  date_fin TIMESTAMPTZ NOT NULL,
  est_active BOOLEAN DEFAULT true,
  categorie_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- JOURNAL DES CONNEXIONS (securite)
-- ============================================================
CREATE TABLE IF NOT EXISTS login_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address VARCHAR(50),
  user_agent TEXT,
  succes BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PARAMETRES GLOBAUX DE LA PLATEFORME (gere par admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_settings (
  cle VARCHAR(100) PRIMARY KEY,
  valeur JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TRIGGER : mise a jour automatique de updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','products','orders','payments','deliveries']
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON %I;
      CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
    ', t, t);
  END LOOP;
END $$;
