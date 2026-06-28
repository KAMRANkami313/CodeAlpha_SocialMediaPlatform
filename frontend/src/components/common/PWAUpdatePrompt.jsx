import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X, CheckCircle2 } from 'lucide-react';

const PWAUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(url) {
      console.log('Service Worker registered:', url);
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleClose = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="pwa-update-prompt">
      <div className="pwa-update-icon">
        {needRefresh ? <RefreshCw size={18} /> : <CheckCircle2 size={18} />}
      </div>
      <div className="pwa-update-text">
        <strong>{needRefresh ? 'New version available' : 'App ready to work offline'}</strong>
        <span>
          {needRefresh
            ? 'Refresh to get the latest features and fixes.'
            : 'Your app is now cached for offline use.'
          }
        </span>
      </div>
      <div className="pwa-update-actions">
        {needRefresh ? (
          <button className="pwa-update-btn" onClick={handleUpdate}>
            Update Now
          </button>
        ) : null}
        <button className="pwa-dismiss-btn" onClick={handleClose} aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;