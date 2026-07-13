import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, Platform, Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  withDelay, withSequence,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/tokens';
import { useTheme } from '@/context/ThemeContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import VerificationBadge from '@/components/VerificationBadge';
import ShutterButton from '@/components/ShutterButton';
import CamControl from '@/components/CamControl';
import PillToggle from '@/components/PillToggle';
import SigningToast, { ToastPhase } from '@/components/SigningToast';
import PiMark from '@/components/PiMark';
import HashStream from '@/components/HashStream';
import {
  ZapIcon, ZapOffIcon, FlipIcon, SettingsIcon,
} from '@/components/ui/Icons';
import { Image as RNImage } from 'react-native';
import { signMedia, indexTrustedAsset } from '@/modules/c2pa';
import type { C2PAManifest } from '@/modules/c2pa/types';
import { getLinkedAccount, uploadMedia as uploadToTetaPi } from '@/modules/account';
import { getPublicKey } from '@/modules/crypto';
import { getCertInfo } from '@/modules/certificate';
import WatermarkComposer, { WatermarkRef } from '@/components/WatermarkComposer';
import { File, Directory, Paths } from 'expo-file-system';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { readSettings, type AppSettings } from '@/hooks/useSettings';

type HudVariant = 'classic' | 'minimal' | 'cinematic';
type CaptureVariant = 'hash' | 'ring' | 'stamp';

// ── Capture FX ───────────────────────────────────────────────────────────────

function FlashOverlay({ visible }: { visible: boolean }) {
  const opacity = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  React.useEffect(() => {
    if (visible) {
      opacity.value = withSequence(
        withTiming(0.9, { duration: 30 }),
        withTiming(0, { duration: 220 })
      );
    }
  }, [visible]);

  return <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#fff', zIndex: 19 }, style]} pointerEvents="none" />;
}

function HashFX({ active }: { active: boolean }) {
  const CHARS = '0123456789abcdef';
  const opacity = useSharedValue(0);
  const aStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const chars = React.useRef(
    Array.from({ length: 28 }, () => ({
      left: `${10 + Math.random() * 80}%`,
      top: `${50 + Math.random() * 35}%`,
      fontSize: 12 + Math.random() * 6,
      char: CHARS[Math.floor(Math.random() * 16)],
      op: 0.5 + Math.random() * 0.5,
    }))
  ).current;

  React.useEffect(() => {
    if (active) {
      opacity.value = withSequence(
        withTiming(1, { duration: 60 }),
        withDelay(700, withTiming(0, { duration: 500 }))
      );
    } else {
      opacity.value = 0;
    }
  }, [active]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 18 }, aStyle]} pointerEvents="none">
      {chars.map((c, i) => (
        <Text key={i} style={{
          position: 'absolute', left: c.left as any, top: c.top as any,
          color: Colors.purple, fontFamily: 'Menlo',
          fontSize: c.fontSize, fontWeight: '700', opacity: c.op,
        }}>
          {c.char}
        </Text>
      ))}
    </Animated.View>
  );
}

// ── HUD Components ────────────────────────────────────────────────────────────

function ClassicHUD({ online, certActive, flash, setFlash, openSettings, zoomLabel, onZoom }: {
  online: boolean; certActive: boolean; flash: boolean; setFlash: (v: boolean) => void;
  openSettings: () => void; zoomLabel: string; onZoom: () => void;
}) {
  const verified = online && certActive;
  return (
    <>
      <View style={hud.topBar}>
        <CamControl onPress={() => setFlash(!flash)} label="Toggle flash">
          {flash
            ? <ZapIcon size={22} color={Colors.device} fill={Colors.device} />
            : <ZapOffIcon size={22} color="#fff" />}
        </CamControl>
        <VerificationBadge status={verified ? 'ca' : 'device'} size="sm"
          label={verified ? 'Pi Verified' : online ? 'Device Signed' : 'Offline'} />
        <CamControl onPress={openSettings} label="Settings">
          <SettingsIcon size={20} color="#fff" />
        </CamControl>
      </View>
      <Pressable onPress={onZoom} style={hud.zoomPill}>
        <Text style={hud.zoomText}>{zoomLabel}</Text>
      </Pressable>
    </>
  );
}

