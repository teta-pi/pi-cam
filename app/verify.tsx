import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Radius } from '@/constants/tokens';
import HashStream from '@/components/HashStream';
import {
  BackIcon, CloudUpIcon, ShieldIcon, ShieldXIcon, AlertIcon,
  CalIcon, DeviceIcon, HashIcon, KeyIcon,
} from '@/components/ui/Icons';
import { verifyMedia } from '@/modules/c2pa';
import type { C2PAManifest } from '@/modules/c2pa/types';

type VerifyState = 'idle' | 'verifying' | 'device' | 'tampered' | 'none';

function DropZone({ verifying, onPick }: { verifying: boolean; onPick: () => void }) {
  const t = useTheme();
  return (
    <View style={[styles.dropZone, {
      borderColor: t.purple,
      borderStyle: verifying ? 'solid' : 'dashed',
      backgroundColor: t.lavender,
    }]}>
      {verifying && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <HashStream speed={4} color="rgba(108,99,255,0.6)" opacity={0.5} />
        </View>
      )}
      <CloudUpIcon size={44} color={t.purple} />
      <Text style={[styles.dropText, { color: t.textMuted }]}>
        {verifying ? 'Analyzing…' : 'Drop photo or video here'}
      </Text>
      {!verifying && (
        <Pressable onPress={onPick} style={[styles.chooseBtn, { borderColor: t.purple }]}>
          <Text style={{ color: t.purple, fontWeight: '600' }}>Choose File</Text>
        </Pressable>
      )}
    </View>
  );
}

type ResultCfg = {
  topColor: string;
  header: string;
  Icon: React.ComponentType<{ size?: number; color?: string; stroke?: number }>;
  iconColor: string;
};

type ResultState = Exclude<VerifyState, 'idle' | 'verifying'>;

function ResultCard({ state, manifest, contentHash, onReset }: {
  state: ResultState; manifest: C2PAManifest | null; contentHash: string | null; onReset: () => void;
}) {
  const t = useTheme();

  const cfgMap: Record<ResultState, ResultCfg> = {
    device:   { topColor: Colors.device, header: 'Device Signed',         Icon: ShieldIcon,  iconColor: Colors.device },
    tampered: { topColor: Colors.alert,  header: 'Tampering Detected',    Icon: ShieldXIcon, iconColor: Colors.alert },
    none:     { topColor: Colors.alert,  header: 'No Local Manifest',     Icon: AlertIcon,   iconColor: Colors.alert },
  };
  const cfg = cfgMap[state];
  const skin = state === 'device' ? t.badgeDevice : t.badgeError;

  const actionsAssertion = manifest?.assertions?.find((a) => a.label === 'c2pa.actions');
  const actionsArr = Array.isArray(actionsAssertion?.data?.actions) ? actionsAssertion!.data.actions as Array<Record<string, unknown>> : [];
  const deviceLabel = (actionsArr[0]?.softwareAgent as string | undefined) ?? 'Pi CAM';
  const keyShort = manifest?.signature_info?.cert_serial_number ?? '—';
  const hashShort = contentHash ? `${contentHash.slice(0, 8)}···${contentHash.slice(-8)}` : '—';
  const capturedAt = manifest?.signed_at ? new Date(manifest.signed_at).toLocaleString() : '—';

  return (
    <View style={[styles.resultCard, { borderTopColor: cfg.topColor }]}>
      <View style={[styles.resultHeader, { backgroundColor: skin.bg }]}>
        <cfg.Icon size={28} color={cfg.iconColor} stroke={2.2} />
        <Text style={[styles.resultTitle, { color: skin.text }]}>{cfg.header}</Text>
      </View>

      {state === 'device' && (
        <>
          <ResultRow Icon={CalIcon} label="Captured" value={capturedAt} t={t} />
          <ResultRow Icon={DeviceIcon} label="Signed By" value={deviceLabel} t={t} />
          <ResultRow Icon={KeyIcon} label="Public Key" value={keyShort} mono t={t} />
          <ResultRow Icon={HashIcon} label="SHA-256" value={hashShort} mono t={t} />
        </>
      )}
      {state === 'tampered' && (
        <ResultRow
          Icon={AlertIcon} label="Hash Mismatch"
          value="File bytes don't match the signed manifest — content was altered after signing."
          t={t}
        />
      )}
      {state === 'none' && (
        <View style={{ padding: 20 }}>
          <Text style={{ color: t.textBody, fontSize: 14, lineHeight: 20 }}>
            No C2PA manifest found for this file on this device. Pi CAM can only
            verify captures it signed itself — cross-device verification against
            a remote registry isn't available yet.
          </Text>
        </View>
      )}

      <Pressable onPress={onReset} style={styles.resetBtn}>
        <Text style={{ color: t.purple, fontWeight: '600' }}>Verify Another</Text>
      </Pressable>
    </View>
  );
}

