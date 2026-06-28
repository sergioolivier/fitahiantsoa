import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/common/ProductCard';
import './Catalogue.css';

export default function Catalogue() {
  const { t } = useTranslation();
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
        <h3 className="panel-title">{t('catalogue.filters')}</h3>

        <div className="form-group">
          <label className="form-label">{t('catalogue.category')}</label>
          <select className="form-select" value={category} onChange={(e) => updateParam('category', e.target.value)}>
            <option value="">{t('catalogue.allCategories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{t(`categories.${c.slug}`, c.nom)}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">{t('catalogue.minPrice')}</label>
          <input type="number" className="form-input" value={prixMin} onChange={(e) => updateParam('prix_min', e.target.value)} placeholder="0" />
        </div>

        <div className="form-group">
          <label className="form-label">{t('catalogue.maxPrice')}</label>
          <input type="number" className="form-input" value={prixMax} onChange={(e) => updateParam('prix_max', e.target.value)} placeholder={t('catalogue.noLimit')} />
        </div>

        <div className="form-group">
          <label className="form-label">{t('catalogue.sortBy')}</label>
          <select className="form-select" value={tri} onChange={(e) => updateParam('tri', e.target.value)}>
            <option value="">{t('catalogue.sortRecent')}</option>
            <option value="prix_asc">{t('catalogue.sortPriceAsc')}</option>
            <option value="prix_desc">{t('catalogue.sortPriceDesc')}</option>
            <option value="popularite">{t('catalogue.sortPopularity')}</option>
            <option value="note">{t('catalogue.sortRating')}</option>
          </select>
        </div>
      </aside>

      <div className="catalogue__results">
        <div className="catalogue__results-header">
          <h1>{q ? `${t('catalogue.resultsFor')} "${q}"` : t('catalogue.title')}</h1>
          <span>{pagination.total} {pagination.total > 1 ? t('catalogue.products') : t('catalogue.product')}</span>
        </div>

        {loading ? (
          <p>{t('common.loading')}</p>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <p>{t('catalogue.noResults')}</p>
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
                  ← {t('catalogue.previous')}
                </button>
                <span>{t('catalogue.page')} {page} / {totalPages}</span>
                <button className="btn btn--outline btn--sm" disabled={page >= totalPages} onClick={() => updateParam('page', String(page + 1))}>
                  {t('catalogue.next')} →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
