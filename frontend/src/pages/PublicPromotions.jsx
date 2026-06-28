import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function PublicPromotions() {
  const { t } = useTranslation();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/promotions').then((res) => setPromotions(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ padding: 'var(--space-8) var(--space-6) var(--space-12)' }}>
      <h1>{t('pages.activePromotionsTitle')}</h1>
      {loading ? (
        <p>{t('common.loading')}</p>
      ) : promotions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🏷️</div>
          <p>{t('pages.noActivePromotions')}</p>
          <Link to="/catalogue" className="btn btn--primary" style={{ marginTop: 'var(--space-3)' }}>{t('pages.viewCatalogue')}</Link>
        </div>
      ) : (
        <div className="grid-products" style={{ marginTop: 'var(--space-6)' }}>
          {promotions.map((p) => (
            <div className="panel" key={p.id}>
              <h3>{p.titre}</h3>
              <p style={{ color: 'var(--color-encre-soft)', fontSize: 'var(--text-sm)' }}>{p.description}</p>
              <p style={{ fontWeight: 700, color: 'var(--color-terre-dark)', fontSize: 'var(--text-lg)', margin: 'var(--space-3) 0' }}>
                -{p.valeur_reduction}{p.type_reduction === 'pourcentage' ? '%' : ' MGA'}
              </p>
              {p.code_promo && <p style={{ fontSize: 'var(--text-sm)' }}>{t('pages.code')} : <strong>{p.code_promo}</strong></p>}
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-encre-soft)' }}>
                {t('pages.validUntil')} {new Date(p.date_fin).toLocaleDateString('fr-FR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
