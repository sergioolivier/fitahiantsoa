import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { deliveryService } from '../../services/delivery.service';
import { useAuth } from '../../context/AuthContext';

export default function LogisticsDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [available, setAvailable] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([deliveryService.listAvailable(), deliveryService.listMine()])
      .then(([a, m]) => { setAvailable(a); setMine(m); })
      .finally(() => setLoading(false));
  }, []);

  const enCours = mine.filter((d) => !['livree', 'echouee'].includes(d.statut));

  return (
    <div>
      <h1>{t('pages.hello')} {user.prenom} 👋</h1>
      <p style={{ color: 'var(--color-encre-soft)', marginBottom: 'var(--space-6)' }}>
        {t('pages.logisticsTasksHint')}
      </p>

      <div className="stat-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-card"><div className="stat-card__label">{t('pages.availableMissionsLabel')}</div><div className="stat-card__value">{available.length}</div></div>
        <div className="stat-card"><div className="stat-card__label">{t('pages.myOngoingDeliveries')}</div><div className="stat-card__value">{enCours.length}</div></div>
        <div className="stat-card"><div className="stat-card__label">{t('pages.completedDeliveries')}</div><div className="stat-card__value">{mine.filter((d) => d.statut === 'livree').length}</div></div>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 className="panel-title">{t('pages.availableMissionsLabel')}</h2>
          <Link to="/logistique/disponibles" className="btn btn--outline btn--sm">{t('pages.viewAll')}</Link>
        </div>
        {loading ? <p>{t('common.loading')}</p> : available.length === 0 ? (
          <div className="empty-state"><div className="empty-state__icon">📋</div><p>{t('pages.noMissionsAvailable')}</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>{t('pages.order')}</th><th>{t('pages.address')}</th><th>{t('pages.amount')}</th></tr></thead>
            <tbody>
              {available.slice(0, 5).map((d) => (
                <tr key={d.id}><td>{d.numero_commande}</td><td>{d.adresse_livraison}</td><td>{Number(d.montant_total).toLocaleString('fr-FR')} MGA</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
