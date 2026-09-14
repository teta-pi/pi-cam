import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, Switch, ScrollView, Modal, Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Radius } from '@/constants/tokens';
import { useDeviceKey } from '@/hooks/useDeviceKey';
import {
  UserIcon, KeyIcon, AlertIcon, PinIcon, DropletIcon,
  DownloadIcon, ShieldCheckIcon, FileJsonIcon, InfoIcon, FileIcon, ChevRightIcon,
  CopyIcon, LinkIcon,
} from '@/components/ui/Icons';
import { getLinkedAccount, unlinkAccount, type LinkedAccount } from '@/modules/account';
import { useSettings } from '@/hooks/useSettings';

// ── Section ───────────────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <>
      <Text style={[styles.sectionLabel, { color: t.textMuted }]}>{label}</Text>
      <View style={[styles.sectionCard, { backgroundColor: t.isDark ? t.bgAlt : t.bg }]}>
        {children}
      </View>
    </>
  );
}

type RowProps = {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value?: React.ReactNode;
  action?: React.ReactNode;
  danger?: boolean;
  onPress?: () => void;
};

function Row({ Icon, label, value, action, danger, onPress }: RowProps) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.row, { borderBottomColor: t.borderSoft }]}>
      <Icon size={20} color={danger ? Colors.alert : t.purple} />
      <Text style={[styles.rowLabel, { color: danger ? Colors.alert : t.text }]}>{label}</Text>
      {value && <View style={styles.rowValue}>{value}</View>}
      {action ?? (onPress ? <ChevRightIcon size={16} color={danger ? Colors.alert : t.grayLt} /> : null)}
    </Pressable>
  );
}

type ToggleRowProps = {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  sub: string;
  value: boolean;
  onChange: () => void;
};

function ToggleRow({ Icon, label, sub, value, onChange }: ToggleRowProps) {
  const t = useTheme();
  return (
    <View style={[styles.toggleRow, { borderBottomColor: t.borderSoft }]}>
      <Icon size={20} color={t.purple} />
      <View style={styles.toggleText}>
        <Text style={[styles.rowLabel, { color: t.text }]}>{label}</Text>
        <Text style={[styles.sub, { color: t.textMuted }]}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: t.grayLt, true: t.purple }}
        thumbColor="#fff"
        ios_backgroundColor={t.grayLt}
      />
    </View>
  );
}

// ── Reset Sheet ───────────────────────────────────────────────────────────────

function ResetSheet({ visible, onClose, onConfirm }: { visible: boolean; onClose: () => void; onConfirm: () => void }) {
  const t = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: t.bg }]}>
          <View style={[styles.handle, { backgroundColor: t.grayLt }]} />
          <View style={[styles.sheetIcon, { backgroundColor: t.badgeError.bg }]}>
            <AlertIcon size={28} color={Colors.alert} />
          </View>
          <Text style={[styles.sheetTitle, { color: t.text }]}>Reset Device Key?</Text>
          <Text style={[styles.sheetBody, { color: t.textBody }]}>
            Photos already signed will keep their signatures. New captures will be signed with a new key — this can't be undone.
          </Text>
          <View style={styles.sheetButtons}>
            <Pressable onPress={onClose} style={[styles.sheetBtn, { borderColor: t.purple, borderWidth: 1.5 }]}>
              <Text style={{ color: t.purple, fontWeight: '600' }}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={[styles.sheetBtn, { backgroundColor: Colors.alert }]}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Reset</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { state: keyState, reset: resetKey } = useDeviceKey();

  const [resetOpen, setResetOpen] = useState(false);
  const [linkedAccount, setLinkedAccount] = useState<LinkedAccount | null>(null);
  const { settings: toggles, flip } = useSettings();

  useEffect(() => {
    getLinkedAccount().then(setLinkedAccount);
  }, []);

  const keyShort = keyState.status === 'ready' ? keyState.keyInfo.publicKeyShort : '····';

  const copyKey = async () => {
    if (keyState.status !== 'ready') return;
    await Clipboard.setStringAsync(keyState.keyInfo.publicKeyPem);
    Alert.alert('Copied', 'Public key copied to clipboard.');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: t.isDark ? t.bg : t.bgAlt }]}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: t.text }]}>Settings</Text>

      <Section label="ACCOUNT">
        {linkedAccount ? (
          <>
            <Row
              Icon={LinkIcon}
              label="Linked to TETA+PI"
              value={<Text style={{ color: Colors.verified, fontSize: 13, fontWeight: '600' }}>{linkedAccount.entityName}</Text>}
            />
            <Row
              Icon={UserIcon}
              label="Unlink device"
              danger
              onPress={() => Alert.alert('Unlink?', 'Camera will no longer upload to TETA+PI.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Unlink', style: 'destructive', onPress: async () => { await unlinkAccount(); setLinkedAccount(null); } },
              ])}
            />
          </>
        ) : (
          <Row
            Icon={LinkIcon}
            label="Link to TETA+PI"
            onPress={() => router.push('/link-account' as never)}
          />
        )}
      </Section>

      <Section label="SECURITY">
        <Row
          Icon={KeyIcon}
          label="Device Key"
          value={<Text style={[styles.mono, { color: t.mono }]}>{keyShort}</Text>}
          action={
            <Pressable onPress={copyKey} style={{ padding: 4 }}>
              <CopyIcon size={16} color={t.grayLt} />
            </Pressable>
          }
        />
        <Row
          Icon={AlertIcon}
          label="Reset Device Key"
          danger
          onPress={() => setResetOpen(true)}
        />
      </Section>

      <Section label="CAPTURE">
        <ToggleRow Icon={PinIcon} label="Include Location" sub="GPS in manifest" value={toggles.location} onChange={() => flip('location')} />
        <ToggleRow Icon={DropletIcon} label="Watermark on Share" sub="Pi badge on shared images" value={toggles.watermark} onChange={() => flip('watermark')} />
        <ToggleRow Icon={DownloadIcon} label="Save to Photos" sub="Auto-save to camera roll" value={toggles.savePhotos} onChange={() => flip('savePhotos')} />
      </Section>

      <Section label="TOOLS">
        <Row Icon={ShieldCheckIcon} label="Verify external content" onPress={() => router.push('/verify')} />
        <Row Icon={FileJsonIcon} label="View latest manifest" onPress={() => router.push('/manifest')} />
      </Section>

      <Section label="ABOUT">
        <Row Icon={InfoIcon} label="Version" value={<Text style={{ color: t.textMuted, fontSize: 14 }}>1.0.0 · Build 1</Text>} />
        <Row Icon={FileIcon} label="Privacy Policy" onPress={() => {}} />
      </Section>

      <ResetSheet
        visible={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={async () => { await resetKey(); setResetOpen(false); router.replace('/onboarding'); }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5, paddingHorizontal: 16, paddingBottom: 8 },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase',
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8,
  },
  sectionCard: {
    marginHorizontal: 16, borderRadius: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2,
    elevation: 1,
  },
  row: {
    height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    borderBottomWidth: 0.5, gap: 12,
  },
  rowLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  rowValue: { marginRight: 8 },
  toggleRow: {
    minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 0.5, gap: 12,
  },
  toggleText: { flex: 1 },
  sub: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  mono: { fontFamily: 'Menlo', fontSize: 13 },
  // Reset sheet
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, alignItems: 'center',
  },
  handle: { width: 36, height: 4, borderRadius: 2, marginBottom: 20 },
  sheetIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  sheetBody: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 20 },
  sheetButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  sheetBtn: {
    flex: 1, height: 48, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
});
