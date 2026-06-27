import { useEffect, useState } from 'react';
import { deliveryService } from '../../services/delivery.service';
import StatusBadge from '../../components/common/StatusBadge';

export default function DeliveryHistory() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    deliveryService.listMine().then((all) => setDeliveries(all.filter((d) => ['livree', 'echouee'].includes(d.statut)))).finally(() => setLoading(false));
  }, []);

  const totalRevenu = deliveries.filter((d) => d.statut === 'livree').reduce((s, d) => s + parseFloat(d.montant_total || 0) * 0.05, 0);

  return (
    <div>
      <h1>Historique des livraisons</h1>

      <div className="stat-grid" style={{ margin: 'var(--space-5) 0 var(--space-8)' }}>
        <div className="stat-card">
          <div className="stat-card__label">Livraisons terminees</div>
          <div className="stat-card__value">{deliveries.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Revenus estimes (5%)</div>
          <div className="stat-card__value">{totalRevenu.toLocaleString('fr-FR')} MGA</div>
        </div>
      </div>

      <div className="panel">
        {loading ? <p>Chargement...</p> : deliveries.length === 0 ? (
          <div className="empty-state"><div className="empty-state__icon">🕓</div><p>Aucun historique pour le moment.</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Commande</th><th>Date de livraison</th><th>Statut</th><th>Montant</th></tr></thead>
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
