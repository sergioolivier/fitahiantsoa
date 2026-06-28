import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deliveryService } from '../../services/delivery.service';
import StatusBadge from '../../components/common/StatusBadge';

export default function DeliveryHistory() {
  const { t } = useTranslation();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    deliveryService.listMine().then((all) => setDeliveries(all.filter((d) => ['livree', 'echouee'].includes(d.statut)))).finally(() => setLoading(false));
  }, []);

  const totalRevenu = deliveries.filter((d) => d.statut === 'livree').reduce((s, d) => s + parseFloat(d.montant_total || 0) * 0.05, 0);

  return (
    <div>
      <h1>{t('pages.deliveryHistoryTitle')}</h1>

      <div className="stat-grid" style={{ margin: 'var(--space-5) 0 var(--space-8)' }}>
        <div className="stat-card">
          <div className="stat-card__label">{t('pages.completedDeliveries')}</div>
          <div className="stat-card__value">{deliveries.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">{t('pages.estimatedRevenue')}</div>
          <div className="stat-card__value">{totalRevenu.toLocaleString('fr-FR')} MGA</div>
        </div>
      </div>

      <div className="panel">
        {loading ? <p>{t('common.loading')}</p> : deliveries.length === 0 ? (
          <div className="empty-state"><div className="empty-state__icon">🕓</div><p>{t('pages.noHistoryYet')}</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>{t('pages.order')}</th><th>{t('pages.deliveryDate')}</th><th>{t('pages.status')}</th><th>{t('pages.amount')}</th></tr></thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id}>
                  <td>{d.numero_commande}</td>
                  <td>{d.date_livraison ? new Date(d.date_livraison).toLocaleDateString('fr-FR') : '—'}</td>
                  <td><StatusBadge status={d.statut} /></td>
                  <td>{Number(d.montant_total).toLocaleString('fr-FR')} MGA</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
