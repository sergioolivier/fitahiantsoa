import { useEffect, useState } from 'react';
import { supplierService } from '../../services/supplier.service';

export default function SupplierSettings() {
  const [form, setForm] = useState({ nom_entreprise: '', secteur_activite: 'agriculture', description: '', numero_fiscal: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    supplierService.getDashboard().then((data) => {
      if (data.profil) {
        setForm({
          nom_entreprise: data.profil.nom_entreprise || '',
          secteur_activite: data.profil.secteur_activite || 'agriculture',
          description: data.profil.description || '',
          numero_fiscal: data.profil.numero_fiscal || '',
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await supplierService.updateProfile(form);
      setFeedback({ type: 'success', text: 'Profil mis a jour.' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la mise a jour.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      <h1>Profil entreprise</h1>
      <form className="panel" style={{ marginTop: 'var(--space-5)', maxWidth: 560 }} onSubmit={handleSubmit}>
        {feedback && <div className={`alert alert--${feedback.type}`}>{feedback.text}</div>}

        <div className="form-group">
          <label className="form-label">Nom de l'entreprise</label>
          <input className="form-input" value={form.nom_entreprise} onChange={(e) => update('nom_entreprise', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Secteur d'activite</label>
          <select className="form-select" value={form.secteur_activite} onChange={(e) => update('secteur_activite', e.target.value)}>
            <option value="agriculture">Agriculture</option>
            <option value="tourisme">Tourisme</option>
            <option value="sante">Sante</option>
            <option value="materiel_medical">Materiel medical</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Numero fiscal (optionnel)</label>
          <input className="form-input" value={form.numero_fiscal} onChange={(e) => update('numero_fiscal', e.target.value)} />
        </div>

        <button className="btn btn--primary" type="submit" disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}
