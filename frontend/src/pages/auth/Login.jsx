import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

const DASHBOARD_PATH = {
  client: '/client/tableau-de-bord',
  fournisseur: '/fournisseur/tableau-de-bord',
  employe: '/employe/tableau-de-bord',
  admin: '/admin/tableau-de-bord',
  partenaire_logistique: '/logistique/tableau-de-bord',
};

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(DASHBOARD_PATH[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || t('common.genericError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page container">
      <div className="auth-card panel">
        <h1 className="panel-title">{t('auth.loginTitle')}</h1>
        {error && <div className="alert alert--error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">{t('auth.email')}</label>
            <input id="email" type="email" className="form-input" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">{t('auth.password')}</label>
            <input id="password" type="password" className="form-input" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
            {loading ? t('auth.loggingIn') : t('auth.submitLogin')}
          </button>
        </form>
        <p className="auth-card__footer">
          {t('auth.noAccount')} <Link to="/inscription">{t('auth.signUp')}</Link>
        </p>
      </div>
    </div>
  );
}
