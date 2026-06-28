import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productService } from '../services/product.service';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [activeMedia, setActiveMedia] = useState(0);
  const [quantite, setQuantite] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setLoading(true);
    productService.getOne(id).then(setProduct).finally(() => setLoading(false));
  }, [id]);

  async function handleAddToCart() {
    if (!user || user.role !== 'client') {
      window.location.href = '/connexion';
      return;
    }
    await addItem(id, quantite);
    setMessage(t('product.addedToCart'));
    setTimeout(() => setMessage(null), 2500);
  }

  if (loading) return <div className="page-loading">{t('product.loadingProduct')}</div>;
  if (!product) return <div className="empty-state container"><p>{t('product.notFound')}</p></div>;

  const media = product.media?.length ? product.media : [{ url: null }];
  const categoryLabel = product.categorie_slug ? t(`categories.${product.categorie_slug}`, product.categorie_nom) : product.categorie_nom;

  return (
    <div className="container product-detail">
      <div className="product-detail__gallery">
        <div className="product-detail__main-image">
          {media[activeMedia]?.url ? (
            <img src={media[activeMedia].url} alt={product.nom} />
          ) : (
            <div className="product-detail__placeholder">📦</div>
          )}
        </div>
        {media.length > 1 && (
          <div className="product-detail__thumbnails">
            {media.map((m, idx) => (
              <button key={m.id || idx} className={idx === activeMedia ? 'is-active' : ''} onClick={() => setActiveMedia(idx)}>
                {m.url && <img src={m.url} alt="" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="product-detail__info">
        {categoryLabel && <Link to={`/catalogue?category=${product.categorie_slug}`} className="product-detail__category">{categoryLabel}</Link>}
        <h1>{product.nom}</h1>

        {product.nombre_avis > 0 && (
          <div className="product-detail__rating">★ {Number(product.note_moyenne).toFixed(1)} ({product.nombre_avis} {t('product.reviews')})</div>
        )}

        <p className="product-detail__price">{Number(product.prix_vente).toLocaleString('fr-FR')} {product.devise}</p>

        <p className="product-detail__description">{product.description}</p>

        {product.caracteristiques_techniques && Object.keys(product.caracteristiques_techniques).length > 0 && (
          <div className="product-detail__specs">
            <h3>{t('product.technicalSpecs')}</h3>
            <table>
              <tbody>
                {Object.entries(product.caracteristiques_techniques).map(([key, value]) => (
                  <tr key={key}><td>{key}</td><td>{String(value)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="product-detail__supplier">
          {t('product.soldBy')} <strong>{product.fournisseur_nom} {product.fournisseur_prenom}</strong>
          {product.fournisseur_ville && ` · ${product.fournisseur_ville}`}
        </div>

        {message && <div className="alert alert--success">{message}</div>}

        <div className="product-detail__buy-box">
          <label htmlFor="quantite">{t('product.quantity')}</label>
          <input
            id="quantite"
            type="number"
            min="1"
            className="form-input"
            value={quantite}
            onChange={(e) => setQuantite(Math.max(1, parseInt(e.target.value, 10) || 1))}
          />
          <button className="btn btn--primary" onClick={handleAddToCart}>{t('product.addToCart')}</button>
        </div>

        {product.code_barre && (
          <div className="product-detail__codes">
            <span>{t('product.barcode')} : {product.code_barre}</span>
            {product.qr_code_data && <img src={product.qr_code_data} alt="QR Code" width="90" height="90" />}
          </div>
        )}
      </div>

      {product.avis?.length > 0 && (
        <div className="product-detail__reviews">
          <h2>{t('product.customerReviews')}</h2>
          {product.avis.map((review) => (
            <div className="review-item" key={review.id}>
              <div className="review-item__header">
                <strong>{review.client_nom}</strong>
                <span>★ {review.note}/5</span>
              </div>
              {review.commentaire && <p>{review.commentaire}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
