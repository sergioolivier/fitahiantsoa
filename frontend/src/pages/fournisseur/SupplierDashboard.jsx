import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supplierService } from '../../services/supplier.service';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';

export default function SupplierDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supplierService.getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>{t('common.loading')}</p>;

  const stats = data?.statistiques_ventes || {};
  const produitsParStatut = Object.fromEntries((data?.produits_par_statut || []).map((p) => [p.statut, parseInt(p.count, 10)]));

  return (
    <div>
      <h1>{t('pages.hello')} {user.prenom} 👋</h1>
      <p style={{ color: 'var(--color-encre-soft)', marginBottom: 'var(--space-6)' }}>
        {t('pages.dashboardOf')} {data?.profil?.nom_entreprise || t('pages.yourCompany')}.
      </p>

      <div className="stat-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-card">
          <div className="stat-card__label">{t('pages.netRevenue')}</div>
          <div className="stat-card__value">{Number(stats.revenus_nets || 0).toLocaleString('fr-FR')} MGA</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">{t('pages.availableBalance')}</div>
          <div className="stat-card__value">{Number(data?.profil?.solde_disponible || 0).toLocaleString('fr-FR')} MGA</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">{t('pages.soldLines')}</div>
          <div className="stat-card__value">{stats.nombre_lignes || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">{t('pages.pendingProducts')}</div>
          <div className="stat-card__value">{produitsParStatut.en_attente || 0}</div>
        </div>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 className="panel-title">{t('pages.recentSales')}</h2>
          <Link to="/fournisseur/produits/nouveau" className="btn btn--primary btn--sm">{t('pages.submitProduct')}</Link>
        </div>
        {data?.commandes_recentes?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">💰</div>
            <p>{t('pages.noSalesYet')}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>{t('pages.order')}</th><th>{t('pages.product')}</th><th>{t('pages.quantity')}</th><th>{t('pages.status')}</th></tr></thead>
            <tbody>
              {data?.commandes_recentes?.map((c, idx) => (
                <tr key={idx}>
                  <td>{c.numero_commande}</td>
                  <td>{c.produit_nom}</td>
                  <td>{c.quantite}</td>
                  <td><StatusBadge status={c.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
