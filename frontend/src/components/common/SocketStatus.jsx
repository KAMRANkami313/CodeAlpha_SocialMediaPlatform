import { useContext } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { Loader2, Wifi, WifiOff } from 'lucide-react';

const SocketStatus = () => {
  const { isConnected, isReconnecting } = useContext(SocketContext);

  if (isConnected && !isReconnecting) return null;

  return (
    <div className={`socket-status ${isReconnecting ? 'reconnecting' : 'disconnected'}`}>
      {isReconnecting ? (
        <>
          <Loader2 size={14} className="spin" />
          <span>Reconnecting to server…</span>
        </>
      ) : (
        <>
          <WifiOff size={14} />
          <span>Connection lost</span>
        </>
      )}
    </div>
  );
};

export default SocketStatus;