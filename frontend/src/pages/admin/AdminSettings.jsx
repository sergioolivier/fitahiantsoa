export default function AdminSettings() {
  return (
    <div>
      <h1>Parametres de la plateforme</h1>
      <div className="panel" style={{ marginTop: 'var(--space-5)', maxWidth: 640 }}>
        <h2 className="panel-title">Langues et devises</h2>
        <div className="form-group">
          <label className="form-label">Langues disponibles</label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <span className="badge badge--en_vente">Francais</span>
            <span className="badge badge--en_vente">English</span>
            <span className="badge badge--en_vente">Malagasy</span>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Devise par defaut</label>
          <input className="form-input" disabled value="MGA - Ariary malgache" />
        </div>
        <p className="form-hint">
          La configuration avancee (taxes, regles commerciales, devises supplementaires) sera disponible
          via la table <code>platform_settings</code> dans une prochaine iteration du backend.
        </p>
      </div>
    </div>
  );
}
