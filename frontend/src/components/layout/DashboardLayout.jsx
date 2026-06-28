import { NavLink, Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import './DashboardLayout.css';

function useNavByRole(t) {
  return {
    client: [
      { to: '/client/tableau-de-bord', label: t('dashboard.navDashboard'), icon: '🏠' },
      { to: '/client/commandes', label: t('dashboard.navMyOrders'), icon: '📦' },
      { to: '/client/panier', label: t('dashboard.navMyCart'), icon: '🛒' },
      { to: '/client/messages', label: t('dashboard.navMessages'), icon: '✉️' },
      { to: '/client/notifications', label: t('dashboard.navNotifications'), icon: '🔔' },
      { to: '/client/parametres', label: t('dashboard.navSettings'), icon: '⚙️' },
    ],
    fournisseur: [
      { to: '/fournisseur/tableau-de-bord', label: t('dashboard.navDashboard'), icon: '🏠' },
      { to: '/fournisseur/produits', label: t('dashboard.navMyProducts'), icon: '📦' },
      { to: '/fournisseur/produits/nouveau', label: t('dashboard.navSubmitProduct'), icon: '➕' },
      { to: '/fournisseur/ventes', label: t('dashboard.navSales'), icon: '💰' },
      { to: '/fournisseur/messages', label: t('dashboard.navMessages'), icon: '✉️' },
      { to: '/fournisseur/notifications', label: t('dashboard.navNotifications'), icon: '🔔' },
      { to: '/fournisseur/parametres', label: t('dashboard.navCompanyProfile'), icon: '⚙️' },
    ],
    employe: [
      { to: '/employe/tableau-de-bord', label: t('dashboard.navDashboard'), icon: '🏠' },
      { to: '/employe/validation-produits', label: t('dashboard.navProductValidation'), icon: '✅' },
      { to: '/employe/commandes', label: t('dashboard.navOrders'), icon: '📦' },
      { to: '/employe/promotions', label: t('dashboard.navPromotions'), icon: '🏷️' },
      { to: '/employe/messages', label: t('dashboard.navMessages'), icon: '✉️' },
    ],
    admin: [
      { to: '/admin/tableau-de-bord', label: t('dashboard.navDashboard'), icon: '🏠' },
      { to: '/admin/utilisateurs', label: t('dashboard.navUsers'), icon: '👥' },
      { to: '/admin/produits', label: t('dashboard.navProducts'), icon: '📦' },
      { to: '/admin/commandes', label: t('dashboard.navOrders'), icon: '🧾' },
      { to: '/admin/categories', label: t('dashboard.navCategories'), icon: '🗂️' },
      { to: '/admin/promotions', label: t('dashboard.navPromotions'), icon: '🏷️' },
      { to: '/admin/parametres', label: t('dashboard.navPlatformSettings'), icon: '⚙️' },
    ],
    partenaire_logistique: [
      { to: '/logistique/tableau-de-bord', label: t('dashboard.navDashboard'), icon: '🏠' },
      { to: '/logistique/disponibles', label: t('dashboard.navAvailableMissions'), icon: '📋' },
      { to: '/logistique/mes-livraisons', label: t('dashboard.navMyDeliveries'), icon: '🚚' },
      { to: '/logistique/historique', label: t('dashboard.navHistory'), icon: '🕓' },
    ],
  };
}

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const NAV_BY_ROLE = useNavByRole(t);
  const ROLE_LABEL = {
    client: t('dashboard.spaceClient'),
    fournisseur: t('dashboard.spaceSupplier'),
    employe: t('dashboard.spaceEmployee'),
    admin: t('dashboard.spaceAdmin'),
    partenaire_logistique: t('dashboard.spaceLogistics'),
  };
  const items = NAV_BY_ROLE[user.role] || [];

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <Link to="/" className="dashboard-sidebar__logo">
          <span className="site-header__logo-mark">F</span> {t('common.appName')}
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
            <button className="dashboard-sidebar__logout" onClick={logout}>{t('common.logout')}</button>
          </div>
        </div>
      </aside>
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
