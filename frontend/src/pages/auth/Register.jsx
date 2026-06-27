import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

const DASHBOARD_PATH = {
  client: '/client/tableau-de-bord',
  fournisseur: '/fournisseur/tableau-de-bord',
  partenaire_logistique: '/logistique/tableau-de-bord',
};

const ROLE_OPTIONS = [
  { value: 'client', label: 'Client - je veux acheter des produits' },
  { value: 'fournisseur', label: 'Fournisseur - je veux vendre mes produits' },
  { value: 'partenaire_logistique', label: 'Partenaire logistique - je veux effectuer des livraisons' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    role: searchParams.get('role') || 'client',
    nom: '', prenom: '', email: '', password: '', telephone: '', cin: '',
    nom_entreprise: '', secteur_activite: 'agriculture', nom_societe: '',
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
      setError('Le mot de passe doit contenir au moins 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const user = await register(form);
      navigate(DASHBOARD_PATH[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription. Veuillez reessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page container">
      <div className="auth-card panel auth-card--wide">
        <h1 className="panel-title">Creer un compte</h1>
        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Je m'inscris en tant que</label>
            <select className="form-select" value={form.role} onChange={(e) => update('role', e.target.value)}>
              {ROLE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Prenom</label>
              <input className="form-input" required value={form.prenom} onChange={(e) => update('prenom', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Nom</label>
              <input className="form-input" required value={form.nom} onChange={(e) => update('nom', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" required value={form.email} onChange={(e) => update('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Telephone</label>
              <input className="form-input" value={form.telephone} onChange={(e) => update('telephone', e.target.value)} placeholder="+261 34 12 345 67" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input type="password" className="form-input" required minLength={8} value={form.password} onChange={(e) => update('password', e.target.value)} />
              <span className="form-hint">8 caracteres minimum.</span>
            </div>
            <div className="form-group">
              <label className="form-label">Numero CIN</label>
              <input className="form-input" required value={form.cin} onChange={(e) => update('cin', e.target.value)} placeholder="Carte d'identite nationale" />
              <span className="form-hint">Obligatoire pour la securite de la plateforme.</span>
            </div>
          </div>

          {form.role === 'fournisseur' && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nom de l'entreprise</label>
                <input className="form-input" value={form.nom_entreprise} onChange={(e) => update('nom_entreprise', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Secteur d'activite</label>
                <select className="form-select" value={form.secteur_activite} onChange={(e) => update('secteur_activite', e.target.value)}>
                  <option value="agriculture">Agriculture</option>
                  <option value="tourisme">Tourisme</option>
                  <option value="sante">Sante</option>
                  <option value="materiel_medical">Materiel medical</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>
          )}

          {form.role === 'partenaire_logistique' && (
            <div className="form-group">
              <label className="form-label">Nom de la societe de transport</label>
              <input className="form-input" value={form.nom_societe} onChange={(e) => update('nom_societe', e.target.value)} />
            </div>
          )}

          <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
            {loading ? 'Creation du compte...' : 'Creer mon compte'}
          </button>
        </form>

        <p className="auth-card__footer">
          Deja un compte ? <Link to="/connexion">Connectez-vous</Link>
        </p>
      </div>
    </div>
  );
}
