import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/order.service';

const PAYMENT_METHODS = [
  { value: 'mobile_money', label: 'Mobile Money (Mvola, Orange Money, Airtel Money)' },
  { value: 'carte_bancaire', label: 'Carte bancaire' },
  { value: 'virement', label: 'Virement bancaire' },
  { value: 'paypal', label: 'PayPal (international)' },
  { value: 'especes_livraison', label: 'Paiement a la livraison' },
];

export default function Checkout() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    adresse_livraison: '', ville_livraison: '', pays_livraison: 'Madagascar',
    telephone_contact: '', methode_paiement: 'mobile_money',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const order = await orderService.create(form);
      await refreshCart();
      navigate(`/client/commandes/${order.id}`, { state: { justCreated: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la creation de la commande.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 720, padding: 0 }}>
      <h1>Finaliser la commande</h1>

      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        <h2 className="panel-title">Recapitulatif</h2>
        {cart.items.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', fontSize: 'var(--text-sm)' }}>
            <span>{item.nom} × {item.quantite}</span>
            <span>{(Number(item.prix_vente) * item.quantite).toLocaleString('fr-FR')} {item.devise}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--color-ligne)', marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span>Total</span>
          <span>{cart.total.toLocaleString('fr-FR')} MGA</span>
        </div>
      </div>

      <form className="panel" style={{ marginTop: 'var(--space-5)' }} onSubmit={handleSubmit}>
        <h2 className="panel-title">Livraison</h2>
        {error && <div className="alert alert--error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Adresse de livraison</label>
          <textarea className="form-textarea" required rows={2} value={form.adresse_livraison} onChange={(e) => update('adresse_livraison', e.target.value)} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Ville</label>
            <input className="form-input" value={form.ville_livraison} onChange={(e) => update('ville_livraison', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Telephone de contact</label>
            <input className="form-input" required value={form.telephone_contact} onChange={(e) => update('telephone_contact', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Methode de paiement</label>
          <select className="form-select" value={form.methode_paiement} onChange={(e) => update('methode_paiement', e.target.value)}>
            {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <span className="form-hint">L'integration du paiement reel sera branchee dans une prochaine version.</span>
        </div>

        <button className="btn btn--primary btn--full" type="submit" disabled={loading || cart.items.length === 0}>
          {loading ? 'Validation en cours...' : 'Confirmer la commande'}
        </button>
      </form>
    </div>
  );
}
