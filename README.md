# FITAHIANTSOA

Plateforme internationale de commerce electronique et de marketing numerique reliant fournisseurs, clients, employes, administrateurs et partenaires logistiques, avec une priorite sur l'agriculture et le tourisme malgaches.

L'entreprise FITAHIANTSOA ne possede aucun stock physique : elle valide les produits soumis par les fournisseurs, fixe le prix de vente final, encaisse les paiements et orchestre la livraison via des partenaires logistiques externes.

## Stack technique

| Couche      | Technologie                                  |
|-------------|-----------------------------------------------|
| Frontend    | React 18 + Vite + React Router               |
| Backend     | Node.js + Express                             |
| Base de donnees | PostgreSQL                               |
| Authentification | JWT (access + refresh token)            |
| Upload de fichiers | Multer (stockage disque local)         |

## Structure du projet

```
fitahiantsoa/
├── backend/          # API REST Express
│   ├── src/
│   │   ├── controllers/   # Logique metier par ressource
│   │   ├── routes/        # Definition des endpoints
│   │   ├── middlewares/   # Auth JWT, controle de role, erreurs, upload
│   │   ├── db/             # Connexion PostgreSQL, schema.sql, scripts init/seed
│   │   └── utils/         # Generation de tokens, codes-barres, QR codes
│   └── uploads/      # Fichiers (images/videos produits) - non versionne
└── frontend/         # Application React
    └── src/
        ├── pages/          # Une sous-dossier par espace : client, fournisseur, employe, admin, logistique
        ├── components/     # Layouts (Header, Footer, DashboardLayout) et composants communs
        ├── context/        # AuthContext, CartContext
        ├── services/       # Appels API par ressource (axios)
        └── styles/         # Design tokens et composants UI partages
```

## Les 5 espaces de la plateforme

1. **Client** : catalogue, panier, commande, suivi de livraison, avis, messagerie.
2. **Fournisseur** : soumission de produits (en attente de validation), suivi des ventes et revenus, profil entreprise.
3. **Employe** : validation/refus des produits avec fixation du prix de vente final, gestion des commandes, creation de promotions.
4. **Administrateur** : gestion complete des utilisateurs (tous roles), des categories, dashboard analytique global (chiffre d'affaires, top produits, top fournisseurs).
5. **Partenaire logistique** : missions de livraison disponibles, acceptation/refus, mise a jour du statut (ramassage → transit → livraison), confirmation par code unique communique par le client.

## Demarrage rapide

### Pre-requis
- Node.js >= 18
- PostgreSQL >= 14 installe et demarre

### 1. Base de donnees

```bash
createdb fitahiantsoa
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Editez .env : renseignez DB_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET (voir commentaires dans le fichier)
npm install
npm run db:init     # Applique le schema SQL (toutes les tables)
npm run db:seed      # Cree les categories de base + le compte administrateur initial
npm run dev           # Demarre le serveur sur http://localhost:4000
```

Le compte administrateur initial est cree avec les identifiants definis dans `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

### 3. Frontend

Dans un second terminal :

```bash
cd frontend
npm install
npm run dev           # Demarre l'application sur http://localhost:5173
```

Le frontend est configure pour proxifier automatiquement les appels `/api` vers `http://localhost:4000` en developpement (voir `vite.config.js`).

### 4. Ouvrir l'application

Rendez-vous sur **http://localhost:5173**. Inscrivez-vous en tant que client, fournisseur ou partenaire logistique depuis la page d'inscription. Les comptes employe/admin ne peuvent etre crees que par un administrateur existant (depuis `/admin/utilisateurs`).

## Fonctionnalites couvertes dans cette version

- Authentification JWT complete (inscription, connexion, refresh automatique, deconnexion)
- Catalogue public avec recherche, filtres (categorie, prix), tri, pagination
- Fiche produit detaillee avec galerie media, QR code et code-barres generes automatiquement
- Panier et passage de commande (transaction atomique : stock, commission, notification, creation automatique de la livraison)
- Cycle de validation des produits par l'employe avec fixation du prix de vente
- Cycle complet de livraison avec code de confirmation unique
- Systeme d'avis verifie (seuls les acheteurs reels peuvent noter un produit)
- Notifications internes et messagerie entre utilisateurs
- Promotions et campagnes marketing
- Dashboard analytique administrateur (chiffre d'affaires, repartition par role/statut, top produits/fournisseurs)
- Categories et sous-categories administrables

## Limitations connues (a brancher dans une prochaine iteration)

- **Paiements reels** : la structure (table `payments`, choix de methode) existe, mais aucun prestataire (Mobile Money, carte bancaire, PayPal) n'est branche. Le statut reste `en_attente`.
- **Internationalisation (i18n)** : les colonnes multilingues existent en base (`nom_en`, `nom_mg`...) mais l'interface n'est pour l'instant qu'en francais. Un systeme de traduction (ex. `react-i18next`) reste a integrer.
- **Scan QR/code-barres via camera** : le QR code est genere et affiche, mais la lecture par camera cote client n'est pas implementee.
- **Notifications push/email en temps reel** : les notifications sont stockees en base et recuperees par polling ; pas de WebSocket ni d'envoi d'email pour l'instant.

## Deploiement sur GitHub

```bash
cd fitahiantsoa
git init
git add .
git commit -m "Plateforme FITAHIANTSOA - version initiale complete"
git branch -M main
git remote add origin https://github.com/sergio-olivier24/fitahiantsoa.git
git push -u origin main
```

**Important** : verifiez que `.env` n'est jamais commite (il est dans `.gitignore`). Pensez a configurer les variables d'environnement directement sur votre plateforme d'hebergement (Render, Railway, Fly.io, VPS...) pour la production.
