import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import StatusBadge from '../../components/common/StatusBadge';

export default function ClientOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.listMine().then(setOrders).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>Mes commandes</h1>
      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        {loading ? (
          <p>Chargement...</p>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📦</div>
            <p>Aucune commande pour le moment.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Numero</th><th>Date</th><th>Montant</th><th>Statut</th><th>Livraison</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.numero_commande}</td>
                  <td>{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>{Number(o.montant_total).toLocaleString('fr-FR')} {o.devise}</td>
                  <td><StatusBadge status={o.statut} /></td>
                  <td>{o.statut_livraison ? <StatusBadge status={o.statut_livraison} /> : '—'}</td>
                  <td><Link to={`/client/commandes/${o.id}`} className="btn btn--outline btn--sm">Voir le detail</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