function MinimalHUD({ online, flash, setFlash, openSettings }: {
  online: boolean; flash: boolean; setFlash: (v: boolean) => void; openSettings: () => void;
}) {
  return (
    <>
      <View style={hud.minimalTop}>
        <View style={[hud.minimalPill, { borderColor: `${online ? Colors.verified : Colors.device}66` }]}>
          <PiMark size={22} color={Colors.purple} />
          <Text style={[hud.minimalStatus, { color: online ? '#7EE2A8' : '#FDD17A' }]}>
            {'● ' + (online ? 'PI VERIFIED' : 'DEVICE ONLY')}
          </Text>
        </View>
      </View>
      <View style={hud.sideRail}>
        <CamControl onPress={() => setFlash(!flash)} label="Toggle flash">
          {flash ? <ZapIcon size={20} color={Colors.device} /> : <ZapOffIcon size={20} color="#fff" />}
        </CamControl>
        <CamControl onPress={openSettings} label="Settings">
          <SettingsIcon size={18} color="#fff" />
        </CamControl>
      </View>
    </>
  );
}

function CinematicHUD({ online, flash, setFlash, openSettings, keyShort }: {
  online: boolean; flash: boolean; setFlash: (v: boolean) => void;
  openSettings: () => void; keyShort: string;
}) {
  return (
    <>
      <View style={hud.cinemaTop} />
      <View style={hud.cinemaBottom} />
      <View style={hud.cinemaBar}>
        <Pressable onPress={() => setFlash(!flash)} style={hud.cinemaBtn}>
          {flash ? <ZapIcon size={16} color={Colors.device} /> : <ZapOffIcon size={16} color="#fff" />}
          <Text style={hud.cinemaBtnText}>FLASH {flash ? 'ON' : 'OFF'}</Text>
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={hud.cinemaStatus}>{online ? '● REC READY' : '● OFFLINE'}</Text>
          <Text style={hud.cinemaKey}>KEY {keyShort}</Text>
        </View>
        <Pressable onPress={openSettings} style={hud.cinemaBtn}>
          <SettingsIcon size={16} color="#fff" />
          <Text style={hud.cinemaBtnText}>SETUP</Text>
        </Pressable>
      </View>
      <View style={hud.cinemaStrip}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={[hud.dot, { backgroundColor: online ? Colors.verified : Colors.device }]} />
          <Text style={[hud.cinemaChip, { color: online ? '#7EE2A8' : '#FDD17A' }]}>
            {online ? 'PI CA · READY' : 'OFFLINE · DEVICE ONLY'}
          </Text>
        </View>
        <View style={{ flex: 1, marginHorizontal: 16, overflow: 'hidden' }}>
          <HashStream speed={28} color="rgba(108,99,255,0.55)" />
        </View>
        <Text style={hud.sha}>SHA-256</Text>
      </View>
    </>
  );
}

// ── Main Camera Screen ────────────────────────────────────────────────────────

