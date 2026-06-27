import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function PublicPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/promotions').then((res) => setPromotions(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ padding: 'var(--space-8) var(--space-6) var(--space-12)' }}>
      <h1>Promotions en cours</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : promotions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🏷️</div>
          <p>Aucune promotion active pour le moment. Revenez bientot !</p>
          <Link to="/catalogue" className="btn btn--primary" style={{ marginTop: 'var(--space-3)' }}>Voir le catalogue</Link>
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
              {p.code_promo && <p style={{ fontSize: 'var(--text-sm)' }}>Code : <strong>{p.code_promo}</strong></p>}
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-encre-soft)' }}>
                Valable jusqu'au {new Date(p.date_fin).toLocaleDateString('fr-FR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
