import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/tokens';
import { useTheme } from '@/context/ThemeContext';
import { CloseIcon, ShieldCheckIcon } from '@/components/ui/Icons';
import { registerWithQR } from '@/modules/account';
import { getPublicKeyPem } from '@/modules/crypto/keystore';

type ScanState = 'scanning' | 'processing' | 'success' | 'error';

export default function LinkAccountScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<ScanState>('scanning');
  const [entityName, setEntityName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [scanned, setScanned] = useState(false);
  const processingRef = React.useRef(false);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  const handleBarCode = async ({ data }: { data: string }) => {
    if (scanned || state !== 'scanning' || processingRef.current) return;
    processingRef.current = true;
    setScanned(true);
    setState('processing');

    try {
      const publicKeyPem = await getPublicKeyPem();
      if (!publicKeyPem) throw new Error('No device key found');

      // Device fingerprint: hash of public key (stable identifier)
      const fingerprint = publicKeyPem.replace(/\s/g, '').slice(-32);

      const account = await registerWithQR(data, publicKeyPem, fingerprint);
      setEntityName(account.entityName);
      setState('success');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Unknown error');
      setState('error');
    }
  };

  const reset = () => { setScanned(false); setState('scanning'); setErrorMsg(''); };

  if (!permission?.granted) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.navy, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: '#fff', marginBottom: 16 }}>Camera access required to scan QR</Text>
        <Pressable onPress={requestPermission} style={[styles.btn, { backgroundColor: Colors.purple }]}>
          <Text style={styles.btnText}>Grant Access</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.navy }]}>
      {/* Nav */}
      <View style={[styles.nav, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.navBtn}>
          <CloseIcon size={24} color="#fff" />
        </Pressable>
        <Text style={styles.navTitle}>Link to TETA+PI</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Camera / State */}
      {state === 'scanning' && (
        <>
          <View style={styles.scanArea}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              onBarcodeScanned={handleBarCode}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            />
            {/* Finder overlay */}
            <View style={styles.finder} pointerEvents="none">
              <View style={[styles.finderCorner, styles.tl]} />
              <View style={[styles.finderCorner, styles.tr]} />
              <View style={[styles.finderCorner, styles.bl]} />
              <View style={[styles.finderCorner, styles.br]} />
            </View>
          </View>
          <View style={styles.hint}>
            <Text style={styles.hintText}>
              Відкрий TETA+PI → профіль → "Connect Pi CAM"
            </Text>
            <Text style={styles.hintSub}>та відскануй QR код</Text>
          </View>
        </>
      )}

      {state === 'processing' && (
        <View style={styles.stateBox}>
          <ShieldCheckIcon size={56} color={Colors.purple} />
          <Text style={styles.stateTitle}>Linking device…</Text>
          <Text style={styles.stateSub}>Verifying with TETA+PI server</Text>
        </View>
      )}

      {state === 'success' && (
        <View style={styles.stateBox}>
          <View style={[styles.iconWrap, { backgroundColor: Colors.verified }]}>
            <ShieldCheckIcon size={44} color="#fff" />
          </View>
          <Text style={styles.stateTitle}>Linked!</Text>
          <Text style={styles.stateSub}>Camera is connected to</Text>
          <Text style={[styles.entityName]}>{entityName}</Text>
          <Pressable
            onPress={() => router.replace('/(tabs)/camera')}
            style={[styles.btn, { backgroundColor: Colors.verified, marginTop: 24 }]}
          >
            <Text style={styles.btnText}>Start Capturing</Text>
          </Pressable>
        </View>
      )}

      {state === 'error' && (
        <View style={styles.stateBox}>
          <View style={[styles.iconWrap, { backgroundColor: Colors.alert }]}>
            <ShieldCheckIcon size={44} color="#fff" />
          </View>
          <Text style={styles.stateTitle}>Could not link</Text>
          <Text style={[styles.stateSub, { color: Colors.alert }]}>{errorMsg}</Text>
          <Pressable onPress={reset} style={[styles.btn, { backgroundColor: Colors.purple, marginTop: 24 }]}>
            <Text style={styles.btnText}>Try Again</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={{ marginTop: 12, padding: 8 }}>
            <Text style={{ color: Colors.purpleLt, fontWeight: '500' }}>Cancel</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const CORNER = 20;
const BORDER = 3;

const styles = StyleSheet.create({
  container: { flex: 1 },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  navBtn: { padding: 8 },
  navTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  scanArea: {
    marginHorizontal: 24, borderRadius: 16, overflow: 'hidden',
    aspectRatio: 1, position: 'relative',
  },
  finder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
  },
  finderCorner: {
    position: 'absolute', width: CORNER, height: CORNER, borderColor: Colors.purple,
  },
  tl: { top: 16, left: 16, borderTopWidth: BORDER, borderLeftWidth: BORDER },
  tr: { top: 16, right: 16, borderTopWidth: BORDER, borderRightWidth: BORDER },
  bl: { bottom: 16, left: 16, borderBottomWidth: BORDER, borderLeftWidth: BORDER },
  br: { bottom: 16, right: 16, borderBottomWidth: BORDER, borderRightWidth: BORDER },
  hint: { alignItems: 'center', paddingTop: 28, paddingHorizontal: 32 },
  hintText: { color: '#fff', fontSize: 15, fontWeight: '500', textAlign: 'center' },
  hintSub: { color: Colors.purpleLt, fontSize: 13, marginTop: 6 },
  stateBox: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  iconWrap: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  stateTitle: { fontSize: 24, fontWeight: '700', color: '#fff', marginTop: 16 },
  stateSub: { fontSize: 14, color: Colors.purpleLt, marginTop: 8, textAlign: 'center' },
  entityName: {
    fontSize: 18, fontWeight: '700', color: Colors.verified,
    marginTop: 8, textAlign: 'center',
  },
  btn: {
    height: 52, paddingHorizontal: 32, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
