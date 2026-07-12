import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Radius } from '@/constants/tokens';
import VerificationBadge from '@/components/VerificationBadge';
import HashStream from '@/components/HashStream';
import {
  BackIcon, CloudUpIcon, ShieldCheckIcon, ShieldIcon, ShieldXIcon, AlertIcon,
  CalIcon, DeviceIcon, AwardIcon, HashIcon, KeyIcon,
} from '@/components/ui/Icons';

type VerifyState = 'idle' | 'verifying' | 'ca' | 'device' | 'tampered' | 'none';

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

function ResultCard({ state, onReset }: { state: Exclude<VerifyState, 'idle' | 'verifying'>; onReset: () => void }) {
  const t = useTheme();

  const cfgMap: Record<typeof state, ResultCfg> = {
    ca:       { topColor: Colors.verified, header: 'Content Authentic',   Icon: ShieldCheckIcon, iconColor: Colors.verified },
    device:   { topColor: Colors.device,   header: 'Device Verified',     Icon: ShieldIcon,      iconColor: Colors.device },
    tampered: { topColor: Colors.alert,    header: 'Tampering Detected',  Icon: ShieldXIcon,     iconColor: Colors.alert },
    none:     { topColor: Colors.alert,    header: 'No Verification Data', Icon: AlertIcon,       iconColor: Colors.alert },
  };
  const cfg = cfgMap[state];
  const skin = state === 'ca' ? t.badgeCa : state === 'device' ? t.badgeDevice : t.badgeError;

  return (
    <View style={[styles.resultCard, { borderTopColor: cfg.topColor }]}>
      <View style={[styles.resultHeader, { backgroundColor: skin.bg }]}>
        <cfg.Icon size={28} color={cfg.iconColor} stroke={2.2} />
        <Text style={[styles.resultTitle, { color: skin.text }]}>{cfg.header}</Text>
      </View>

      {state === 'ca' && (
        <>
          <ResultRow Icon={CalIcon} label="Captured" value="23 May 2026 17:44" t={t} />
          <ResultRow Icon={DeviceIcon} label="Device" value="iPhone 16 Pro" t={t} />
          <ResultRow Icon={AwardIcon} label="CA Certificate" value="Issued by Pi CA · valid" t={t} />
          <ResultRow Icon={HashIcon} label="SHA-256" value="b271…d501 ✓" mono t={t} />
        </>
      )}
      {state === 'device' && (
        <>
          <ResultRow Icon={DeviceIcon} label="Device" value="iPhone 16 Pro" t={t} />
          <ResultRow Icon={KeyIcon} label="Public Key" value="A3F9…2B1C" mono t={t} />
          <ResultRow Icon={HashIcon} label="SHA-256" value="8c1d…4e92 ✓" mono t={t} />
          <ResultRow Icon={AwardIcon} label="CA Certificate" value="None — offline at capture" t={t} />
        </>
      )}
      {state === 'tampered' && (
        <>
          <ResultRow Icon={AlertIcon} label="Hash Mismatch" value="Image bytes were altered after signing." t={t} />
          <ResultRow Icon={HashIcon} label="Expected" value="3e4f…a1b2" mono t={t} />
          <ResultRow Icon={HashIcon} label="Computed" value="9c12…??ff" mono t={t} />
        </>
      )}
      {state === 'none' && (
        <View style={{ padding: 20 }}>
          <Text style={{ color: t.textBody, fontSize: 14, lineHeight: 20 }}>
            No C2PA manifest found in this file. Cannot establish provenance or authenticity.
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

  const trigger = (target: Exclude<VerifyState, 'idle' | 'verifying'>) => {
    setState('verifying');
    setProgress(0);
    const iv = setInterval(() => setProgress((p) => Math.min(100, p + 8)), 60);
    setTimeout(() => { clearInterval(iv); setState(target); setProgress(100); }, 1400);
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'video/*'] });
    if (!result.canceled && result.assets[0]) {
      trigger('ca');
    }
  };

  const SAMPLES: { label: string; color: string; target: Exclude<VerifyState, 'idle' | 'verifying'> }[] = [
    { label: '✓ Pi Verified',  color: Colors.verified, target: 'ca' },
    { label: '● Device Only',  color: Colors.device,   target: 'device' },
    { label: '✕ Tampered',     color: Colors.alert,    target: 'tampered' },
    { label: '?  No manifest', color: t.grayMid,       target: 'none' },
  ];

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

        {state === 'verifying' && (
          <View style={[styles.fileCard, { backgroundColor: t.bgAlt }]}>
            <View style={[styles.fileThumb, { backgroundColor: Colors.navy }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.fileName, { color: t.text }]}>IMG_3892.heic</Text>
              <Text style={[styles.fileSize, { color: t.textMuted }]}>4.2 MB</Text>
              <View style={[styles.progressTrack, { backgroundColor: t.lavender }]}>
                <View style={[styles.progressFill, { width: `${progress}%` as any, backgroundColor: t.purple }]} />
              </View>
              <Text style={[styles.progressLabel, { color: t.textMuted }]}>Checking C2PA manifest…</Text>
            </View>
          </View>
        )}

        {['ca', 'device', 'tampered', 'none'].includes(state) && (
          <ResultCard state={state as Exclude<VerifyState, 'idle' | 'verifying'>} onReset={() => setState('idle')} />
        )}

        {state === 'idle' && (
          <View style={styles.samples}>
            <Text style={[styles.sampleLabel, { color: t.textMuted }]}>TRY A SAMPLE</Text>
            <View style={styles.sampleGrid}>
              {SAMPLES.map((s) => (
                <Pressable key={s.target} onPress={() => trigger(s.target)}
                  style={[styles.sampleChip, { backgroundColor: t.bgAlt, borderColor: t.borderSoft }]}>
                  <Text style={{ color: s.color, fontSize: 13, fontWeight: '600' }}>{s.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
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
  samples: { marginTop: 8 },
  sampleLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.6, marginBottom: 8,
  },
  sampleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sampleChip: {
    width: '48%', height: 44, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
});
