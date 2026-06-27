import { useEffect, useState } from 'react';
import { supplierService } from '../../services/supplier.service';
import StatusBadge from '../../components/common/StatusBadge';

export default function SupplierSales() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supplierService.getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement...</p>;

  const stats = data?.statistiques_ventes || {};

  return (
    <div>
      <h1>Ventes & revenus</h1>

      <div className="stat-grid" style={{ margin: 'var(--space-5) 0 var(--space-8)' }}>
        <div className="stat-card">
          <div className="stat-card__label">Chiffre d'affaires brut</div>
          <div className="stat-card__value">{Number(stats.chiffre_affaires || 0).toLocaleString('fr-FR')} MGA</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Revenus nets</div>
          <div className="stat-card__value">{Number(stats.revenus_nets || 0).toLocaleString('fr-FR')} MGA</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Solde disponible</div>
          <div className="stat-card__value">{Number(data?.profil?.solde_disponible || 0).toLocaleString('fr-FR')} MGA</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Taux de commission</div>
          <div className="stat-card__value">{data?.profil?.commission_taux || 15}%</div>
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">Historique des ventes</h2>
        {data?.commandes_recentes?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">💰</div>
            <p>Aucune vente enregistree.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Commande</th><th>Date</th><th>Produit</th><th>Quantite</th><th>Prix unitaire</th><th>Statut</th></tr></thead>
            <tbody>
              {data?.commandes_recentes?.map((c, idx) => (
                <tr key={idx}>
                  <td>{c.numero_commande}</td>
                  <td>{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>{c.produit_nom}</td>
                  <td>{c.quantite}</td>
                  <td>{Number(c.prix_unitaire).toLocaleString('fr-FR')} MGA</td>
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
