import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/product.service';
import StatusBadge from '../../components/common/StatusBadge';

export default function SupplierProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    productService.listMine().then(setProducts).finally(() => setLoading(false));
  }

  async function handleDelete(id) {
    if (!window.confirm('Retirer definitivement ce produit ?')) return;
    await productService.remove(id);
    refresh();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1>Mes produits</h1>
        <Link to="/fournisseur/produits/nouveau" className="btn btn--primary btn--sm">+ Soumettre un produit</Link>
      </div>

      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        {loading ? (
          <p>Chargement...</p>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📦</div>
            <p>Vous n'avez soumis aucun produit pour le moment.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Produit</th><th>Categorie</th><th>Prix propose</th><th>Prix de vente</th><th>Statut</th><th>Ventes</th><th></th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.nom}</td>
                  <td>{p.categorie_nom || '—'}</td>
                  <td>{Number(p.prix_propose).toLocaleString('fr-FR')} {p.devise}</td>
                  <td>{p.prix_vente ? `${Number(p.prix_vente).toLocaleString('fr-FR')} ${p.devise}` : '—'}</td>
                  <td>
                    <StatusBadge status={p.statut} />
                    {p.statut === 'refuse' && p.motif_refus && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-erreur)', marginTop: 4 }}>{p.motif_refus}</p>
                    )}
                  </td>
                  <td>{p.nombre_ventes}</td>
                  <td>
                    {['en_attente', 'refuse'].includes(p.statut) && (
                      <button className="btn btn--ghost btn--sm" onClick={() => handleDelete(p.id)}>Retirer</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