export default function CameraScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const isOnline = useNetworkStatus();
  const cameraRef = useRef<CameraView>(null);
  const watermarkRef = useRef<WatermarkRef>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState(false);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [recording, setRecording] = useState(false);
  const [zoom, setZoom] = useState(0);
  const ZOOM_STEPS = [0, 0.1, 0.25];
  const ZOOM_LABELS = ['1×', '2×', '3×'];
  const zoomIdx = ZOOM_STEPS.indexOf(zoom);
  const cycleZoom = () => setZoom(ZOOM_STEPS[(zoomIdx + 1) % ZOOM_STEPS.length]);
  const [recSeconds, setRecSeconds] = useState(0);
  const [toast, setToast] = useState<ToastPhase | null>(null);
  const [flashFX, setFlashFX] = useState(false);
  const [lastPhotoUri, setLastPhotoUri] = useState<string | null>(null);
  const [keyShort, setKeyShort] = useState('····');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const coordsRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const [certActive, setCertActive] = useState(false);
  const isCapturing = useRef(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    location: false, watermark: true, autoCa: true, savePhotos: true,
  });

  const [hudVariant] = useState<HudVariant>('classic');

  React.useEffect(() => { coordsRef.current = coords; }, [coords]);

  React.useEffect(() => {
    getPublicKey().then((k) => { if (k) setKeyShort(k.publicKeyShort); });
    getCertInfo().then((c) => setCertActive(c.status === 'active'));
  }, []);

  // Re-read settings every time the camera tab is focused
  useFocusEffect(React.useCallback(() => {
    readSettings().then(setAppSettings).catch(() => {});
  }, []));

  // Silently read GPS if already permitted — no permission dialog on mount
  React.useEffect(() => {
    Location.getForegroundPermissionsAsync().then(({ status }) => {
      if (status !== 'granted') return;
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        .then((loc) => {
          const c = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setCoords(c);
          coordsRef.current = c;
        })
        .catch(() => {});
    });
  }, []);

  React.useEffect(() => {
    if (!permission?.granted) requestPermission();
    if (!micPermission?.granted) requestMicPermission();
    if (!mediaPermission?.granted) requestMediaPermission();
  }, []);

  // Recording timer
  React.useEffect(() => {
    if (!recording) { setRecSeconds(0); return; }
    const iv = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [recording]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // Splice a c2pa.producer assertion (linking the public TETA+PI profile — GTM
  // C2PA loop) onto a signed manifest, then upload. Shared by photo and video
  // capture; no-ops silently if no account is linked or the entity has no slug
  // yet (e.g. unpublished).
  const attachProducerAndUpload = useCallback((fileUri: string, mimeType: string, manifest: C2PAManifest) => {
    getLinkedAccount().then((acct) => {
      if (!acct) return;
      const producerUrl = acct.entitySlug ? `https://app.tetapi.dev/e/${acct.entitySlug}` : undefined;
      const manifestToUpload = { ...manifest };
      if (producerUrl && !manifestToUpload.assertions.some((a) => a.label === 'c2pa.producer')) {
        manifestToUpload.assertions = [
          ...manifestToUpload.assertions,
          {
            label: 'c2pa.producer',
            data: {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              'schema:url': producerUrl,
              'schema:identifier': producerUrl,
            },
          },
        ];
      }
      uploadToTetaPi(fileUri, mimeType, JSON.stringify(manifestToUpload), new Date().toISOString()).catch(() => {});
    }).catch(() => {});
  }, []);

  const runSigningToast = useCallback((online: boolean) => {
    setToast('signing');
    setTimeout(() => setToast('signed'), 700);
    if (online) {
      setTimeout(() => setToast('certifying'), 1700);
      setTimeout(() => setToast('verified'), 3000);
    }
    setTimeout(() => setToast(null), 4500);
  }, []);

  const onShutter = useCallback(async () => {
    if (mode === 'video') {
      if (recording) {
        cameraRef.current?.stopRecording();
        setRecording(false);
      } else {
        setRecording(true);
        cameraRef.current?.recordAsync().then(async (result) => {
          setRecording(false);
          if (!result?.uri) return;
          runSigningToast(isOnline);

          let assetId: string | null = null;
          if (mediaPermission?.granted) {
            try {
              const asset = await MediaLibrary.createAssetAsync(result.uri);
              assetId = asset.id;
            } catch {}
          }

          // Sign + upload, same as photo capture — closes the proof-of-process
          // use case (video verification), not just proof-of-creation.
          try {
            const ts = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '');
            const signed = await signMedia(result.uri, {
              filename: `PICAM_${ts}_${Platform.OS === 'ios' ? 'iOS' : 'Android'}.mp4`,
              format: 'video/mp4',
              device: Platform.OS === 'ios' ? 'iPhone' : 'Android',
              gpsEnabled: coordsRef.current !== null,
              latitude: coordsRef.current?.latitude,
              longitude: coordsRef.current?.longitude,
              appVersion: '1.0.0',
            });

            if (assetId) {
              const trustLevel: 'ca' | 'device' = (isOnline && certActive) ? 'ca' : 'device';
              await indexTrustedAsset(assetId, trustLevel, signed.contentHash);
            }

            if (isOnline) attachProducerAndUpload(result.uri, 'video/mp4', signed.manifest);
          } catch { /* signing failed — video already saved to gallery */ }
        });
      }
      return;
    }

    if (isCapturing.current) return;
    isCapturing.current = true;

    // Snapshot settings at capture time
    const settings = await readSettings().catch(() => ({
      location: false, watermark: true, autoCa: true, savePhotos: true,
    }));

    let stablePath: string | null = null;
    let stableOwned = false; // true = we created it, safe to delete
    let markedPath: string | null = null;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setFlashFX(true);
      setTimeout(() => setFlashFX(false), 300);

      // Ensure gallery permission upfront (only if auto-save is ON)
      let savePerm = mediaPermission;
      if (settings.savePhotos && !savePerm?.granted) savePerm = await requestMediaPermission();

      const photo = await cameraRef.current?.takePictureAsync({ quality: 1 });
      if (!photo?.uri) return;

      runSigningToast(isOnline);

      // ── Copy to stable path ───────────────────────────────────────────────────
      const capturesDir = new Directory(Paths.document, 'captures');
      if (!capturesDir.exists) capturesDir.create({ intermediates: true });
      const stableFile = new File(capturesDir, `picam_${Date.now()}.jpg`);
      try {
        new File(photo.uri).copy(stableFile);
        stablePath = stableFile.uri;
        stableOwned = true;
      } catch {
        stablePath = photo.uri;
        stableOwned = false;
      }
      setLastPhotoUri(stablePath); // Point thumbnail at stable file

      // ── Apply watermark badge before saving to gallery ────────────────────────
      let saveUri = stablePath;
      if (settings.savePhotos && watermarkRef.current) {
        try {
          markedPath = await watermarkRef.current.apply(stablePath);
          saveUri = markedPath;
        } catch { /* no watermark, save clean */ }
      }

      // ── Step 1: Save to gallery (only if toggle is ON) ───────────────────────
      let assetId: string | null = null;
      if (settings.savePhotos && savePerm?.granted) {
        try {
          const asset = await MediaLibrary.createAssetAsync(saveUri);
          assetId = asset.id;
        } catch {
          try { await MediaLibrary.saveToLibraryAsync(saveUri); } catch {}
        }
      }

      // ── Step 2: GPS — only if "Include Location" is ON in Settings ──────────
      let captureCoords: { latitude: number; longitude: number } | null = null;
      if (settings.location) {
        captureCoords = coordsRef.current;
        if (!captureCoords) {
          try {
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status === 'granted') {
              const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
              captureCoords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
              setCoords(captureCoords);
              coordsRef.current = captureCoords;
            }
          } catch {}
        }
      }

      // ── Step 3: Sign original (stablePath, not watermarked) ─────────────────
      try {
        const ts = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '');
        const signed = await signMedia(stablePath, {
          filename: `PICAM_${ts}_${Platform.OS === 'ios' ? 'iOS' : 'Android'}.jpg`,
          format: 'image/jpeg',
          device: Platform.OS === 'ios' ? 'iPhone' : 'Android',
          gpsEnabled: captureCoords !== null,
          latitude: captureCoords?.latitude,
          longitude: captureCoords?.longitude,
          appVersion: '1.0.0',
        });

        if (assetId) {
          const trustLevel: 'ca' | 'device' = (isOnline && certActive) ? 'ca' : 'device';
          await indexTrustedAsset(assetId, trustLevel, signed.contentHash);
        }

        // ── Step 4: Background upload to TETA+PI ─────────────────────────────
        if (isOnline) attachProducerAndUpload(stablePath!, 'image/jpeg', signed.manifest);
      } catch { /* signing failed — photo already saved */ }

    } finally {
      // Keep stablePath alive — thumbnail + preview need it. OS cleans cache dir.
      if (markedPath) { try { new File(markedPath).delete(); } catch {} }
      isCapturing.current = false;
    }
  }, [mode, recording, isOnline, mediaPermission, certActive, runSigningToast, attachProducerAndUpload]);

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: '#fff', marginBottom: 16 }}>Camera access required</Text>
        <Pressable onPress={requestPermission} style={styles.permBtn}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Grant Access</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WatermarkComposer ref={watermarkRef} />
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash ? 'on' : 'off'}
        mode={mode === 'photo' ? 'picture' : 'video'}
        zoom={zoom}
        mirror={facing === 'front'}
      />

      {/* Subtle grid overlay */}
      <View style={styles.grid} pointerEvents="none" />

      {/* HUD */}
      {hudVariant === 'classic' && (
        <ClassicHUD online={isOnline} certActive={certActive} flash={flash} setFlash={setFlash}
          openSettings={() => router.push('/(tabs)/settings')}
          zoomLabel={ZOOM_LABELS[zoomIdx >= 0 ? zoomIdx : 0]}
          onZoom={cycleZoom} />
      )}
      {hudVariant === 'minimal' && (
        <MinimalHUD online={isOnline} flash={flash} setFlash={setFlash}
          openSettings={() => router.push('/(tabs)/settings')} />
      )}
      {hudVariant === 'cinematic' && (
        <CinematicHUD online={isOnline} flash={flash} setFlash={setFlash}
          openSettings={() => router.push('/(tabs)/settings')} keyShort={keyShort} />
      )}

      {/* Capture FX */}
      <FlashOverlay visible={flashFX} />
      <HashFX active={!!toast} />

      {/* Signing toast */}
      <SigningToast visible={!!toast} phase={toast} />

      {/* Mode pill — swaps to REC indicator while recording */}
      <View style={styles.modePill}>
        {mode === 'video' && recording ? (
          <View style={styles.recChip}>
            <Text style={styles.recText}>● REC {formatTime(recSeconds)}</Text>
          </View>
        ) : (
          <PillToggle
            value={mode}
            onChange={(v) => setMode(v as 'photo' | 'video')}
            options={[{ value: 'photo', label: 'Photo' }, { value: 'video', label: 'Video' }]}
          />
        )}
      </View>

      {/* Bottom controls */}
      <View style={[styles.bottomRow, { paddingBottom: insets.bottom + 16 }]}>
        {/* Thumbnail */}
        <Pressable
          onPress={() => lastPhotoUri && router.push({ pathname: '/preview', params: { uri: lastPhotoUri } })}
          style={styles.thumbnail}
          accessibilityLabel="Open last capture"
        >
          {lastPhotoUri
            ? <RNImage source={{ uri: lastPhotoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            : <View style={{ flex: 1, backgroundColor: '#333' }} />
          }
        </Pressable>

        {/* Shutter */}
        <View style={{ alignItems: 'center' }}>
          <ShutterButton mode={mode} recording={recording} onPress={onShutter} />
        </View>

        {/* Flip */}
        <CamControl
          onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
          label="Switch camera"
        >
          <FlipIcon size={22} color="#fff" />
        </CamControl>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
  },
  modePill: {
    position: 'absolute', left: 0, right: 0, bottom: 140,
    alignItems: 'center', zIndex: 15,
  },
  bottomRow: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    height: 120, paddingHorizontal: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    zIndex: 15,
  },
  thumbnail: {
    width: 52, height: 52, borderRadius: 10,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  recChip: {
    alignItems: 'center',
  },
  recText: {
    color: '#fff', fontFamily: 'Menlo', fontSize: 12, fontWeight: '700', letterSpacing: 0.5,
    backgroundColor: Colors.alert, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
    overflow: 'hidden',
  },
  permBtn: {
    backgroundColor: Colors.purple, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 12,
  },
});

