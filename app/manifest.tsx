import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Radius } from '@/constants/tokens';
import JsonTree from '@/components/JsonTree';
import { CloseIcon, FileJsonIcon, CopyIcon } from '@/components/ui/Icons';
import { extractManifest } from '@/modules/c2pa';

const MANIFEST_SAMPLE = {
  claim_generator: 'PiCAM/1.0.0',
  claim_generator_info: [{ name: 'Pi CAM', version: '1.0.0' }],
  title: 'Pi CAM · Photo · 2026-05-24 14:32',
  format: 'image/jpeg',
  instance_id: 'xmp:iid:picam-3e4fa1b288c74d1f-1748779927000',
  assertions: [
    { label: 'c2pa.hash.data', data: { alg: 'sha256', hash: '3e4fa1b288c7…1d09', exclusions: [] } },
    { label: 'c2pa.actions', data: { actions: [{ action: 'c2pa.created', when: '2026-05-24T14:32:07Z', softwareAgent: 'PiCAM/1.0.0', digitalSourceType: 'https://cv.iptc.org/newscodes/digitalsourcetype/digitalCapture' }] } },
    { label: 'c2pa.metadata', data: { 'dc:format': 'image/jpeg', 'photoshop:DateCreated': '2026-05-24T14:32:07Z' } },
    { label: 'stds.exif', data: { 'exif:GPSLatitude': 50.45, 'exif:GPSLongitude': 30.52, 'exif:GPSAltitudeRef': 0 } },
  ],
  signature_info: {
    alg: 'ecdsa-with-SHA256',
    issuer: 'Pi CAM Device Key',
    cert_serial_number: 'A3F9…2B1C',
    time: '2026-05-24T14:32:07Z',
  },
};

export default function ManifestScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [manifest, setManifest] = useState<Record<string, unknown>>(MANIFEST_SAMPLE);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    extractManifest('').then((m) => { if (m) setManifest(m); }).catch(() => {});
  }, []);

  const copyAll = async () => {
    await Clipboard.setStringAsync(JSON.stringify(manifest, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bgAlt }]}>
      {/* Nav */}
      <View style={[styles.nav, { paddingTop: insets.top, borderBottomColor: t.border, backgroundColor: t.bg }]}>
        <Pressable onPress={() => router.back()} style={styles.navBtn}>
          <CloseIcon size={22} color={t.text} />
        </Pressable>
        <View style={styles.navCenter}>
          <FileJsonIcon size={18} color={t.purple} />
          <Text style={[styles.navTitle, { color: t.text }]}>C2PA Manifest</Text>
        </View>
        <Pressable onPress={copyAll} style={styles.navBtn}>
          <CopyIcon size={20} color={t.purple} />
        </Pressable>
      </View>

      {/* Tree */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
        <JsonTree value={Object.fromEntries(Object.entries(manifest).filter(([, v]) => v !== null))} />
      </ScrollView>

      {/* Bottom action */}
      <View style={[styles.bottom, { borderTopColor: t.border, backgroundColor: t.bg, paddingBottom: insets.bottom + 12 }]}>
        <Pressable onPress={copyAll} style={[styles.copyBtn, { borderColor: t.purple }]}>
          <Text style={[styles.copyBtnText, { color: t.purple }]}>
            {copied ? 'Copied to clipboard ✓' : 'Copy Full JSON'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingBottom: 4, borderBottomWidth: 0.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
    elevation: 2,
  },
  navBtn: { padding: 8 },
  navCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navTitle: { fontSize: 16, fontWeight: '700' },
  bottom: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 0.5,
  },
  copyBtn: {
    height: 48, borderRadius: Radius.lg, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  copyBtnText: { fontSize: 15, fontWeight: '600' },
});
