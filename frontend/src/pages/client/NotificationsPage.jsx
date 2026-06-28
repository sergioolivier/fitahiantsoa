import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { notificationService } from '../../services/notification.service';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    notificationService.list().then((res) => setNotifications(res.data)).finally(() => setLoading(false));
  }

  async function handleMarkAllRead() {
    await notificationService.markAllAsRead();
    refresh();
  }

  async function handleMarkRead(id) {
    await notificationService.markAsRead(id);
    refresh();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1>{t('common.notifications')}</h1>
        <button className="btn btn--outline btn--sm" onClick={handleMarkAllRead}>{t('pages.markAllRead')}</button>
      </div>

      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔔</div>
            <p>{t('pages.noNotifications')}</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.est_lue && handleMarkRead(n.id)}
              style={{
                padding: 'var(--space-3) 0',
                borderBottom: '1px solid var(--color-ligne)',
                opacity: n.est_lue ? 0.6 : 1,
                cursor: n.est_lue ? 'default' : 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{n.titre}</strong>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-encre-soft)' }}>
                  {new Date(n.created_at).toLocaleString('fr-FR')}
                </span>
              </div>
              <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-sm)' }}>{n.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
