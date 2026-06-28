import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { productService } from '../../services/product.service';

export default function ProductValidation() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [prixVente, setPrixVente] = useState('');
  const [motifRefus, setMotifRefus] = useState('');
  const [mode, setMode] = useState(null);
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
    setPrixVente(Math.round(parseFloat(product.prix_propose) * 1.15).toString());
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
      setError(err.response?.data?.message || t('common.genericError'));
    }
  }

  async function confirmRefuse() {
    if (!motifRefus) {
      setError(t('pages.rejectionReason'));
      return;
    }
    setError(null);
    try {
      await productService.refuse(activeId, motifRefus);
      setActiveId(null);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || t('common.genericError'));
    }
  }

  return (
    <div>
      <h1>{t('pages.productValidationTitle')}</h1>
      <p style={{ color: 'var(--color-encre-soft)' }}>
        {t('pages.productValidationHint')}
      </p>

      <div style={{ marginTop: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : products.length === 0 ? (
          <div className="empty-state panel"><div className="empty-state__icon">✅</div><p>{t('pages.noProductsPending')}</p></div>
        ) : (
          products.map((p) => (
            <div className="panel" key={p.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                <div>
                  <h3 style={{ marginBottom: 'var(--space-1)' }}>{p.nom}</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-encre-soft)' }}>{p.description}</p>
                  <p style={{ fontSize: 'var(--text-sm)' }}>
                    {t('pages.supplier')} : <strong>{p.fournisseur_prenom} {p.fournisseur_nom}</strong> ({p.fournisseur_email})
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)' }}>
                    {t('pages.category')} : {p.categorie_slug ? t(`categories.${p.categorie_slug}`, p.categorie_nom) : (p.categorie_nom || '—')} · Stock : {p.stock_theorique} {p.unite}
                  </p>
                  <p style={{ fontWeight: 700, color: 'var(--color-terre-dark)' }}>
                    {t('pages.proposedPrice')} : {Number(p.prix_propose).toLocaleString('fr-FR')} {p.devise}
                  </p>
                </div>
                {!activeId || activeId !== p.id ? (
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
                    <button className="btn btn--secondary btn--sm" onClick={() => startValidate(p)}>{t('pages.validate')}</button>
                    <button className="btn btn--danger btn--sm" onClick={() => startRefuse(p)}>{t('pages.reject')}</button>
                  </div>
                ) : null}
              </div>

              {activeId === p.id && (
                <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-ligne)', paddingTop: 'var(--space-4)' }}>
                  {error && <div className="alert alert--error">{error}</div>}

                  {mode === 'validate' && (
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
                      <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label className="form-label">{t('pages.finalSalePrice')} ({p.devise})</label>
                        <input type="number" className="form-input" value={prixVente} onChange={(e) => setPrixVente(e.target.value)} />
                      </div>
                      <button className="btn btn--secondary" onClick={confirmValidate}>{t('pages.confirmValidation')}</button>
                      <button className="btn btn--ghost" onClick={() => setActiveId(null)}>{t('pages.cancel')}</button>
                    </div>
                  )}

                  {mode === 'refuse' && (
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
                      <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label className="form-label">{t('pages.rejectionReason')}</label>
                        <input className="form-input" value={motifRefus} onChange={(e) => setMotifRefus(e.target.value)} placeholder={t('pages.rejectionPlaceholder')} />
                      </div>
                      <button className="btn btn--danger" onClick={confirmRefuse}>{t('pages.confirmRejection')}</button>
                      <button className="btn btn--ghost" onClick={() => setActiveId(null)}>{t('pages.cancel')}</button>
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