function ResultRow({ Icon, label, value, mono, t }: {
  Icon: React.ComponentType<{ size?: number; color?: string; stroke?: number }>;
  label: string; value: string; mono?: boolean;
  t: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[styles.detailRow, { borderBottomColor: t.borderSoft }]}>
      <Icon size={20} color={t.purple} />
      <View style={{ flex: 1, marginLeft: 4 }}>
        <Text style={{ fontSize: 11, fontWeight: '600', color: t.textMuted, letterSpacing: 0.3, textTransform: 'uppercase' }}>{label}</Text>
        <Text style={{ fontSize: mono ? 12 : 14, color: mono ? t.mono : t.textBody, fontFamily: mono ? 'Menlo' : 'System', marginTop: 2 }}>{value}</Text>
      </View>
    </View>
  );
}

export default function VerifyScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<VerifyState>('idle');
  const [progress, setProgress] = useState(0);
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number | null } | null>(null);
  const [manifest, setManifest] = useState<C2PAManifest | null>(null);
  const [contentHash, setContentHash] = useState<string | null>(null);

  const reset = () => {
    setState('idle');
    setFileMeta(null);
    setManifest(null);
    setContentHash(null);
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'video/*'] });
    if (result.canceled || !result.assets[0]) return;

    setState('verifying');
    setProgress(0);
    setFileMeta({ name: result.assets[0].name, size: result.assets[0].size ?? null });

    const iv = setInterval(() => setProgress((p) => Math.min(92, p + 8)), 60);
    try {
      const verifyResult = await verifyMedia(result.assets[0].uri);
      clearInterval(iv);
      setProgress(100);
      setManifest(verifyResult.manifest);
      setContentHash(verifyResult.contentHash);
      setState(verifyResult.status);
    } catch {
      clearInterval(iv);
      setProgress(100);
      setState('none');
    }
  };

  const fileSizeLabel = fileMeta?.size ? `${(fileMeta.size / (1024 * 1024)).toFixed(1)} MB` : '—';

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      {/* Nav */}
      <View style={[styles.nav, { paddingTop: insets.top, borderBottomColor: t.border }]}>
        <Pressable onPress={() => router.back()} style={styles.navBtn}>
          <BackIcon size={24} color={t.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: t.text }]}>Verify Content</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {(state === 'idle' || state === 'verifying') && (
          <DropZone verifying={state === 'verifying'} onPick={pickFile} />
        )}

        {state === 'verifying' && fileMeta && (
          <View style={[styles.fileCard, { backgroundColor: t.bgAlt }]}>
            <View style={[styles.fileThumb, { backgroundColor: Colors.navy }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.fileName, { color: t.text }]} numberOfLines={1}>{fileMeta.name}</Text>
              <Text style={[styles.fileSize, { color: t.textMuted }]}>{fileSizeLabel}</Text>
              <View style={[styles.progressTrack, { backgroundColor: t.lavender }]}>
                <View style={[styles.progressFill, { width: `${progress}%` as any, backgroundColor: t.purple }]} />
              </View>
              <Text style={[styles.progressLabel, { color: t.textMuted }]}>Checking C2PA manifest…</Text>
            </View>
          </View>
        )}

        {(state === 'device' || state === 'tampered' || state === 'none') && (
          <ResultCard state={state} manifest={manifest} contentHash={contentHash} onReset={reset} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingBottom: 4, borderBottomWidth: 0.5,
  },
  navBtn: { padding: 8 },
  navTitle: { fontSize: 17, fontWeight: '700' },
  body: { padding: 16, gap: 16 },
  dropZone: {
    height: 200, borderRadius: 16, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', gap: 12,
    paddingHorizontal: 24, overflow: 'hidden', position: 'relative',
  },
  dropText: { fontSize: 15, fontWeight: '500' },
  chooseBtn: {
    height: 44, paddingHorizontal: 20, borderRadius: Radius.lg, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  fileCard: {
    flexDirection: 'row', gap: 12, padding: 12, borderRadius: 12, alignItems: 'center',
  },
  fileThumb: { width: 56, height: 56, borderRadius: 8 },
  fileName: { fontSize: 13, fontWeight: '600' },
  fileSize: { fontSize: 12, marginTop: 2 },
  progressTrack: { height: 4, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  progressFill: { height: '100%' },
  progressLabel: { marginTop: 6, fontFamily: 'Menlo', fontSize: 11 },
  resultCard: {
    borderRadius: 12, overflow: 'hidden', borderTopWidth: 4,
    shadowColor: Colors.navy, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 20,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, paddingHorizontal: 20,
  },
  resultTitle: { fontSize: 18, fontWeight: '700' },
  detailRow: {
    height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 0.5, gap: 4,
  },
  resetBtn: { padding: 12, alignItems: 'center' },
});
