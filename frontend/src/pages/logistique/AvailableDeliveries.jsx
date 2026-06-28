import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deliveryService } from '../../services/delivery.service';

export default function AvailableDeliveries() {
  const { t } = useTranslation();
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
      setError(err.response?.data?.message || t('pages.missionNoLongerAvailable'));
      refresh();
    }
  }

  return (
    <div>
      <h1>{t('pages.availableMissionsTitle')}</h1>
      {error && <div className="alert alert--error" style={{ marginTop: 'var(--space-3)' }}>{error}</div>}

      <div style={{ marginTop: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : deliveries.length === 0 ? (
          <div className="empty-state panel"><div className="empty-state__icon">📋</div><p>{t('pages.noMissionsAvailable')}</p></div>
        ) : (
          deliveries.map((d) => (
            <div className="panel" key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{d.numero_commande}</strong>
                <p style={{ fontSize: 'var(--text-sm)', margin: '4px 0' }}>{d.adresse_livraison}{d.ville_livraison ? `, ${d.ville_livraison}` : ''}</p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-encre-soft)' }}>{t('pages.phoneLabel')} : {d.telephone_contact} · {t('pages.amountLabel')} : {Number(d.montant_total).toLocaleString('fr-FR')} MGA</p>
              </div>
              <button className="btn btn--secondary" onClick={() => handleAccept(d.id)}>{t('pages.acceptMission')}</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
