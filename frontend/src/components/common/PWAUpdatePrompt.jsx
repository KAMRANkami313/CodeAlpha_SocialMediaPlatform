import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

const PWAUpdatePrompt = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    const handleControllerChange = () => {
      window.location.reload();
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      const checkForUpdate = async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setWaitingWorker(newWorker);
                  setShowUpdate(true);
                }
              });
            }
          });
        }
      };

      checkForUpdate();

      const interval = setInterval(checkForUpdate, 60000);

      return () => {
        navigator.serviceWorker.removeEventListener('controllerChange', handleControllerChange);
        clearInterval(interval);
      };
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdate(false);
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="pwa-update-prompt">
      <div className="pwa-update-icon">
        <RefreshCw size={18} />
      </div>
      <div className="pwa-update-text">
        <strong>New version available</strong>
        <span>Refresh to get the latest features and fixes.</span>
      </div>
      <div className="pwa-update-actions">
        <button className="pwa-update-btn" onClick={handleUpdate}>
          Update Now
        </button>
        <button className="pwa-dismiss-btn" onClick={handleDismiss} aria-label="Dismiss update">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;