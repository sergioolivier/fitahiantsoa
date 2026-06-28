import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../services/admin.service';

const ROLES = ['client', 'fournisseur', 'employe', 'admin', 'partenaire_logistique'];

export default function UserManagement() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', nom: '', prenom: '', telephone: '', cin: '',
    role: 'employe', type_personnel: 'interne', date_fin_mission: '',
  });
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

  async function handleStaffTypeChange(id, type_personnel) {
    await adminService.changeStaffType(id, type_personnel);
    refresh();
  }

  async function handleCreateInternal(e) {
    e.preventDefault();
    setError(null);
    try {
      await adminService.createInternalUser(form);
      setComposing(false);
      setForm({ email: '', password: '', nom: '', prenom: '', telephone: '', cin: '', role: 'employe', type_personnel: 'interne', date_fin_mission: '' });
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || t('common.genericError'));
    }
  }

  const employesInternes = users.filter((u) => u.role === 'employe' && u.type_personnel === 'interne').length;
  const employesExternes = users.filter((u) => u.role === 'employe' && u.type_personnel === 'externe').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1>{t('pages.userManagementTitle')}</h1>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">{t('pages.allRoles')}</option>
            {ROLES.map((r) => <option key={r} value={r}>{t(`roles.${r}`, r)}</option>)}
          </select>
          <button className="btn btn--primary btn--sm" onClick={() => setComposing((c) => !c)}>
            {composing ? t('pages.cancel') : t('pages.addStaffAccount')}
          </button>
        </div>
      </div>

      <div className="stat-grid" style={{ margin: 'var(--space-5) 0' }}>
        <div className="stat-card">
          <div className="stat-card__label">{t('pages.internalStaff')}</div>
          <div className="stat-card__value">{employesInternes}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">{t('pages.externalStaff')}</div>
          <div className="stat-card__value">{employesExternes}</div>
        </div>
      </div>

      {composing && (
        <form className="panel" style={{ marginTop: 'var(--space-4)' }} onSubmit={handleCreateInternal}>
          {error && <div className="alert alert--error">{error}</div>}
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('auth.firstName')}</label><input className="form-input" required value={form.prenom} onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">{t('auth.lastName')}</label><input className="form-input" required value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('auth.email')}</label><input type="email" className="form-input" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">{t('auth.password')}</label><input type="password" className="form-input" required minLength={8} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('auth.cin')}</label><input className="form-input" required value={form.cin} onChange={(e) => setForm((f) => ({ ...f, cin: e.target.value }))} /></div>
            <div className="form-group">
              <label className="form-label">{t('pages.role')}</label>
              <select className="form-select" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                <option value="employe">{t('roles.employe')}</option>
                <option value="admin">{t('roles.admin')}</option>
              </select>
            </div>
          </div>

          {form.role === 'employe' && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('pages.staffType')}</label>
                <select className="form-select" value={form.type_personnel} onChange={(e) => setForm((f) => ({ ...f, type_personnel: e.target.value }))}>
                  <option value="interne">{t('pages.internal')}</option>
                  <option value="externe">{t('pages.external')}</option>
                </select>
              </div>
              {form.type_personnel === 'externe' && (
                <div className="form-group">
                  <label className="form-label">{t('pages.missionEndDate')}</label>
                  <input type="date" className="form-input" value={form.date_fin_mission} onChange={(e) => setForm((f) => ({ ...f, date_fin_mission: e.target.value }))} />
                </div>
              )}
            </div>
          )}

          <button className="btn btn--primary" type="submit">{t('pages.createAccount')}</button>
        </form>
      )}

      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        {loading ? <p>{t('common.loading')}</p> : (
          <table className="data-table">
            <thead><tr><th>{t('pages.name')}</th><th>{t('pages.email')}</th><th>{t('pages.role')}</th><th>{t('pages.staffType')}</th><th>{t('pages.status')}</th><th>{t('pages.registeredOn')}</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.prenom} {u.nom}</td>
                  <td>{u.email}</td>
                  <td>
                    <select className="form-select" style={{ fontSize: 'var(--text-xs)', padding: '4px 8px' }} value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                      {ROLES.map((r) => <option key={r} value={r}>{t(`roles.${r}`, r)}</option>)}
                    </select>
                  </td>
                  <td>
                    {u.role === 'employe' ? (
                      <select
                        className="form-select"
                        style={{ fontSize: 'var(--text-xs)', padding: '4px 8px' }}
                        value={u.type_personnel || 'interne'}
                        onChange={(e) => handleStaffTypeChange(u.id, e.target.value)}
                      >
                        <option value="interne">{t('roles.employe')} — {t('pages.internalShort')}</option>
                        <option value="externe">{t('roles.employe')} — {t('pages.externalShort')}</option>
                      </select>
                    ) : (
                      <span style={{ color: 'var(--color-encre-soft)', fontSize: 'var(--text-xs)' }}>—</span>
                    )}
                  </td>
                  <td><span className={`badge ${u.est_actif ? 'badge--en_vente' : 'badge--suspendu'}`}>{u.est_actif ? t('common.active') : t('common.inactive')}</span></td>
                  <td>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                  <td><button className="btn btn--ghost btn--sm" onClick={() => handleToggleActive(u.id)}>{u.est_actif ? t('common.deactivate') : t('common.activate')}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
