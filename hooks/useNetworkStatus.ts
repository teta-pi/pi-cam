import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const check = (state: Parameters<Parameters<typeof NetInfo.addEventListener>[0]>[0]) =>
      setIsOnline(!!state.isConnected && state.isInternetReachable !== false);
    const unsub = NetInfo.addEventListener(check);
    NetInfo.fetch().then(check);
    return unsub;
  }, []);

  return isOnline;
}
