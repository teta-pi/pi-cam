import { useState, useEffect, useCallback } from 'react';
import { keypairExists, generateKeypair, getPublicKey, deleteKeyPair, isLegacyKeyFormat } from '@/modules/crypto';
import { clearLocalAccountOnly } from '@/modules/account';
import type { KeyInfo } from '@/modules/crypto/types';

type State =
  | { status: 'loading' }
  | { status: 'ready'; keyInfo: KeyInfo }
  | { status: 'missing'; migrated?: boolean }
  | { status: 'error'; message: string };

export function useDeviceKey() {
  const [state, setState] = useState<State>({ status: 'loading' });

  const check = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const exists = await keypairExists();
      if (!exists) {
        setState({ status: 'missing' });
        return;
      }

      // 14.12: keys generated before the real-ECDSA migration were a SHA-256
      // hash wrapped in a fake PEM header, not a usable key — any backend
      // registration made with one was never valid either. Wipe both so the
      // user re-generates a real key and re-links, instead of silently
      // failing every sign/upload forever.
      if (await isLegacyKeyFormat()) {
        await deleteKeyPair();
        await clearLocalAccountOnly();
        setState({ status: 'missing', migrated: true });
        return;
      }

      const keyInfo = await getPublicKey();
      setState(keyInfo ? { status: 'ready', keyInfo } : { status: 'missing' });
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
