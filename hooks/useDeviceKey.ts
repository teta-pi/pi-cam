import { useState, useEffect, useCallback } from 'react';
import { keypairExists, generateKeypair, getPublicKey, deleteKeyPair } from '@/modules/crypto';
import type { KeyInfo } from '@/modules/crypto/types';

type State =
  | { status: 'loading' }
  | { status: 'ready'; keyInfo: KeyInfo }
  | { status: 'missing' }
  | { status: 'error'; message: string };

export function useDeviceKey() {
  const [state, setState] = useState<State>({ status: 'loading' });

  const check = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const exists = await keypairExists();
      if (exists) {
        const keyInfo = await getPublicKey();
        setState(keyInfo ? { status: 'ready', keyInfo } : { status: 'missing' });
      } else {
        setState({ status: 'missing' });
      }
    } catch (e) {
      setState({ status: 'error', message: String(e) });
    }
  }, []);

  const generate = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const keyInfo = await generateKeypair();
      setState({ status: 'ready', keyInfo });
      return keyInfo;
    } catch (e) {
      setState({ status: 'error', message: String(e) });
      return null;
    }
  }, []);

  const reset = useCallback(async () => {
    await deleteKeyPair();
    setState({ status: 'missing' });
  }, []);

  useEffect(() => { check(); }, [check]);

  return { state, generate, reset, refresh: check };
}
