import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';

const ROLES = ['client', 'fournisseur', 'employe', 'admin', 'partenaire_logistique'];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', nom: '', prenom: '', telephone: '', cin: '', role: 'employe' });
  const [error, setError] = useState(null);

  useEffect(() => {
    refresh();
  }, [filter]);

  function refresh() {
    setLoading(true);
    adminService.listUsers(filter || undefined).then(setUsers).finally(() => setLoading(false));
  }

  async function handleToggleActive(id) {
    await adminService.toggleUserActive(id);
    refresh();
  }

  async function handleRoleChange(id, role) {
    await adminService.changeUserRole(id, role);
    refresh();
  }

  async function handleCreateInternal(e) {
    e.preventDefault();
    setError(null);
    try {
      await adminService.createInternalUser(form);
      setComposing(false);
      setForm({ email: '', password: '', nom: '', prenom: '', telephone: '', cin: '', role: 'employe' });
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la creation du compte.');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1>Gestion des utilisateurs</h1>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Tous les roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
          </select>
          <button className="btn btn--primary btn--sm" onClick={() => setComposing((c) => !c)}>
            {composing ? 'Annuler' : '+ Compte employe/admin'}
          </button>
        </div>
      </div>

      {composing && (
        <form className="panel" style={{ marginTop: 'var(--space-4)' }} onSubmit={handleCreateInternal}>
          {error && <div className="alert alert--error">{error}</div>}
          <div className="form-row">
            <div className="form-group"><label className="form-label">Prenom</label><input className="form-input" required value={form.prenom} onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Nom</label><input className="form-input" required value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Mot de passe</label><input type="password" className="form-input" required minLength={8} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">CIN</label><input className="form-input" required value={form.cin} onChange={(e) => setForm((f) => ({ ...f, cin: e.target.value }))} /></div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                <option value="employe">Employe</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
          </div>
          <button className="btn btn--primary" type="submit">Creer le compte</button>
        </form>
      )}

      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        {loading ? <p>Chargement...</p> : (
          <table className="data-table">
            <thead><tr><th>Nom</th><th>Email</th><th>Role</th><th>Statut</th><th>Inscrit le</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.prenom} {u.nom}</td>
                  <td>{u.email}</td>
                  <td>
                    <select className="form-select" style={{ fontSize: 'var(--text-xs)', padding: '4px 8px' }} value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                      {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                    </select>
                  </td>
                  <td><span className={`badge ${u.est_actif ? 'badge--en_vente' : 'badge--suspendu'}`}>{u.est_actif ? 'Actif' : 'Desactive'}</span></td>
                  <td>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                  <td><button className="btn btn--ghost btn--sm" onClick={() => handleToggleActive(u.id)}>{u.est_actif ? 'Desactiver' : 'Activer'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
