import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './DashboardLayout.css';

const NAV_BY_ROLE = {
  client: [
    { to: '/client/tableau-de-bord', label: 'Tableau de bord', icon: '🏠' },
    { to: '/client/commandes', label: 'Mes commandes', icon: '📦' },
    { to: '/client/panier', label: 'Mon panier', icon: '🛒' },
    { to: '/client/messages', label: 'Messages', icon: '✉️' },
    { to: '/client/notifications', label: 'Notifications', icon: '🔔' },
    { to: '/client/parametres', label: 'Parametres', icon: '⚙️' },
  ],
  fournisseur: [
    { to: '/fournisseur/tableau-de-bord', label: 'Tableau de bord', icon: '🏠' },
    { to: '/fournisseur/produits', label: 'Mes produits', icon: '📦' },
    { to: '/fournisseur/produits/nouveau', label: 'Soumettre un produit', icon: '➕' },
    { to: '/fournisseur/ventes', label: 'Ventes & revenus', icon: '💰' },
    { to: '/fournisseur/messages', label: 'Messages', icon: '✉️' },
    { to: '/fournisseur/notifications', label: 'Notifications', icon: '🔔' },
    { to: '/fournisseur/parametres', label: 'Profil entreprise', icon: '⚙️' },
  ],
  employe: [
    { to: '/employe/tableau-de-bord', label: 'Tableau de bord', icon: '🏠' },
    { to: '/employe/validation-produits', label: 'Validation produits', icon: '✅' },
    { to: '/employe/commandes', label: 'Commandes', icon: '📦' },
    { to: '/employe/promotions', label: 'Promotions', icon: '🏷️' },
    { to: '/employe/messages', label: 'Messages', icon: '✉️' },
  ],
  admin: [
    { to: '/admin/tableau-de-bord', label: 'Tableau de bord', icon: '🏠' },
    { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: '👥' },
    { to: '/admin/produits', label: 'Produits', icon: '📦' },
    { to: '/admin/commandes', label: 'Commandes', icon: '🧾' },
    { to: '/admin/categories', label: 'Categories', icon: '🗂️' },
    { to: '/admin/promotions', label: 'Promotions', icon: '🏷️' },
    { to: '/admin/parametres', label: 'Parametres plateforme', icon: '⚙️' },
  ],
  partenaire_logistique: [
    { to: '/logistique/tableau-de-bord', label: 'Tableau de bord', icon: '🏠' },
    { to: '/logistique/disponibles', label: 'Missions disponibles', icon: '📋' },
    { to: '/logistique/mes-livraisons', label: 'Mes livraisons', icon: '🚚' },
    { to: '/logistique/historique', label: 'Historique', icon: '🕓' },
  ],
};

const ROLE_LABEL = {
  client: 'Espace client',
  fournisseur: 'Espace fournisseur',
  employe: 'Espace employe',
  admin: 'Administration',
  partenaire_logistique: 'Espace partenaire logistique',
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const items = NAV_BY_ROLE[user.role] || [];

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <Link to="/" className="dashboard-sidebar__logo">
          <span className="site-header__logo-mark">F</span> FITAHIANTSOA
        </Link>
        <p className="dashboard-sidebar__role">{ROLE_LABEL[user.role]}</p>
        <nav className="dashboard-sidebar__nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `dashboard-sidebar__link ${isActive ? 'is-active' : ''}`}
              end
            >
              <span>{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="dashboard-sidebar__user">
          <div className="dashboard-sidebar__avatar">{user.prenom?.[0]}{user.nom?.[0]}</div>
          <div>
            <strong>{user.prenom} {user.nom}</strong>
            <button className="dashboard-sidebar__logout" onClick={logout}>Deconnexion</button>
          </div>
        </div>
      </aside>
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
