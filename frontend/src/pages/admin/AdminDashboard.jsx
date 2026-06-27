import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement...</p>;

  const usersByRole = Object.fromEntries((data?.utilisateurs?.par_role || []).map((u) => [u.role, parseInt(u.count, 10)]));
  const ordersByStatus = data?.commandes?.par_statut || [];

  return (
    <div>
      <h1>Tableau de bord administrateur</h1>
      <p style={{ color: 'var(--color-encre-soft)', marginBottom: 'var(--space-6)' }}>
        Vue d'ensemble de la plateforme FITAHIANTSOA.
      </p>

      <div className="stat-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-card">
          <div className="stat-card__label">Chiffre d'affaires total</div>
          <div className="stat-card__value">{Number(data?.finances?.chiffre_affaires_total || 0).toLocaleString('fr-FR')} MGA</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Utilisateurs totaux</div>
          <div className="stat-card__value">{data?.utilisateurs?.total || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Produits en catalogue</div>
          <div className="stat-card__value">{data?.produits?.total || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Commandes totales</div>
          <div className="stat-card__value">{data?.commandes?.total || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Produits en attente</div>
          <div className="stat-card__value">{data?.produits?.en_attente_validation || 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div className="panel">
          <h2 className="panel-title">Utilisateurs par role</h2>
          {Object.entries(usersByRole).map(([role, count]) => (
            <div key={role} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-ligne)', fontSize: 'var(--text-sm)' }}>
              <span style={{ textTransform: 'capitalize' }}>{role.replace(/_/g, ' ')}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>

        <div className="panel">
          <h2 className="panel-title">Commandes par statut</h2>
          {ordersByStatus.map((s) => (
            <div key={s.statut} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-ligne)', fontSize: 'var(--text-sm)' }}>
              <span style={{ textTransform: 'capitalize' }}>{s.statut.replace(/_/g, ' ')}</span>
              <strong>{s.count}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 'var(--space-6)' }}>
        <h2 className="panel-title">Top produits les plus vendus</h2>
        {data?.produits?.top_ventes?.length === 0 ? (
          <p>Pas encore de ventes.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Produit</th><th>Ventes</th><th>Note moyenne</th></tr></thead>
            <tbody>
              {data?.produits?.top_ventes?.map((p) => (
                <tr key={p.id}><td>{p.nom}</td><td>{p.nombre_ventes}</td><td>{Number(p.note_moyenne).toFixed(1)} ★</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <h2 className="panel-title">Top fournisseurs (solde disponible)</h2>
        {data?.top_fournisseurs?.length === 0 ? (
          <p>Aucun fournisseur actif.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Fournisseur</th><th>Solde disponible</th></tr></thead>
            <tbody>
              {data?.top_fournisseurs?.map((s) => (
                <tr key={s.id}><td>{s.prenom} {s.nom}</td><td>{Number(s.solde_disponible).toLocaleString('fr-FR')} MGA</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
