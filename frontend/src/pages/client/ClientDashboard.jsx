import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { orderService } from '../../services/order.service';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';

export default function ClientDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.listMine().then(setOrders).finally(() => setLoading(false));
  }, []);

  const enCours = orders.filter((o) => !['livree', 'annulee', 'remboursee'].includes(o.statut));

  return (
    <div>
      <h1>{t('pages.hello')} {user.prenom} 👋</h1>
      <p style={{ color: 'var(--color-encre-soft)', marginBottom: 'var(--space-6)' }}>
        {t('pages.clientSummary')}
      </p>

      <div className="stat-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-card">
          <div className="stat-card__label">{t('pages.totalOrders')}</div>
          <div className="stat-card__value">{orders.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">{t('pages.ongoingOrders')}</div>
          <div className="stat-card__value">{enCours.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">{t('pages.totalSpent')}</div>
          <div className="stat-card__value">
            {orders.reduce((s, o) => s + parseFloat(o.montant_total), 0).toLocaleString('fr-FR')} MGA
          </div>
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">{t('pages.recentOrders')}</h2>
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📦</div>
            <p>{t('pages.noOrdersYet')}</p>
            <Link to="/catalogue" className="btn btn--primary" style={{ marginTop: 'var(--space-3)' }}>{t('pages.discoverCatalogue')}</Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>{t('pages.orderNumber')}</th><th>{t('pages.date')}</th><th>{t('pages.amount')}</th><th>{t('pages.status')}</th></tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((o) => (
                <tr key={o.id}>
                  <td>{o.numero_commande}</td>
                  <td>{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>{Number(o.montant_total).toLocaleString('fr-FR')} {o.devise}</td>
                  <td><StatusBadge status={o.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
