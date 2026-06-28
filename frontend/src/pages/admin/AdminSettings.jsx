import { useTranslation } from 'react-i18next';
import { AVAILABLE_LANGUAGES } from '../../i18n';

export default function AdminSettings() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('pages.platformSettingsTitle')}</h1>
      <div className="panel" style={{ marginTop: 'var(--space-5)', maxWidth: 640 }}>
        <h2 className="panel-title">{t('pages.languagesAndCurrencies')}</h2>
        <div className="form-group">
          <label className="form-label">{t('pages.availableLanguages')}</label>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {AVAILABLE_LANGUAGES.map((l) => (
              <span className="badge badge--en_vente" key={l.code}>{l.flag} {t(`languages.${l.code}`)}</span>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{t('pages.defaultCurrency')}</label>
          <input className="form-input" disabled value="MGA - Ariary malgache" />
        </div>
        <p className="form-hint">
          {t('pages.advancedConfigHint')}
        </p>
      </div>
    </div>
  );
}
