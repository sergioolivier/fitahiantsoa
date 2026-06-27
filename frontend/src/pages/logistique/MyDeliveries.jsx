import { useEffect, useState } from 'react';
import { deliveryService } from '../../services/delivery.service';
import StatusBadge from '../../components/common/StatusBadge';

const NEXT_STATUS = { acceptee: 'ramassage', ramassage: 'en_transit', en_transit: 'livree' };
const NEXT_LABEL = { acceptee: 'Marquer comme ramasse', ramassage: 'Marquer en transit', en_transit: 'Confirmer la livraison' };

export default function MyDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [codeInputs, setCodeInputs] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    deliveryService.listMine().then((all) => setDeliveries(all.filter((d) => !['livree', 'echouee'].includes(d.statut)))).finally(() => setLoading(false));
  }

  async function handleAdvance(delivery) {
    setError(null);
    const nextStatus = NEXT_STATUS[delivery.statut];
    if (!nextStatus) return;

    if (nextStatus === 'livree') {
      const code = codeInputs[delivery.id];
      if (!code) {
        setError('Demandez le code de confirmation au client avant de valider la livraison.');
        return;
      }
      try {
        await deliveryService.updateStatus(delivery.id, 'livree', code);
        refresh();
      } catch (err) {
        setError(err.response?.data?.message || 'Code de confirmation invalide.');
      }
      return;
    }

    await deliveryService.updateStatus(delivery.id, nextStatus);
    refresh();
  }

  async function handleRefuse(id) {
    if (!window.confirm('Refuser cette mission ? Elle redeviendra disponible pour d\'autres partenaires.')) return;
    await deliveryService.refuse(id);
    refresh();
  }

  return (
    <div>
      <h1>Mes livraisons en cours</h1>
      {error && <div className="alert alert--error" style={{ marginTop: 'var(--space-3)' }}>{error}</div>}

      <div style={{ marginTop: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {loading ? (
          <p>Chargement...</p>
        ) : deliveries.length === 0 ? (
          <div className="empty-state panel"><div className="empty-state__icon">🚚</div><p>Aucune livraison en cours.</p></div>
        ) : (
          deliveries.map((d) => (
            <div className="panel" key={d.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong>{d.numero_commande}</strong> <StatusBadge status={d.statut} />
                  <p style={{ fontSize: 'var(--text-sm)', margin: '4px 0' }}>{d.adresse_livraison}{d.ville_livraison ? `, ${d.ville_livraison}` : ''}</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-encre-soft)' }}>Tel : {d.telephone_contact} · {Number(d.montant_total).toLocaleString('fr-FR')} MGA</p>
                </div>
                <button className="btn btn--ghost btn--sm" onClick={() => handleRefuse(d.id)}>Refuser la mission</button>
              </div>

              {d.statut === 'en_transit' && (
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)', alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Code de confirmation du client</label>
                    <input className="form-input" style={{ width: 140 }} value={codeInputs[d.id] || ''} onChange={(e) => setCodeInputs((c) => ({ ...c, [d.id]: e.target.value.toUpperCase() }))} />
                  </div>
                </div>
              )}

              {NEXT_STATUS[d.statut] && (
                <button className="btn btn--secondary" style={{ marginTop: 'var(--space-3)' }} onClick={() => handleAdvance(d)}>
                  {NEXT_LABEL[d.statut]}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
