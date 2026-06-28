import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AVAILABLE_LANGUAGES } from '../../i18n';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <div className="lamba-divider" />
      <div className="container site-footer__inner">
        <div className="site-footer__col">
          <h4>{t('common.appName')}</h4>
          <p>{t('footer.description')}</p>
        </div>
        <div className="site-footer__col">
          <h4>{t('footer.discover')}</h4>
          <Link to="/catalogue">{t('common.catalogue')}</Link>
          <Link to="/catalogue?category=equipements-ruraux">{t('categories.equipements-ruraux')}</Link>
          <Link to="/catalogue?category=irrigation">{t('categories.irrigation')}</Link>
          <Link to="/catalogue?category=outillage">{t('categories.outillage')}</Link>
          <Link to="/promotions">{t('common.promotions')}</Link>
        </div>
        <div className="site-footer__col">
          <h4>{t('footer.joinPlatform')}</h4>
          <Link to="/inscription?role=fournisseur">{t('nav.becomeSupplier')}</Link>
          <Link to="/inscription?role=partenaire_logistique">{t('nav.becomeLogistics')}</Link>
        </div>
        <div className="site-footer__col">
          <h4>{t('footer.languages')}</h4>
          <p>{AVAILABLE_LANGUAGES.map((l) => t(`languages.${l.code}`)).join(' · ')}</p>
        </div>
      </div>
      <div className="site-footer__bottom container">
        <span>© {new Date().getFullYear()} {t('common.appName')}. {t('footer.rights')}</span>
      </div>
    </footer>
  );
}