const hud = StyleSheet.create({
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12,
  },
  zoomPill: {
    position: 'absolute', top: 110, alignSelf: 'center', zIndex: 15,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 9999,
    backgroundColor: 'rgba(26,26,46,0.6)',
  },
  zoomText: {
    color: '#fff', fontFamily: 'Menlo', fontSize: 12, fontWeight: '600',
  },
  // Minimal
  minimalTop: {
    position: 'absolute', top: 16, left: 0, right: 0, alignItems: 'center', zIndex: 15,
  },
  minimalPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999,
    backgroundColor: 'rgba(26,26,46,0.55)', borderWidth: 0.5,
  },
  minimalStatus: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  sideRail: {
    position: 'absolute', right: 16, top: 80, flexDirection: 'column', gap: 12, zIndex: 15,
  },
  // Cinematic
  cinemaTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 80, backgroundColor: '#000', zIndex: 10,
  },
  cinemaBottom: {
    position: 'absolute', bottom: 240, left: 0, right: 0, height: 60, backgroundColor: '#000', zIndex: 10,
  },
  cinemaBar: {
    position: 'absolute', top: 8, left: 0, right: 0, height: 64, zIndex: 16,
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 16,
  },
  cinemaBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8 },
  cinemaBtnText: { color: '#fff', fontFamily: 'System', fontSize: 11, fontWeight: '600' },
  cinemaStatus: { fontFamily: 'Menlo', fontSize: 10, color: Colors.purpleLt, letterSpacing: 1.2 },
  cinemaKey: { fontFamily: 'Menlo', fontSize: 9, color: '#666', letterSpacing: 0.5, marginTop: 2 },
  cinemaStrip: {
    position: 'absolute', bottom: 248, left: 0, right: 0, height: 44, zIndex: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  cinemaChip: { fontFamily: 'Menlo', fontSize: 10, letterSpacing: 1.4 },
  sha: { fontFamily: 'Menlo', fontSize: 10, color: '#888', letterSpacing: 0.5 },
});
