import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { categoryService } from '../../services/category.service';
import LanguageSwitcher from '../common/LanguageSwitcher';
import './Header.css';

const DASHBOARD_PATH = {
  client: '/client/tableau-de-bord',
  fournisseur: '/fournisseur/tableau-de-bord',
  employe: '/employe/tableau-de-bord',
  admin: '/admin/tableau-de-bord',
  partenaire_logistique: '/logistique/tableau-de-bord',
};

export default function Header() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {});
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    navigate(query ? `/catalogue?q=${encodeURIComponent(query)}` : '/catalogue');
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      {/* ---------- Barre utilitaire : confiance + langue + compte rapide ---------- */}
      <div className="site-header__utility">
        <div className="container site-header__utility-inner">
          <span className="site-header__utility-trust">✓ {t('home.trustVerified')}</span>
          <div className="site-header__utility-right">
            <LanguageSwitcher compact onDark />
            {!user && (
              <Link to="/inscription?role=fournisseur" className="site-header__utility-link">
                {t('home.becomeSupplier')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Barre principale : logo, recherche, compte, panier ---------- */}
      <div className="site-header__main">
        <div className="container site-header__inner">
          <Link to="/" className="site-header__logo">
            <span className="site-header__logo-mark">F</span>
            <span className="site-header__logo-text">{t('common.appName')}</span>
          </Link>

          <form className="site-header__search" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder={t('common.search')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t('common.search')}
            />
            <button type="submit" aria-label={t('common.search')}>🔍</button>
          </form>

          <button className="site-header__burger" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            ☰
          </button>

          <nav className={`site-header__nav ${menuOpen ? 'is-open' : ''}`}>
            {!user && (
              <>
                <Link to="/connexion" className="site-header__account" onClick={() => setMenuOpen(false)}>
                  <span className="site-header__account-line1">{t('common.login')}</span>
                  <span className="site-header__account-line2">{t('common.register')}</span>
                </Link>
              </>
            )}

            {user && (
              <Link to={DASHBOARD_PATH[user.role] || '/'} className="site-header__account" onClick={() => setMenuOpen(false)}>
                <span className="site-header__account-line1">{t('common.hello')}, {user.prenom}</span>
                <span className="site-header__account-line2">{t('common.myAccount')}</span>
              </Link>
            )}

            <Link to="/promotions" className="site-header__nav-link" onClick={() => setMenuOpen(false)}>
              {t('common.promotions')}
            </Link>

            {user && user.role === 'client' && (
              <Link to="/client/panier" className="site-header__cart" onClick={() => setMenuOpen(false)}>
                <span className="site-header__cart-icon">🛒</span>
                {cart.nombre_articles > 0 && <span className="site-header__cart-count">{cart.nombre_articles}</span>}
                <span className="site-header__cart-label">{t('common.cart')}</span>
              </Link>
            )}

            {user && (
              <button className="site-header__logout" onClick={logout}>{t('common.logout')}</button>
            )}
          </nav>
        </div>
      </div>

      {/* ---------- Bandeau categories : navigation horizontale type marketplace ---------- */}
      <div className="site-header__categories">
        <div className="container site-header__categories-inner">
          <Link to="/catalogue" className="site-header__category-link site-header__category-link--all">
            {t('catalogue.allCategories')}
          </Link>
          {categories.filter((c) => !c.parent_id).map((c) => (
            <Link key={c.id} to={`/catalogue?category=${c.slug}`} className="site-header__category-link">
              {t(`categories.${c.slug}`, c.nom)}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
