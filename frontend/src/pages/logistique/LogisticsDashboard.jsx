import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deliveryService } from '../../services/delivery.service';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';

export default function LogisticsDashboard() {
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
  const revenusEstimes = mine.filter((d) => d.statut === 'livree').reduce((s, d) => s + parseFloat(d.montant_total || 0) * 0.05, 0);

  return (
    <div>
      <h1>Bonjour {user.prenom} 👋</h1>
      <p style={{ color: 'var(--color-encre-soft)', marginBottom: 'var(--space-6)' }}>
        Voici les missions de livraison disponibles et en cours.
      </p>

      <div className="stat-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-card"><div className="stat-card__label">Missions disponibles</div><div className="stat-card__value">{available.length}</div></div>
        <div className="stat-card"><div className="stat-card__label">Mes livraisons en cours</div><div className="stat-card__value">{enCours.length}</div></div>
        <div className="stat-card"><div className="stat-card__label">Livraisons terminees</div><div className="stat-card__value">{mine.filter((d) => d.statut === 'livree').length}</div></div>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 className="panel-title">Missions disponibles</h2>
          <Link to="/logistique/disponibles" className="btn btn--outline btn--sm">Voir tout</Link>
        </div>
        {loading ? <p>Chargement...</p> : available.length === 0 ? (
          <div className="empty-state"><div className="empty-state__icon">📋</div><p>Aucune mission disponible pour le moment.</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Commande</th><th>Adresse</th><th>Montant</th></tr></thead>
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
