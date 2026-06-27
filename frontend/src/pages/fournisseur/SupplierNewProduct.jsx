import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';

export default function SupplierNewProduct() {
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
      setError(err.response?.data?.message || 'Erreur lors de la soumission du produit.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 720, padding: 0 }}>
      <h1>Soumettre un nouveau produit</h1>
      <p style={{ color: 'var(--color-encre-soft)' }}>
        Votre produit sera examine par notre equipe avant publication. Le prix de vente final sera fixe par FITAHIANTSOA.
      </p>

      <form className="panel" style={{ marginTop: 'var(--space-5)' }} onSubmit={handleSubmit}>
        {error && <div className="alert alert--error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Nom du produit</label>
          <input className="form-input" required value={form.nom} onChange={(e) => update('nom', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Categorie</label>
            <select className="form-select" value={form.category_id} onChange={(e) => update('category_id', e.target.value)}>
              <option value="">Selectionner...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Unite</label>
            <select className="form-select" value={form.unite} onChange={(e) => update('unite', e.target.value)}>
              <option value="unite">Unite</option>
              <option value="kg">Kilogramme</option>
              <option value="sac">Sac</option>
              <option value="litre">Litre</option>
              <option value="lot">Lot</option>
              <option value="service">Service</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Prix propose (MGA)</label>
            <input type="number" min="0" step="0.01" className="form-input" required value={form.prix_propose} onChange={(e) => update('prix_propose', e.target.value)} />
            <span className="form-hint">Le prix final de vente sera fixe par l'equipe FITAHIANTSOA.</span>
          </div>
          <div className="form-group">
            <label className="form-label">Stock theorique</label>
            <input type="number" min="0" className="form-input" value={form.stock_theorique} onChange={(e) => update('stock_theorique', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Images / videos du produit</label>
          <input type="file" multiple accept="image/*,video/*" onChange={(e) => setFiles(Array.from(e.target.files))} />
          <span className="form-hint">Formats acceptes : JPEG, PNG, WEBP, MP4, WEBM (5 Mo max par fichier).</span>
        </div>

        <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
          {loading ? 'Envoi en cours...' : 'Soumettre le produit'}
        </button>
      </form>
    </div>
  );
}
