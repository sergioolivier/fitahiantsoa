import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export default function ClientSettings() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div>
      <h1>{t('pages.accountSettings')}</h1>
      <div className="panel" style={{ marginTop: 'var(--space-5)', maxWidth: 560 }}>
        <h2 className="panel-title">{t('pages.personalInfo')}</h2>
        <div className="form-group">
          <label className="form-label">{t('pages.fullName')}</label>
          <input className="form-input" disabled value={`${user.prenom} ${user.nom}`} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('auth.email')}</label>
          <input className="form-input" disabled value={user.email} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('pages.preferredLanguage')}</label>
          <select className="form-select" disabled defaultValue={user.langue_preferee || 'fr'}>
            <option value="fr">Francais</option>
            <option value="en">English</option>
            <option value="mg">Malagasy</option>
          </select>
        </div>
        <p className="form-hint">{t('pages.profileEditHint')}</p>
      </div>
    </div>
  );
}
