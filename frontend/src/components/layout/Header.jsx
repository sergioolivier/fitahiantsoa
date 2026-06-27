import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Header.css';

const DASHBOARD_PATH = {
  client: '/client/tableau-de-bord',
  fournisseur: '/fournisseur/tableau-de-bord',
  employe: '/employe/tableau-de-bord',
  admin: '/admin/tableau-de-bord',
  partenaire_logistique: '/logistique/tableau-de-bord',
};

export default function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(e) {
    e.preventDefault();
    navigate(query ? `/catalogue?q=${encodeURIComponent(query)}` : '/catalogue');
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__logo">
          <span className="site-header__logo-mark">F</span>
          FITAHIANTSOA
        </Link>

        <form className="site-header__search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Rechercher un produit, une categorie..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Rechercher"
          />
          <button type="submit" aria-label="Lancer la recherche">🔍</button>
        </form>

        <button className="site-header__burger" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
          ☰
        </button>

        <nav className={`site-header__nav ${menuOpen ? 'is-open' : ''}`}>
          <Link to="/catalogue" onClick={() => setMenuOpen(false)}>Catalogue</Link>
          <Link to="/promotions" onClick={() => setMenuOpen(false)}>Promotions</Link>

          {!user && (
            <>
              <Link to="/connexion" className="btn btn--outline btn--sm" onClick={() => setMenuOpen(false)}>Connexion</Link>
              <Link to="/inscription" className="btn btn--primary btn--sm" onClick={() => setMenuOpen(false)}>Inscription</Link>
            </>
          )}

          {user && (
            <>
              {user.role === 'client' && (
                <Link to="/client/panier" className="site-header__cart" onClick={() => setMenuOpen(false)}>
                  🛒 {cart.nombre_articles > 0 && <span className="site-header__cart-count">{cart.nombre_articles}</span>}
                </Link>
              )}
              <Link to={DASHBOARD_PATH[user.role] || '/'} className="btn btn--outline btn--sm" onClick={() => setMenuOpen(false)}>
                {user.prenom}
              </Link>
              <button className="btn btn--ghost btn--sm" onClick={logout}>Deconnexion</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
