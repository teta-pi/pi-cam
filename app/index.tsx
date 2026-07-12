import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import SplashScreen from './splash';
import { keypairExists } from '@/modules/crypto';

export default function Index() {
  const [status, setStatus] = useState<'initializing' | 'generating-key' | 'error'>('initializing');

  useEffect(() => {
    async function init() {
      try {
        const hasKey = await keypairExists();
        if (hasKey) {
          router.replace('/(tabs)/camera');
        } else {
          router.replace('/onboarding');
        }
      } catch {
        setStatus('error');
      }
    }
    const timer = setTimeout(init, 1200);
    return () => clearTimeout(timer);
  }, []);

  return <SplashScreen status={status} />;
}
