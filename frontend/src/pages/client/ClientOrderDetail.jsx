import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { orderService } from '../../services/order.service';
import { deliveryService } from '../../services/delivery.service';
import StatusBadge from '../../components/common/StatusBadge';

const ETAPES = ['confirmee', 'en_preparation', 'prise_en_charge', 'en_transit', 'livree'];

export default function ClientOrderDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    orderService.getOne(id).then(setOrder).finally(() => setLoading(false));
  }, [id]);

  async function handleGenerateCode() {
    setGenerating(true);
    try {
      const result = await deliveryService.generateCode(id);
      setCode(result.code_confirmation);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <p>{t('common.loading')}</p>;
  if (!order) return <p>{t('pages.noOrders')}</p>;

  const currentStepIndex = ETAPES.indexOf(order.statut);

  return (
    <div>
      {location.state?.justCreated && (
        <div className="alert alert--success">{t('pages.orderCreatedSuccess')}</div>
      )}

      <h1>{t('pages.orderTitle')} {order.numero_commande}</h1>

      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        <h2 className="panel-title">{t('pages.orderTracking')}</h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          {ETAPES.map((etape, idx) => (
            <div
              key={etape}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 'var(--text-xs)',
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                background: idx <= currentStepIndex ? 'var(--color-riziere)' : 'var(--color-riz-deep)',
                color: idx <= currentStepIndex ? 'var(--color-blanc)' : 'var(--color-encre-soft)',
                fontWeight: 600,
              }}
            >
              {t(`status.${etape}`)}
            </div>
          ))}
        </div>
        <p>{t('pages.currentStatus')} : <StatusBadge status={order.statut} /></p>

        {order.livraison && (
          <div style={{ marginTop: 'var(--space-4)' }}>
            <p>{t('pages.deliveryStatus')} : <StatusBadge status={order.livraison.statut} /></p>
            {order.livraison.statut === 'en_transit' && (
              <div style={{ marginTop: 'var(--space-3)' }}>
                {!code ? (
                  <button className="btn btn--secondary btn--sm" onClick={handleGenerateCode} disabled={generating}>
                    {generating ? t('pages.generating') : t('pages.generateConfirmationCode')}
                  </button>
                ) : (
                  <div className="alert alert--success">
                    {t('pages.yourConfirmationCode')} : <strong style={{ fontSize: 'var(--text-lg)' }}>{code}</strong>
                    <br />{t('pages.shareCodeHint')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        <h2 className="panel-title">{t('pages.orderedItems')}</h2>
        <table className="data-table">
          <thead><tr><th>{t('pages.product')}</th><th>{t('cart.quantity')}</th><th>{t('pages.unitPrice')}</th><th>{t('pages.subtotal')}</th></tr></thead>
          <tbody>
            {order.items?.map((item) => (
              <tr key={item.id}>
                <td>{item.produit_nom}</td>
                <td>{item.quantite}</td>
                <td>{Number(item.prix_unitaire).toLocaleString('fr-FR')} MGA</td>
                <td>{(Number(item.prix_unitaire) * item.quantite).toLocaleString('fr-FR')} MGA</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ textAlign: 'right', marginTop: 'var(--space-3)', fontWeight: 700 }}>
          {t('pages.total')} : {Number(order.montant_total).toLocaleString('fr-FR')} {order.devise}
        </p>
      </div>

      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        <h2 className="panel-title">{t('pages.deliveryInfo')}</h2>
        <p>{order.adresse_livraison}{order.ville_livraison ? `, ${order.ville_livraison}` : ''}</p>
        <p>{t('pages.contact')} : {order.telephone_contact}</p>
      </div>
    </div>
  );
}
