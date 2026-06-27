import { Link } from 'react-router-dom';
import './ProductCard.css';

const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjJFQkRBIi8+PC9zdmc+';

export default function ProductCard({ product, onAddToCart }) {
  const { id, nom, prix_vente, devise, note_moyenne, nombre_avis, image_principale, fournisseur_ville, categorie_nom } = product;

  return (
    <div className="product-card">
      <Link to={`/produits/${id}`} className="product-card__image-link">
        <img src={image_principale || FALLBACK_IMAGE} alt={nom} className="product-card__image" loading="lazy" />
        {categorie_nom && <span className="product-card__category">{categorie_nom}</span>}
      </Link>
      <div className="product-card__body">
        <Link to={`/produits/${id}`}>
          <h3 className="product-card__title">{nom}</h3>
        </Link>
        {fournisseur_ville && <p className="product-card__location">📍 {fournisseur_ville}</p>}
        <div className="product-card__meta">
          <span className="product-card__price">{Number(prix_vente).toLocaleString('fr-FR')} {devise}</span>
          {nombre_avis > 0 && (
            <span className="product-card__rating">★ {Number(note_moyenne).toFixed(1)} ({nombre_avis})</span>
          )}
        </div>
        {onAddToCart && (
          <button className="btn btn--primary btn--full" onClick={() => onAddToCart(id)}>
            Ajouter au panier
          </button>
        )}
      </div>
    </div>
  );
}
