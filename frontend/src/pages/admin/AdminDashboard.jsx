import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../services/admin.service';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>{t('common.loading')}</p>;

  const usersByRole = Object.fromEntries((data?.utilisateurs?.par_role || []).map((u) => [u.role, parseInt(u.count, 10)]));
  const ordersByStatus = data?.commandes?.par_statut || [];

  return (
    <div>
      <h1>{t('pages.adminDashboardTitle')}</h1>
      <p style={{ color: 'var(--color-encre-soft)', marginBottom: 'var(--space-6)' }}>
        {t('pages.platformOverview')}
      </p>

      <div className="stat-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-card">
          <div className="stat-card__label">{t('pages.totalRevenue')}</div>
          <div className="stat-card__value">{Number(data?.finances?.chiffre_affaires_total || 0).toLocaleString('fr-FR')} MGA</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">{t('pages.totalUsers')}</div>
          <div className="stat-card__value">{data?.utilisateurs?.total || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">{t('pages.productsInCatalogue')}</div>
          <div className="stat-card__value">{data?.produits?.total || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">{t('pages.totalOrdersLabel')}</div>
          <div className="stat-card__value">{data?.commandes?.total || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">{t('pages.pendingProductsLabel')}</div>
          <div className="stat-card__value">{data?.produits?.en_attente_validation || 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div className="panel">
          <h2 className="panel-title">{t('pages.usersByRole')}</h2>
          {Object.entries(usersByRole).map(([role, count]) => (
            <div key={role} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-ligne)', fontSize: 'var(--text-sm)' }}>
              <span>{t(`roles.${role}`, role)}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>

        <div className="panel">
          <h2 className="panel-title">{t('pages.ordersByStatus')}</h2>
          {ordersByStatus.map((s) => (
            <div key={s.statut} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-ligne)', fontSize: 'var(--text-sm)' }}>
              <span>{t(`status.${s.statut}`, s.statut)}</span>
              <strong>{s.count}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 'var(--space-6)' }}>
        <h2 className="panel-title">{t('pages.topSellingProducts')}</h2>
        {data?.produits?.top_ventes?.length === 0 ? (
          <p>{t('pages.noSalesData')}</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>{t('pages.product')}</th><th>{t('pages.sales')}</th><th>{t('pages.averageRating')}</th></tr></thead>
            <tbody>
              {data?.produits?.top_ventes?.map((p) => (
                <tr key={p.id}><td>{p.nom}</td><td>{p.nombre_ventes}</td><td>{Number(p.note_moyenne).toFixed(1)} ★</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <h2 className="panel-title">{t('pages.topSuppliers')}</h2>
        {data?.top_fournisseurs?.length === 0 ? (
          <p>{t('pages.noActiveSuppliers')}</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>{t('pages.supplier')}</th><th>{t('pages.availableBalance')}</th></tr></thead>
            <tbody>
              {data?.top_fournisseurs?.map((s) => (
                <tr key={s.id}><td>{s.prenom} {s.nom}</td><td>{Number(s.solde_disponible).toLocaleString('fr-FR')} MGA</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
