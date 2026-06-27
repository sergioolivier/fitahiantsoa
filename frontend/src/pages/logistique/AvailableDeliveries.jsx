import { useEffect, useState } from 'react';
import { deliveryService } from '../../services/delivery.service';

export default function AvailableDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    deliveryService.listAvailable().then(setDeliveries).finally(() => setLoading(false));
  }

  async function handleAccept(id) {
    setError(null);
    try {
      await deliveryService.accept(id);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Cette mission n\'est plus disponible.');
      refresh();
    }
  }

  return (
    <div>
      <h1>Missions disponibles</h1>
      {error && <div className="alert alert--error" style={{ marginTop: 'var(--space-3)' }}>{error}</div>}

      <div style={{ marginTop: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {loading ? (
          <p>Chargement...</p>
        ) : deliveries.length === 0 ? (
          <div className="empty-state panel"><div className="empty-state__icon">📋</div><p>Aucune mission disponible pour le moment.</p></div>
        ) : (
          deliveries.map((d) => (
            <div className="panel" key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{d.numero_commande}</strong>
                <p style={{ fontSize: 'var(--text-sm)', margin: '4px 0' }}>{d.adresse_livraison}{d.ville_livraison ? `, ${d.ville_livraison}` : ''}</p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-encre-soft)' }}>Tel : {d.telephone_contact} · Montant : {Number(d.montant_total).toLocaleString('fr-FR')} MGA</p>
              </div>
              <button className="btn btn--secondary" onClick={() => handleAccept(d.id)}>Accepter la mission</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
