import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/order.service';

export default function Checkout() {
  const { t } = useTranslation();
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const PAYMENT_METHODS = [
    { value: 'mobile_money', label: t('pages.mobileMoneyLabel') },
    { value: 'carte_bancaire', label: t('pages.bankCardLabel') },
    { value: 'virement', label: t('pages.bankTransferLabel') },
    { value: 'paypal', label: t('pages.paypalLabel') },
    { value: 'especes_livraison', label: t('pages.cashOnDeliveryLabel') },
  ];

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
      setError(err.response?.data?.message || t('common.genericError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 720, padding: 0 }}>
      <h1>{t('pages.checkoutTitle')}</h1>

      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        <h2 className="panel-title">{t('pages.summary')}</h2>
        {cart.items.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', fontSize: 'var(--text-sm)' }}>
            <span>{item.nom} × {item.quantite}</span>
            <span>{(Number(item.prix_vente) * item.quantite).toLocaleString('fr-FR')} {item.devise}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--color-ligne)', marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span>{t('pages.total')}</span>
          <span>{cart.total.toLocaleString('fr-FR')} MGA</span>
        </div>
      </div>

      <form className="panel" style={{ marginTop: 'var(--space-5)' }} onSubmit={handleSubmit}>
        <h2 className="panel-title">{t('pages.delivery')}</h2>
        {error && <div className="alert alert--error">{error}</div>}

        <div className="form-group">
          <label className="form-label">{t('pages.deliveryAddress')}</label>
          <textarea className="form-textarea" required rows={2} value={form.adresse_livraison} onChange={(e) => update('adresse_livraison', e.target.value)} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('pages.city')}</label>
            <input className="form-input" value={form.ville_livraison} onChange={(e) => update('ville_livraison', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('pages.contactPhone')}</label>
            <input className="form-input" required value={form.telephone_contact} onChange={(e) => update('telephone_contact', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t('pages.paymentMethod')}</label>
          <select className="form-select" value={form.methode_paiement} onChange={(e) => update('methode_paiement', e.target.value)}>
            {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <span className="form-hint">{t('pages.paymentHint')}</span>
        </div>

        <button className="btn btn--primary btn--full" type="submit" disabled={loading || cart.items.length === 0}>
          {loading ? t('pages.validating') : t('pages.confirmOrder')}
        </button>
      </form>
    </div>
  );
}
