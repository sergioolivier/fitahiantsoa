import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supplierService } from '../../services/supplier.service';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';

export default function SupplierDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supplierService.getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement...</p>;

  const stats = data?.statistiques_ventes || {};
  const produitsParStatut = Object.fromEntries((data?.produits_par_statut || []).map((p) => [p.statut, parseInt(p.count, 10)]));

  return (
    <div>
      <h1>Bonjour {user.prenom} 👋</h1>
      <p style={{ color: 'var(--color-encre-soft)', marginBottom: 'var(--space-6)' }}>
        Tableau de bord de {data?.profil?.nom_entreprise || 'votre entreprise'}.
      </p>

      <div className="stat-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-card">
          <div className="stat-card__label">Revenus nets (apres commission)</div>
          <div className="stat-card__value">{Number(stats.revenus_nets || 0).toLocaleString('fr-FR')} MGA</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Solde disponible</div>
          <div className="stat-card__value">{Number(data?.profil?.solde_disponible || 0).toLocaleString('fr-FR')} MGA</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Lignes vendues</div>
          <div className="stat-card__value">{stats.nombre_lignes || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Produits en attente</div>
          <div className="stat-card__value">{produitsParStatut.en_attente || 0}</div>
        </div>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 className="panel-title">Ventes recentes</h2>
          <Link to="/fournisseur/produits/nouveau" className="btn btn--primary btn--sm">+ Soumettre un produit</Link>
        </div>
        {data?.commandes_recentes?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">💰</div>
            <p>Aucune vente pour le moment.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Commande</th><th>Produit</th><th>Quantite</th><th>Statut</th></tr></thead>
            <tbody>
              {data?.commandes_recentes?.map((c, idx) => (
                <tr key={idx}>
                  <td>{c.numero_commande}</td>
                  <td>{c.produit_nom}</td>
                  <td>{c.quantite}</td>
                  <td><StatusBadge status={c.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
