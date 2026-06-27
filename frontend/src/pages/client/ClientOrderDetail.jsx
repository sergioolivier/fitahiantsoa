import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { deliveryService } from '../../services/delivery.service';
import StatusBadge from '../../components/common/StatusBadge';

const ETAPES = ['confirmee', 'en_preparation', 'prise_en_charge', 'en_transit', 'livree'];

export default function ClientOrderDetail() {
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

  if (loading) return <p>Chargement...</p>;
  if (!order) return <p>Commande introuvable.</p>;

  const currentStepIndex = ETAPES.indexOf(order.statut);

  return (
    <div>
      {location.state?.justCreated && (
        <div className="alert alert--success">Votre commande a bien ete enregistree. Merci pour votre confiance !</div>
      )}

      <h1>Commande {order.numero_commande}</h1>

      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        <h2 className="panel-title">Suivi de la commande</h2>
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
              {etape.replace(/_/g, ' ')}
            </div>
          ))}
        </div>
        <p>Statut actuel : <StatusBadge status={order.statut} /></p>

        {order.livraison && (
          <div style={{ marginTop: 'var(--space-4)' }}>
            <p>Statut livraison : <StatusBadge status={order.livraison.statut} /></p>
            {order.livraison.statut === 'en_transit' && (
              <div style={{ marginTop: 'var(--space-3)' }}>
                {!code ? (
                  <button className="btn btn--secondary btn--sm" onClick={handleGenerateCode} disabled={generating}>
                    {generating ? 'Generation...' : 'Generer mon code de confirmation de reception'}
                  </button>
                ) : (
                  <div className="alert alert--success">
                    Votre code de confirmation : <strong style={{ fontSize: 'var(--text-lg)' }}>{code}</strong>
                    <br />Communiquez-le au livreur uniquement a la reception du colis.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        <h2 className="panel-title">Articles commandes</h2>
        <table className="data-table">
          <thead><tr><th>Produit</th><th>Quantite</th><th>Prix unitaire</th><th>Sous-total</th></tr></thead>
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
          Total : {Number(order.montant_total).toLocaleString('fr-FR')} {order.devise}
        </p>
      </div>

      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        <h2 className="panel-title">Livraison</h2>
        <p>{order.adresse_livraison}{order.ville_livraison ? `, ${order.ville_livraison}` : ''}</p>
        <p>Contact : {order.telephone_contact}</p>
      </div>
    </div>
  );
}
