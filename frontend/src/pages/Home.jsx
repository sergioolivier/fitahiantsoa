import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/common/ProductCard';
import './Home.css';

const CATEGORY_ICONS = { agriculture: '🌾', tourisme: '🌴', sante: '💗', 'materiel-medical': '🩺', autres: '📦' };

export default function Home() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [categories, setCategories] = useState([]);
  const [populaires, setPopulaires] = useState([]);
  const [sponsorises, setSponsorises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      categoryService.list(),
      productService.list({ populaire: 'true', limit: 8 }),
      productService.list({ sponsorise: 'true', limit: 4 }),
    ])
      .then(([cats, pop, spon]) => {
        setCategories(cats);
        setPopulaires(pop.data);
        setSponsorises(spon.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleAddToCart(productId) {
    if (!user || user.role !== 'client') {
      window.location.href = '/connexion';
      return;
    }
    await addItem(productId, 1);
  }

  return (
    <div className="home">
      <section className="home-hero">
        <div className="container home-hero__inner">
          <div className="home-hero__text">
            <span className="home-hero__tag">Agriculture · Tourisme · Sante</span>
            <h1>Le pont commercial entre les producteurs malgaches et le monde.</h1>
            <p>
              FITAHIANTSOA met en relation fournisseurs, clients et partenaires logistiques
              autour d'une plateforme securisee, sans stock, geree par une equipe qui valide
              chaque produit avant sa mise en vente.
            </p>
            <div className="home-hero__actions">
              <Link to="/catalogue" className="btn btn--primary">Explorer le catalogue</Link>
              <Link to="/inscription?role=fournisseur" className="btn btn--outline">Devenir fournisseur</Link>
            </div>
          </div>
          <div className="home-hero__visual" aria-hidden="true">
            <div className="home-hero__blob" />
          </div>
        </div>
      </section>

      <div className="lamba-divider" />

      <section className="container home-section">
        <h2>Nos categories prioritaires</h2>
        <div className="home-categories">
          {categories
            .filter((c) => !c.parent_id)
            .map((cat) => (
              <Link to={`/catalogue?category=${cat.slug}`} key={cat.id} className="home-category-card">
                <span className="home-category-card__icon">{CATEGORY_ICONS[cat.slug] || '🛍️'}</span>
                <span>{cat.nom}</span>
              </Link>
            ))}
        </div>
      </section>

      {sponsorises.length > 0 && (
        <section className="container home-section">
          <h2>Offres mises en avant</h2>
          <div className="grid-products">
            {sponsorises.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </section>
      )}

      <section className="container home-section">
        <div className="home-section__header">
          <h2>Produits populaires</h2>
          <Link to="/catalogue">Voir tout le catalogue →</Link>
        </div>
        {loading ? (
          <p>Chargement du catalogue...</p>
        ) : populaires.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🌱</div>
            <p>Le catalogue se remplit. Revenez bientot pour decouvrir les premiers produits.</p>
          </div>
        ) : (
          <div className="grid-products">
            {populaires.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>

      <section className="home-info container">
        <div className="home-info__grid">
          <div>
            <h3>Comment ca marche</h3>
            <p>Un fournisseur propose un produit, notre equipe le valide et fixe le prix, puis il est publie sur la plateforme avec QR code et code-barres uniques.</p>
          </div>
          <div>
            <h3>Sans stock, sans risque</h3>
            <p>FITAHIANTSOA ne possede aucun produit physiquement : chaque article reste chez le fournisseur jusqu'a la commande, livre par nos partenaires logistiques.</p>
          </div>
          <div>
            <h3>International par nature</h3>
            <p>Disponible en francais, anglais et malagasy, avec paiements locaux et internationaux pour acheter depuis Madagascar ou depuis l'etranger.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
