import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function PromotionManagement() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({
    titre: '', description: '', code_promo: '', type_reduction: 'pourcentage',
    valeur_reduction: '', date_debut: '', date_fin: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    api.get('/promotions/all').then((res) => setPromotions(res.data.data)).finally(() => setLoading(false));
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/promotions', { ...form, valeur_reduction: parseFloat(form.valeur_reduction) });
      setComposing(false);
      setForm({ titre: '', description: '', code_promo: '', type_reduction: 'pourcentage', valeur_reduction: '', date_debut: '', date_fin: '' });
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la creation de la promotion.');
    }
  }

  async function handleToggle(id) {
    await api.patch(`/promotions/${id}/toggle`);
    refresh();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1>Promotions & campagnes</h1>
        <button className="btn btn--primary btn--sm" onClick={() => setComposing((c) => !c)}>
          {composing ? 'Annuler' : '+ Nouvelle promotion'}
        </button>
      </div>

      {composing && (
        <form className="panel" style={{ marginTop: 'var(--space-4)' }} onSubmit={handleSubmit}>
          {error && <div className="alert alert--error">{error}</div>}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Titre</label>
              <input className="form-input" required value={form.titre} onChange={(e) => update('titre', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Code promo (optionnel)</label>
              <input className="form-input" value={form.code_promo} onChange={(e) => update('code_promo', e.target.value.toUpperCase())} placeholder="FITA2026" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={2} value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type de reduction</label>
              <select className="form-select" value={form.type_reduction} onChange={(e) => update('type_reduction', e.target.value)}>
                <option value="pourcentage">Pourcentage</option>
                <option value="montant_fixe">Montant fixe</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Valeur</label>
              <input type="number" className="form-input" required value={form.valeur_reduction} onChange={(e) => update('valeur_reduction', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date de debut</label>
              <input type="datetime-local" className="form-input" required value={form.date_debut} onChange={(e) => update('date_debut', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Date de fin</label>
              <input type="datetime-local" className="form-input" required value={form.date_fin} onChange={(e) => update('date_fin', e.target.value)} />
            </div>
          </div>
          <button className="btn btn--primary" type="submit">Creer la promotion</button>
        </form>
      )}

      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        {loading ? <p>Chargement...</p> : promotions.length === 0 ? (
          <div className="empty-state"><div className="empty-state__icon">🏷️</div><p>Aucune promotion creee.</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Titre</th><th>Code</th><th>Reduction</th><th>Periode</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {promotions.map((p) => (
                <tr key={p.id}>
                  <td>{p.titre}</td>
                  <td>{p.code_promo || '—'}</td>
                  <td>{p.valeur_reduction}{p.type_reduction === 'pourcentage' ? '%' : ' MGA'}</td>
                  <td>{new Date(p.date_debut).toLocaleDateString('fr-FR')} → {new Date(p.date_fin).toLocaleDateString('fr-FR')}</td>
                  <td><span className={`badge ${p.est_active ? 'badge--en_vente' : 'badge--suspendu'}`}>{p.est_active ? 'Active' : 'Inactive'}</span></td>
                  <td><button className="btn btn--ghost btn--sm" onClick={() => handleToggle(p.id)}>{p.est_active ? 'Desactiver' : 'Activer'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
