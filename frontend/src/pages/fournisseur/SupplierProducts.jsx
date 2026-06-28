import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productService } from '../../services/product.service';
import StatusBadge from '../../components/common/StatusBadge';

export default function SupplierProducts() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    productService.listMine().then(setProducts).finally(() => setLoading(false));
  }

  async function handleDelete(id) {
    if (!window.confirm(t('pages.confirmWithdraw'))) return;
    await productService.remove(id);
    refresh();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1>{t('pages.myProducts')}</h1>
        <Link to="/fournisseur/produits/nouveau" className="btn btn--primary btn--sm">{t('pages.submitProduct')}</Link>
      </div>

      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📦</div>
            <p>{t('pages.noProductsYet')}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>{t('pages.product')}</th><th>{t('pages.category')}</th><th>{t('pages.proposedPrice')}</th><th>{t('pages.finalPrice')}</th><th>{t('pages.status')}</th><th>{t('pages.sales')}</th><th></th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.nom}</td>
                  <td>{p.categorie_slug ? t(`categories.${p.categorie_slug}`, p.categorie_nom) : (p.categorie_nom || '—')}</td>
                  <td>{Number(p.prix_propose).toLocaleString('fr-FR')} {p.devise}</td>
                  <td>{p.prix_vente ? `${Number(p.prix_vente).toLocaleString('fr-FR')} ${p.devise}` : '—'}</td>
                  <td>
                    <StatusBadge status={p.statut} />
                    {p.statut === 'refuse' && p.motif_refus && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-erreur)', marginTop: 4 }}>{p.motif_refus}</p>
                    )}
                  </td>
                  <td>{p.nombre_ventes}</td>
                  <td>
                    {['en_attente', 'refuse'].includes(p.statut) && (
                      <button className="btn btn--ghost btn--sm" onClick={() => handleDelete(p.id)}>{t('pages.withdraw')}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
