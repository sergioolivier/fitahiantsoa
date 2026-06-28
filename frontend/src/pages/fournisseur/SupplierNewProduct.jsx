import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';

export default function SupplierNewProduct() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    nom: '', description: '', prix_propose: '', category_id: '', stock_theorique: '', unite: 'unite',
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    categoryService.list().then(setCategories);
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const product = await productService.create({
        ...form,
        prix_propose: parseFloat(form.prix_propose),
        stock_theorique: parseInt(form.stock_theorique, 10) || 0,
      });

      for (const file of files) {
        await productService.uploadMedia(product.id, file);
      }

      navigate('/fournisseur/produits');
    } catch (err) {
      setError(err.response?.data?.message || t('common.genericError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 720, padding: 0 }}>
      <h1>{t('pages.newProductTitle')}</h1>
      <p style={{ color: 'var(--color-encre-soft)' }}>
        {t('pages.newProductHint')}
      </p>

      <form className="panel" style={{ marginTop: 'var(--space-5)' }} onSubmit={handleSubmit}>
        {error && <div className="alert alert--error">{error}</div>}

        <div className="form-group">
          <label className="form-label">{t('pages.productName')}</label>
          <input className="form-input" required value={form.nom} onChange={(e) => update('nom', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">{t('pages.description')}</label>
          <textarea className="form-textarea" rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('catalogue.category')}</label>
            <select className="form-select" value={form.category_id} onChange={(e) => update('category_id', e.target.value)}>
              <option value="">{t('pages.selectPlaceholder')}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{t(`categories.${c.slug}`, c.nom)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('pages.unit')}</label>
            <select className="form-select" value={form.unite} onChange={(e) => update('unite', e.target.value)}>
              <option value="unite">{t('pages.unitPiece')}</option>
              <option value="kg">{t('pages.unitKg')}</option>
              <option value="sac">{t('pages.unitBag')}</option>
              <option value="litre">{t('pages.unitLiter')}</option>
              <option value="lot">{t('pages.unitLot')}</option>
              <option value="service">{t('pages.unitService')}</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('pages.proposedPrice')} (MGA)</label>
            <input type="number" min="0" step="0.01" className="form-input" required value={form.prix_propose} onChange={(e) => update('prix_propose', e.target.value)} />
            <span className="form-hint">{t('pages.proposedPriceHint')}</span>
          </div>
          <div className="form-group">
            <label className="form-label">{t('pages.theoreticalStock')}</label>
            <input type="number" min="0" className="form-input" value={form.stock_theorique} onChange={(e) => update('stock_theorique', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t('pages.productMedia')}</label>
          <input type="file" multiple accept="image/*,video/*" onChange={(e) => setFiles(Array.from(e.target.files))} />
          <span className="form-hint">{t('pages.productMediaHint')}</span>
        </div>

        <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
          {loading ? t('pages.submitting') : t('pages.submitProductButton')}
        </button>
      </form>
    </div>
  );
}
