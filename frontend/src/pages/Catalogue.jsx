import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/common/ProductCard';
import './Catalogue.css';

export default function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const tri = searchParams.get('tri') || '';
  const prixMin = searchParams.get('prix_min') || '';
  const prixMax = searchParams.get('prix_max') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    categoryService.list().then(setCategories);
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    productService
      .list({ q, category, tri, prix_min: prixMin, prix_max: prixMax, page, limit: 20 })
      .then((res) => {
        setProducts(res.data);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  }, [q, category, tri, prixMin, prixMax, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  }

  async function handleAddToCart(productId) {
    if (!user || user.role !== 'client') {
      window.location.href = '/connexion';
      return;
    }
    await addItem(productId, 1);
  }

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  return (
    <div className="container catalogue">
      <aside className="catalogue__filters panel">
        <h3 className="panel-title">Filtres</h3>

        <div className="form-group">
          <label className="form-label">Categorie</label>
          <select className="form-select" value={category} onChange={(e) => updateParam('category', e.target.value)}>
            <option value="">Toutes les categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.nom}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Prix minimum</label>
          <input type="number" className="form-input" value={prixMin} onChange={(e) => updateParam('prix_min', e.target.value)} placeholder="0" />
        </div>

        <div className="form-group">
          <label className="form-label">Prix maximum</label>
          <input type="number" className="form-input" value={prixMax} onChange={(e) => updateParam('prix_max', e.target.value)} placeholder="Sans limite" />
        </div>

        <div className="form-group">
          <label className="form-label">Trier par</label>
          <select className="form-select" value={tri} onChange={(e) => updateParam('tri', e.target.value)}>
            <option value="">Plus recents</option>
            <option value="prix_asc">Prix croissant</option>
            <option value="prix_desc">Prix decroissant</option>
            <option value="popularite">Popularite</option>
            <option value="note">Meilleures notes</option>
          </select>
        </div>
      </aside>

      <div className="catalogue__results">
        <div className="catalogue__results-header">
          <h1>{q ? `Resultats pour "${q}"` : 'Catalogue'}</h1>
          <span>{pagination.total} produit{pagination.total > 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <p>Aucun produit ne correspond a votre recherche.</p>
          </div>
        ) : (
          <>
            <div className="grid-products">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="catalogue__pagination">
                <button className="btn btn--outline btn--sm" disabled={page <= 1} onClick={() => updateParam('page', String(page - 1))}>
                  ← Precedent
                </button>
                <span>Page {page} / {totalPages}</span>
                <button className="btn btn--outline btn--sm" disabled={page >= totalPages} onClick={() => updateParam('page', String(page + 1))}>
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
