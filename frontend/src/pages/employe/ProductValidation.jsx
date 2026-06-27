import { useEffect, useState } from 'react';
import { productService } from '../../services/product.service';

export default function ProductValidation() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [prixVente, setPrixVente] = useState('');
  const [motifRefus, setMotifRefus] = useState('');
  const [mode, setMode] = useState(null); // 'validate' | 'refuse'
  const [error, setError] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    productService.listPending().then(setProducts).finally(() => setLoading(false));
  }

  function startValidate(product) {
    setActiveId(product.id);
    setMode('validate');
    setPrixVente(Math.round(parseFloat(product.prix_propose) * 1.15).toString()); // suggestion +15%
    setError(null);
  }

  function startRefuse(product) {
    setActiveId(product.id);
    setMode('refuse');
    setMotifRefus('');
    setError(null);
  }

  async function confirmValidate() {
    setError(null);
    try {
      await productService.validate(activeId, parseFloat(prixVente));
      setActiveId(null);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la validation.');
    }
  }

  async function confirmRefuse() {
    if (!motifRefus) {
      setError('Veuillez indiquer un motif de refus.');
      return;
    }
    setError(null);
    try {
      await productService.refuse(activeId, motifRefus);
      setActiveId(null);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du refus.');
    }
  }

  return (
    <div>
      <h1>Validation des produits</h1>
      <p style={{ color: 'var(--color-encre-soft)' }}>
        Examinez chaque produit soumis par les fournisseurs, fixez le prix de vente final ou refusez avec un motif.
      </p>

      <div style={{ marginTop: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {loading ? (
          <p>Chargement...</p>
        ) : products.length === 0 ? (
          <div className="empty-state panel"><div className="empty-state__icon">✅</div><p>Aucun produit en attente de validation.</p></div>
        ) : (
          products.map((p) => (
            <div className="panel" key={p.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                <div>
                  <h3 style={{ marginBottom: 'var(--space-1)' }}>{p.nom}</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-encre-soft)' }}>{p.description}</p>
                  <p style={{ fontSize: 'var(--text-sm)' }}>
                    Fournisseur : <strong>{p.fournisseur_prenom} {p.fournisseur_nom}</strong> ({p.fournisseur_email})
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)' }}>
                    Categorie : {p.categorie_nom || '—'} · Stock : {p.stock_theorique} {p.unite}
                  </p>
                  <p style={{ fontWeight: 700, color: 'var(--color-terre-dark)' }}>
                    Prix propose : {Number(p.prix_propose).toLocaleString('fr-FR')} {p.devise}
                  </p>
                </div>
                {!activeId || activeId !== p.id ? (
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
                    <button className="btn btn--secondary btn--sm" onClick={() => startValidate(p)}>Valider</button>
                    <button className="btn btn--danger btn--sm" onClick={() => startRefuse(p)}>Refuser</button>
                  </div>
                ) : null}
              </div>

              {activeId === p.id && (
                <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-ligne)', paddingTop: 'var(--space-4)' }}>
                  {error && <div className="alert alert--error">{error}</div>}

                  {mode === 'validate' && (
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
                      <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label className="form-label">Prix de vente final ({p.devise})</label>
                        <input type="number" className="form-input" value={prixVente} onChange={(e) => setPrixVente(e.target.value)} />
                      </div>
                      <button className="btn btn--secondary" onClick={confirmValidate}>Confirmer la validation</button>
                      <button className="btn btn--ghost" onClick={() => setActiveId(null)}>Annuler</button>
                    </div>
                  )}

                  {mode === 'refuse' && (
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
                      <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label className="form-label">Motif du refus</label>
                        <input className="form-input" value={motifRefus} onChange={(e) => setMotifRefus(e.target.value)} placeholder="Ex: photos manquantes, description insuffisante..." />
                      </div>
                      <button className="btn btn--danger" onClick={confirmRefuse}>Confirmer le refus</button>
                      <button className="btn btn--ghost" onClick={() => setActiveId(null)}>Annuler</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
