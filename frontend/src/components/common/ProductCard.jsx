import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ProductCard.css';

const CATEGORY_GRADIENT = {
  'equipements-ruraux': 'linear-gradient(135deg, #E8C77E 0%, #C1502E 100%)',
  irrigation: 'linear-gradient(135deg, #6B8C6B 0%, #4A6B7C 100%)',
  outillage: 'linear-gradient(135deg, #E2A088 0%, #C1502E 100%)',
  'materiel-medical': 'linear-gradient(135deg, #4A6B7C 0%, #283D28 100%)',
  autres: 'linear-gradient(135deg, #E0D6BD 0%, #6B8C6B 100%)',
};

export default function ProductCard({ product, onAddToCart, className = '' }) {
  const { t } = useTranslation();
  const { id, nom, prix_vente, devise, note_moyenne, nombre_avis, image_principale, fournisseur_ville, categorie_nom, categorie_slug } = product;
  const fallbackGradient = CATEGORY_GRADIENT[categorie_slug] || CATEGORY_GRADIENT.autres;
  const categoryLabel = categorie_slug ? t(`categories.${categorie_slug}`, categorie_nom) : categorie_nom;

  return (
    <div className={`product-card ${className}`.trim()}>
      <Link to={`/produits/${id}`} className="product-card__image-link">
        {image_principale ? (
          <img src={image_principale} alt={nom} className="product-card__image" loading="lazy" />
        ) : (
          <div className="product-card__image product-card__image--fallback" style={{ background: fallbackGradient }} />
        )}
        {categoryLabel && <span className="product-card__category">{categoryLabel}</span>}
        {nombre_avis > 0 && (
          <span className="product-card__rating-badge">★ {Number(note_moyenne).toFixed(1)}</span>
        )}
        {onAddToCart && (
          <button
            className="product-card__quick-add"
            onClick={(e) => { e.preventDefault(); onAddToCart(id); }}
            aria-label={t('product.addToCart')}
            title={t('product.addToCart')}
          >
            +
          </button>
        )}
      </Link>
      <div className="product-card__body">
        <Link to={`/produits/${id}`}>
          <h3 className="product-card__title">{nom}</h3>
        </Link>
        {fournisseur_ville && <p className="product-card__location">{fournisseur_ville}</p>}
        <div className="product-card__meta">
          <span className="product-card__price">{Number(prix_vente).toLocaleString('fr-FR')} <small>{devise}</small></span>
          {nombre_avis > 0 && <span className="product-card__reviews">({nombre_avis} {t('product.reviews')})</span>}
        </div>
      </div>
    </div>
  );
}
