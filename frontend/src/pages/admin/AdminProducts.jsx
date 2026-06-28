import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { productService } from '../../services/product.service';
import StatusBadge from '../../components/common/StatusBadge';

export default function AdminProducts() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    Promise.all([
      api.get('/products', { params: { limit: 100 } }),
      productService.listPending(),
    ])
      .then(([pub, pending]) => {
        const map = new Map();
        pub.data.data.forEach((p) => map.set(p.id, p));
        pending.forEach((p) => map.set(p.id, p));
        setProducts(Array.from(map.values()));
      })
      .finally(() => setLoading(false));
  }

  async function handleDelete(id) {
    if (!window.confirm(t('pages.confirmDeleteProduct'))) return;
    await productService.remove(id);
    refresh();
  }

  return (
    <div>
      <h1>{t('pages.allProductsTitle')}</h1>
      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        {loading ? <p>{t('common.loading')}</p> : products.length === 0 ? (
          <div className="empty-state"><div className="empty-state__icon">📦</div><p>{t('pages.noProducts')}</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>{t('pages.product')}</th><th>{t('pages.supplier')}</th><th>{t('pages.amount')}</th><th>{t('pages.status')}</th><th></th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.nom}</td>
                  <td>{p.fournisseur_nom || '—'}</td>
                  <td>{p.prix_vente ? Number(p.prix_vente).toLocaleString('fr-FR') : Number(p.prix_propose).toLocaleString('fr-FR')} {p.devise}</td>
                  <td><StatusBadge status={p.statut} /></td>
                  <td><button className="btn btn--ghost btn--sm" onClick={() => handleDelete(p.id)}>{t('common.delete')}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
