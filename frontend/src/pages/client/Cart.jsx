import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function Cart() {
  const { cart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🛒</div>
        <p>Votre panier est vide.</p>
        <Link to="/catalogue" className="btn btn--primary" style={{ marginTop: 'var(--space-3)' }}>Parcourir le catalogue</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Mon panier</h1>
      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        <table className="data-table">
          <thead>
            <tr><th>Produit</th><th>Prix unitaire</th><th>Quantite</th><th>Sous-total</th><th></th></tr>
          </thead>
          <tbody>
            {cart.items.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link to={`/produits/${item.product_id}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    {item.image && <img src={item.image} alt="" width="48" height="48" style={{ borderRadius: 6, objectFit: 'cover' }} />}
                    {item.nom}
                  </Link>
                </td>
                <td>{Number(item.prix_vente).toLocaleString('fr-FR')} {item.devise}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    style={{ width: 70 }}
                    value={item.quantite}
                    onChange={(e) => updateItem(item.id, Math.max(1, parseInt(e.target.value, 10) || 1))}
                  />
                </td>
                <td>{(Number(item.prix_vente) * item.quantite).toLocaleString('fr-FR')} {item.devise}</td>
                <td><button className="btn btn--ghost btn--sm" onClick={() => removeItem(item.id)}>Retirer</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--space-5)', marginTop: 'var(--space-5)' }}>
          <strong style={{ fontSize: 'var(--text-xl)' }}>Total : {cart.total.toLocaleString('fr-FR')} MGA</strong>
          <button className="btn btn--primary" onClick={() => navigate('/client/commander')}>Passer la commande</button>
        </div>
      </div>
    </div>
  );
}
