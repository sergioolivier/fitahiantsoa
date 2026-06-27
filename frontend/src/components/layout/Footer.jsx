import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="lamba-divider" />
      <div className="container site-footer__inner">
        <div className="site-footer__col">
          <h4>FITAHIANTSOA</h4>
          <p>Plateforme malgache de commerce et d'intermediation pour l'agriculture, le tourisme et la sante.</p>
        </div>
        <div className="site-footer__col">
          <h4>Decouvrir</h4>
          <Link to="/catalogue">Catalogue</Link>
          <Link to="/catalogue?category=agriculture">Agriculture</Link>
          <Link to="/catalogue?category=tourisme">Tourisme</Link>
          <Link to="/promotions">Promotions</Link>
        </div>
        <div className="site-footer__col">
          <h4>Rejoindre la plateforme</h4>
          <Link to="/inscription?role=fournisseur">Devenir fournisseur</Link>
          <Link to="/inscription?role=partenaire_logistique">Devenir partenaire logistique</Link>
        </div>
        <div className="site-footer__col">
          <h4>Langues</h4>
          <p>Francais · English · Malagasy</p>
        </div>
      </div>
      <div className="site-footer__bottom container">
        <span>© {new Date().getFullYear()} FITAHIANTSOA. Tous droits reserves.</span>
      </div>
    </footer>
  );
}
