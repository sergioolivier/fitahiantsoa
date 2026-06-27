import { useAuth } from '../../context/AuthContext';

export default function ClientSettings() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Parametres du compte</h1>
      <div className="panel" style={{ marginTop: 'var(--space-5)', maxWidth: 560 }}>
        <h2 className="panel-title">Informations personnelles</h2>
        <div className="form-group">
          <label className="form-label">Nom complet</label>
          <input className="form-input" disabled value={`${user.prenom} ${user.nom}`} />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" disabled value={user.email} />
        </div>
        <div className="form-group">
          <label className="form-label">Langue preferee</label>
          <select className="form-select" disabled defaultValue={user.langue_preferee || 'fr'}>
            <option value="fr">Francais</option>
            <option value="en">English</option>
            <option value="mg">Malagasy</option>
          </select>
        </div>
        <p className="form-hint">La modification du profil sera disponible dans une prochaine version.</p>
      </div>
    </div>
  );
}
