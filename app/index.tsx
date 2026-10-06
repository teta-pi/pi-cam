import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import SplashScreen from './splash';
import { keypairExists, deleteKeyPair, isLegacyKeyFormat } from '@/modules/crypto';
import { clearLocalAccountOnly } from '@/modules/account';

export default function Index() {
  const [status, setStatus] = useState<'initializing' | 'generating-key' | 'error'>('initializing');

  useEffect(() => {
    async function init() {
      try {
        const hasKey = await keypairExists();
        if (!hasKey) {
          router.replace('/onboarding');
          return;
        }

        // 14.12: a key generated before the real-ECDSA migration was never
        // a usable key — regenerate it and send the user through onboarding
        // again with an honest explanation, instead of letting every
        // sign/upload keep silently failing.
        if (await isLegacyKeyFormat()) {
          await deleteKeyPair();
          await clearLocalAccountOnly();
          router.replace({ pathname: '/onboarding', params: { migrated: '1' } });
          return;
        }

        router.replace('/(tabs)/camera');
      } catch {
        setStatus('error');
      }
    }
    const timer = setTimeout(init, 1200);
    return () => clearTimeout(timer);
  }, []);

  return <SplashScreen status={status} />;
}
