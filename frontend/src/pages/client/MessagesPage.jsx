import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

export default function MessagesPage() {
  const { t } = useTranslation();
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [tab, setTab] = useState('inbox');
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({ recipient_id: '', sujet: '', contenu: '' });
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    Promise.all([api.get('/messages/inbox'), api.get('/messages/sent')])
      .then(([a, b]) => {
        setInbox(a.data.data);
        setSent(b.data.data);
      })
      .finally(() => setLoading(false));
  }

  async function handleSend(e) {
    e.preventDefault();
    setFeedback(null);
    try {
      await api.post('/messages', form);
      setFeedback({ type: 'success', text: t('pages.sentSuccess') });
      setForm({ recipient_id: '', sujet: '', contenu: '' });
      setComposing(false);
      refresh();
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || t('common.genericError') });
    }
  }

  const list = tab === 'inbox' ? inbox : sent;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1>{t('pages.messaging')}</h1>
        <button className="btn btn--primary btn--sm" onClick={() => setComposing((c) => !c)}>
          {composing ? t('pages.cancel') : t('pages.newMessage')}
        </button>
      </div>

      {composing && (
        <form className="panel" style={{ marginTop: 'var(--space-4)' }} onSubmit={handleSend}>
          {feedback && <div className={`alert alert--${feedback.type}`}>{feedback.text}</div>}
          <div className="form-group">
            <label className="form-label">{t('pages.recipientId')}</label>
            <input className="form-input" required value={form.recipient_id} onChange={(e) => setForm((f) => ({ ...f, recipient_id: e.target.value }))} placeholder="UUID" />
            <span className="form-hint">{t('pages.recipientIdHint')}</span>
          </div>
          <div className="form-group">
            <label className="form-label">{t('pages.subject')}</label>
            <input className="form-input" value={form.sujet} onChange={(e) => setForm((f) => ({ ...f, sujet: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('pages.messageContent')}</label>
            <textarea className="form-textarea" rows={4} required value={form.contenu} onChange={(e) => setForm((f) => ({ ...f, contenu: e.target.value }))} />
          </div>
          <button className="btn btn--primary" type="submit">{t('pages.send')}</button>
        </form>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-5)', marginBottom: 'var(--space-3)' }}>
        <button className={`btn btn--sm ${tab === 'inbox' ? 'btn--primary' : 'btn--outline'}`} onClick={() => setTab('inbox')}>{t('pages.inbox')} ({inbox.length})</button>
        <button className={`btn btn--sm ${tab === 'sent' ? 'btn--primary' : 'btn--outline'}`} onClick={() => setTab('sent')}>{t('pages.sent')} ({sent.length})</button>
      </div>

      <div className="panel">
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">✉️</div>
            <p>{t('pages.noMessages')}</p>
          </div>
        ) : (
          list.map((m) => (
            <div key={m.id} style={{ padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-ligne)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{m.sujet || '—'}</strong>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-encre-soft)' }}>{new Date(m.created_at).toLocaleString('fr-FR')}</span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-encre-soft)', margin: '2px 0' }}>
                {tab === 'inbox' ? `${t('pages.from')} : ${m.sender_prenom || ''} ${m.sender_nom || ''} (${m.sender_role || ''})` : `${t('pages.to')} : ${m.recipient_prenom || ''} ${m.recipient_nom || ''}`}
              </p>
              <p style={{ fontSize: 'var(--text-sm)', margin: 'var(--space-1) 0 0' }}>{m.contenu}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
