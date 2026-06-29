import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supplierService } from '../../services/supplier.service';

export default function SupplierSettings() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ nom_entreprise: '', secteur_activite: 'equipements_ruraux', description: '', numero_fiscal: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    supplierService.getDashboard().then((data) => {
      if (data.profil) {
        setForm({
          nom_entreprise: data.profil.nom_entreprise || '',
          secteur_activite: data.profil.secteur_activite || 'equipements_ruraux',
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
      setFeedback({ type: 'success', text: t('pages.profileUpdated') });
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || t('common.genericError') });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>{t('common.loading')}</p>;

  return (
    <div>
      <h1>{t('pages.companyProfile')}</h1>
      <form className="panel" style={{ marginTop: 'var(--space-5)', maxWidth: 560 }} onSubmit={handleSubmit}>
        {feedback && <div className={`alert alert--${feedback.type}`}>{feedback.text}</div>}

        <div className="form-group">
          <label className="form-label">{t('pages.companyName')}</label>
          <input className="form-input" value={form.nom_entreprise} onChange={(e) => update('nom_entreprise', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">{t('pages.activitySector')}</label>
          <select className="form-select" value={form.secteur_activite} onChange={(e) => update('secteur_activite', e.target.value)}>
            <option value="equipements_ruraux">{t('categories.equipements-ruraux')}</option>
            <option value="irrigation">{t('categories.irrigation')}</option>
            <option value="outillage">{t('categories.outillage')}</option>
            <option value="materiel_medical">{t('categories.materiel-medical')}</option>
            <option value="tourisme">{t('categories.tourisme')}</option>
            <option value="autre">{t('categories.autres')}</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">{t('pages.description')}</label>
          <textarea className="form-textarea" rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">{t('pages.taxNumber')}</label>
          <input className="form-input" value={form.numero_fiscal} onChange={(e) => update('numero_fiscal', e.target.value)} />
        </div>

        <button className="btn btn--primary" type="submit" disabled={saving}>
          {saving ? t('pages.saving') : t('pages.save')}
        </button>
      </form>
    </div>
  );
}
