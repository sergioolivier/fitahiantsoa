import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { orderService } from '../../services/order.service';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [pendingProducts, setPendingProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([productService.listPending(), orderService.listAll()])
      .then(([products, orders]) => {
        setPendingProducts(products);
        setRecentOrders(orders.slice(0, 8));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>Bonjour {user.prenom} 👋</h1>
      <p style={{ color: 'var(--color-encre-soft)', marginBottom: 'var(--space-6)' }}>
        Voici les taches qui necessitent votre attention.
      </p>

      <div className="stat-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-card">
          <div className="stat-card__label">Produits en attente</div>
          <div className="stat-card__value">{pendingProducts.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Commandes recentes</div>
          <div className="stat-card__value">{recentOrders.length}</div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 className="panel-title">Produits a valider</h2>
          <Link to="/employe/validation-produits" className="btn btn--outline btn--sm">Voir tout</Link>
        </div>
        {loading ? <p>Chargement...</p> : pendingProducts.length === 0 ? (
          <div className="empty-state"><div className="empty-state__icon">✅</div><p>Aucun produit en attente.</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Produit</th><th>Fournisseur</th><th>Prix propose</th></tr></thead>
            <tbody>
              {pendingProducts.slice(0, 5).map((p) => (
                <tr key={p.id}>
                  <td>{p.nom}</td>
                  <td>{p.fournisseur_prenom} {p.fournisseur_nom}</td>
                  <td>{Number(p.prix_propose).toLocaleString('fr-FR')} {p.devise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <h2 className="panel-title">Commandes recentes</h2>
        {recentOrders.length === 0 ? (
          <div className="empty-state"><div className="empty-state__icon">📦</div><p>Aucune commande recente.</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Numero</th><th>Client</th><th>Montant</th><th>Statut</th></tr></thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td>{o.numero_commande}</td>
                  <td>{o.client_prenom} {o.client_nom}</td>
                  <td>{Number(o.montant_total).toLocaleString('fr-FR')} {o.devise}</td>
                  <td><StatusBadge status={o.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
