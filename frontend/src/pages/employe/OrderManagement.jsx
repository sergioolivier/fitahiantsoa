import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import StatusBadge from '../../components/common/StatusBadge';

const STATUTS = ['en_attente', 'confirmee', 'en_preparation', 'prise_en_charge', 'en_transit', 'livree', 'annulee', 'remboursee'];

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refresh();
  }, [filter]);

  function refresh() {
    setLoading(true);
    orderService.listAll(filter || undefined).then(setOrders).finally(() => setLoading(false));
  }

  async function handleStatusChange(id, statut) {
    await orderService.updateStatus(id, statut);
    refresh();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1>Gestion des commandes</h1>
        <select className="form-select" style={{ width: 220 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        {loading ? (
          <p>Chargement...</p>
        ) : orders.length === 0 ? (
          <div className="empty-state"><div className="empty-state__icon">📦</div><p>Aucune commande trouvee.</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Numero</th><th>Client</th><th>Date</th><th>Montant</th><th>Statut</th><th>Action</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><Link to={`/employe/commandes/${o.id}`}>{o.numero_commande}</Link></td>
                  <td>{o.client_prenom} {o.client_nom}<br /><small style={{ color: 'var(--color-encre-soft)' }}>{o.client_telephone}</small></td>
                  <td>{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>{Number(o.montant_total).toLocaleString('fr-FR')} {o.devise}</td>
                  <td><StatusBadge status={o.statut} /></td>
                  <td>
                    <select className="form-select" style={{ fontSize: 'var(--text-xs)', padding: '4px 8px' }} value={o.statut} onChange={(e) => handleStatusChange(o.id, e.target.value)}>
                      {STATUTS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
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
