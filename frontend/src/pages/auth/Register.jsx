import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

const DASHBOARD_PATH = {
  client: '/client/tableau-de-bord',
  fournisseur: '/fournisseur/tableau-de-bord',
  partenaire_logistique: '/logistique/tableau-de-bord',
};

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const ROLE_OPTIONS = [
    { value: 'client', label: t('auth.roleClient') },
    { value: 'fournisseur', label: t('auth.roleSupplier') },
    { value: 'partenaire_logistique', label: t('auth.roleLogistics') },
  ];

  const [form, setForm] = useState({
    role: searchParams.get('role') || 'client',
    nom: '', prenom: '', email: '', password: '', telephone: '', cin: '',
    nom_entreprise: '', secteur_activite: 'equipements_ruraux', nom_societe: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      const user = await register(form);
      navigate(DASHBOARD_PATH[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || t('common.genericError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page container">
      <div className="auth-card panel auth-card--wide">
        <h1 className="panel-title">{t('auth.registerTitle')}</h1>
        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('auth.registerAs')}</label>
            <select className="form-select" value={form.role} onChange={(e) => update('role', e.target.value)}>
              {ROLE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('auth.firstName')}</label>
              <input className="form-input" required value={form.prenom} onChange={(e) => update('prenom', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.lastName')}</label>
              <input className="form-input" required value={form.nom} onChange={(e) => update('nom', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('auth.email')}</label>
              <input type="email" className="form-input" required value={form.email} onChange={(e) => update('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.phone')}</label>
              <input className="form-input" value={form.telephone} onChange={(e) => update('telephone', e.target.value)} placeholder="+261 34 12 345 67" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('auth.password')}</label>
              <input type="password" className="form-input" required minLength={8} value={form.password} onChange={(e) => update('password', e.target.value)} />
              <span className="form-hint">{t('auth.passwordHint')}</span>
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.cin')}</label>
              <input className="form-input" required value={form.cin} onChange={(e) => update('cin', e.target.value)} />
              <span className="form-hint">{t('auth.cinHint')}</span>
            </div>
          </div>

          {form.role === 'fournisseur' && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('auth.companyName')}</label>
                <input className="form-input" value={form.nom_entreprise} onChange={(e) => update('nom_entreprise', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('auth.activitySector')}</label>
                <select className="form-select" value={form.secteur_activite} onChange={(e) => update('secteur_activite', e.target.value)}>
                  <option value="equipements_ruraux">{t('categories.equipements-ruraux')}</option>
                  <option value="irrigation">{t('categories.irrigation')}</option>
                  <option value="outillage">{t('categories.outillage')}</option>
                  <option value="materiel_medical">{t('categories.materiel-medical')}</option>
                  <option value="autre">{t('categories.autres')}</option>
                </select>
              </div>
            </div>
          )}

          {form.role === 'partenaire_logistique' && (
            <div className="form-group">
              <label className="form-label">{t('auth.transportCompanyName')}</label>
              <input className="form-input" value={form.nom_societe} onChange={(e) => update('nom_societe', e.target.value)} />
            </div>
          )}

          <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
            {loading ? t('auth.creatingAccount') : t('auth.submitRegister')}
          </button>
        </form>

        <p className="auth-card__footer">
          {t('auth.alreadyAccount')} <Link to="/connexion">{t('auth.signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
