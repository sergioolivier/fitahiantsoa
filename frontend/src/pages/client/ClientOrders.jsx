import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { orderService } from '../../services/order.service';
import StatusBadge from '../../components/common/StatusBadge';

export default function ClientOrders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.listMine().then(setOrders).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>{t('pages.myOrders')}</h1>
      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📦</div>
            <p>{t('pages.noOrders')}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>{t('pages.orderNumber')}</th><th>{t('pages.date')}</th><th>{t('pages.amount')}</th><th>{t('pages.status')}</th><th>{t('pages.delivery')}</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.numero_commande}</td>
                  <td>{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>{Number(o.montant_total).toLocaleString('fr-FR')} {o.devise}</td>
                  <td><StatusBadge status={o.statut} /></td>
                  <td>{o.statut_livraison ? <StatusBadge status={o.statut_livraison} /> : '—'}</td>
                  <td><Link to={`/client/commandes/${o.id}`} className="btn btn--outline btn--sm">{t('pages.viewDetails')}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
