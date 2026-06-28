import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { categoryService } from '../../services/category.service';

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function CategoryManagement() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nom: '', nom_en: '', nom_mg: '', icone: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    categoryService.list().then(setCategories).finally(() => setLoading(false));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await categoryService.create({ ...form, slug: slugify(form.nom) });
      setForm({ nom: '', nom_en: '', nom_mg: '', icone: '' });
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || t('common.genericError'));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t('pages.confirmDeleteCategory'))) return;
    await categoryService.remove(id);
    refresh();
  }

  return (
    <div>
      <h1>{t('pages.categoriesTitle')}</h1>

      <form className="panel" style={{ marginTop: 'var(--space-5)', marginBottom: 'var(--space-5)' }} onSubmit={handleSubmit}>
        <h2 className="panel-title">{t('pages.addCategory')}</h2>
        {error && <div className="alert alert--error">{error}</div>}
        <div className="form-row">
          <div className="form-group"><label className="form-label">{t('pages.nameFr')}</label><input className="form-input" required value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">{t('pages.icon')}</label><input className="form-input" value={form.icone} onChange={(e) => setForm((f) => ({ ...f, icone: e.target.value }))} placeholder="🚜" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">{t('pages.nameEn')}</label><input className="form-input" value={form.nom_en} onChange={(e) => setForm((f) => ({ ...f, nom_en: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">{t('pages.nameMg')}</label><input className="form-input" value={form.nom_mg} onChange={(e) => setForm((f) => ({ ...f, nom_mg: e.target.value }))} /></div>
        </div>
        <button className="btn btn--primary" type="submit">{t('pages.add')}</button>
      </form>

      <div className="panel">
        {loading ? <p>{t('common.loading')}</p> : (
          <table className="data-table">
            <thead><tr><th>{t('pages.name')}</th><th>{t('pages.slug')}</th><th>EN</th><th>MG</th><th></th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.icone} {c.nom}</td>
                  <td>{c.slug}</td>
                  <td>{c.nom_en || '—'}</td>
                  <td>{c.nom_mg || '—'}</td>
                  <td><button className="btn btn--ghost btn--sm" onClick={() => handleDelete(c.id)}>{t('common.delete')}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
