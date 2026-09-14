import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, ActionSheetIOS, Platform, Alert,
} from 'react-native';
import { Image } from 'expo-image';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Radius } from '@/constants/tokens';
import VerificationBadge from '@/components/VerificationBadge';
import WatermarkComposer, { WatermarkRef } from '@/components/WatermarkComposer';
import JsonTree from '@/components/JsonTree';
import {
  CloseIcon, MoreIcon, ShareIcon, CalIcon, DeviceIcon, PinIcon,
  KeyIcon, HashIcon, ClockIcon, CopyIcon,
} from '@/components/ui/Icons';
import { extractManifestByAssetId } from '@/modules/c2pa';
import { getPublicKey } from '@/modules/crypto';
import type { C2PAManifest } from '@/modules/c2pa/types';

type Tab = 'details' | 'technical';

function DetailsRow({ Icon, label, value, mono, copyable, onCopy }: {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string; value: string; mono?: boolean; copyable?: boolean; onCopy?: () => void;
}) {
  const t = useTheme();
  return (
    <View style={[styles.detailRow, { borderBottomColor: t.borderSoft }]}>
      <Icon size={20} color={t.purple} />
      <View style={styles.detailText}>
        <Text style={[styles.detailLabel, { color: t.textMuted }]}>{label}</Text>
        <Text style={[styles.detailValue, {
          color: mono ? t.mono : t.textBody,
          fontFamily: mono ? 'Menlo' : 'System',
          fontSize: mono ? 12 : 14,
        }]} numberOfLines={1}>{value}</Text>
      </View>
      {copyable && (
        <Pressable onPress={onCopy} style={{ padding: 8 }}>
          <CopyIcon size={16} color={t.grayLt} />
        </Pressable>
      )}
    </View>
  );
}

export default function PreviewScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { uri, assetId } = useLocalSearchParams<{ uri?: string; assetId?: string }>();
  const [tab, setTab] = useState<Tab>('details');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [resolvedUri, setResolvedUri] = useState(uri ?? '');
  const [manifest, setManifest] = useState<C2PAManifest | null>(null);
  const [assetInfo, setAssetInfo] = useState<MediaLibrary.AssetInfo | null>(null);
  const [keyShort, setKeyShort] = useState('····');
  const watermarkRef = useRef<WatermarkRef>(null);

  // Resolve URI from assetId
  useEffect(() => {
    if (uri) { setResolvedUri(uri); return; }
    if (!assetId) return;
    MediaLibrary.getAssetInfoAsync(assetId)
      .then((info) => {
        setResolvedUri(info.localUri ?? info.uri);
        setAssetInfo(info);
      })
      .catch(() => {});
  }, [uri, assetId]);

  // Load manifest
  useEffect(() => {
    if (!assetId) return;
    extractManifestByAssetId(assetId).then((result) => {
      if (result) setManifest(result.manifest);
    }).catch(() => {});
  }, [assetId]);

  // Load device public key for display
  useEffect(() => {
    getPublicKey().then((k) => { if (k) setKeyShort(k.publicKeyShort); });
  }, []);

  const photoUri = resolvedUri;

  const copy = async (k: string, value: string) => {
    await Clipboard.setStringAsync(value);
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(null), 1600);
  };

  const share = async () => {
    if (!photoUri) return;
    let uriToShare = photoUri;
    try {
      if (watermarkRef.current) uriToShare = await watermarkRef.current.apply(photoUri);
    } catch {}
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uriToShare);
  };

  const save = async () => {
    if (!photoUri) return;
    try {
      let uriToSave = photoUri;
      try {
        if (watermarkRef.current) uriToSave = await watermarkRef.current.apply(photoUri);
      } catch {}
      await MediaLibrary.saveToLibraryAsync(uriToSave);
      Alert.alert('Saved', 'Photo saved to library.');
    } catch {
      Alert.alert('Error', 'Could not save photo.');
    }
  };

  const copyManifest = async () => {
    const payload = manifest ?? { status: 'no_manifest', assetId };
    await Clipboard.setStringAsync(JSON.stringify(payload, null, 2));
    setCopiedKey('meta');
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const showMore = () => {
    const options = ['Cancel', 'Save to Photos', 'Copy C2PA Manifest'];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 0, title: 'Options' },
        (i) => {
          if (i === 1) save();
          if (i === 2) copyManifest();
        }
      );
    } else {
      save();
    }
  };

  // Derive display values from manifest
  const capturedAt = manifest?.signed_at
    ? new Date(manifest.signed_at).toLocaleString()
    : assetInfo?.creationTime
    ? new Date(assetInfo.creationTime).toLocaleString()
    : '—';

  const actionsAssertion = manifest?.assertions?.find((a) => a.label === 'c2pa.actions');
  const actionsArr = Array.isArray(actionsAssertion?.data?.actions) ? actionsAssertion!.data.actions as Array<Record<string, unknown>> : [];
  const deviceLabel = (actionsArr[0]?.softwareAgent as string | undefined) ?? 'Pi CAM';

  const gpsAssertion = manifest?.assertions?.find((a) => a.label === 'stds.exif');
  const locationLabel = gpsAssertion
    ? `${(gpsAssertion.data['exif:GPSLatitude'] as number)?.toFixed(4)}, ${(gpsAssertion.data['exif:GPSLongitude'] as number)?.toFixed(4)}`
    : 'Not captured';

  const contentHash = manifest?.assertions?.find(
    (a) => a.label === 'c2pa.hash.data'
  )?.data?.hash as string | undefined;

  const hashShort = contentHash
    ? `${contentHash.slice(0, 8)}···${contentHash.slice(-8)}`
    : '—';

  const manifestForTree = manifest
    ? Object.fromEntries(Object.entries(manifest).filter(([, v]) => v !== null))
    : null;

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <WatermarkComposer ref={watermarkRef} />

      {/* Nav */}
      <View style={[styles.nav, { paddingTop: insets.top, borderBottomColor: t.border }]}>
        <Pressable onPress={() => router.back()} style={styles.navBtn}>
          <CloseIcon size={24} color={t.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: t.text }]}>Preview</Text>
        <Pressable onPress={showMore} style={styles.navBtn}>
          <MoreIcon size={24} color={t.text} />
        </Pressable>
      </View>

      {/* Media */}
      <View style={styles.mediaWrap}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1a1a2e' }]} />
        )}
        <View style={styles.badgeOverlay}>
          <VerificationBadge status="device" label="Device Signed" />
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: t.border }]}>
        {(['details', 'technical'] as Tab[]).map((id) => {
          const active = tab === id;
          return (
            <Pressable key={id} onPress={() => setTab(id)}
              style={[styles.tab, { borderBottomColor: active ? t.purple : 'transparent' }]}>
              <Text style={[styles.tabText, { color: active ? t.purple : t.textMuted }]}>
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Body */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {tab === 'details' ? (
          <View>
            <DetailsRow Icon={CalIcon} label="CAPTURED" value={capturedAt} />
            <DetailsRow Icon={DeviceIcon} label="SIGNED BY" value={deviceLabel as string} />
            <DetailsRow Icon={PinIcon} label="LOCATION" value={locationLabel} />
            <View style={{ padding: 16 }}>
              <VerificationBadge status="device" label="Device Signed" />
            </View>
            <DetailsRow
              Icon={KeyIcon} label="PUBLIC KEY" value={keyShort} mono copyable
              onCopy={() => copy('key', keyShort)}
            />
            <DetailsRow
              Icon={HashIcon} label="SHA-256" value={hashShort} mono copyable
              onCopy={() => copy('hash', contentHash ?? '')}
            />
            <DetailsRow
              Icon={ClockIcon} label="SIGNED AT"
              value={manifest?.signed_at ? new Date(manifest.signed_at).toISOString() : '—'} mono
            />
            <View style={{ height: 24 }} />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {manifestForTree ? (
              <>
                <View style={[styles.techHeader, { paddingHorizontal: 16, paddingTop: 12 }]}>
                  <Text style={[styles.techLabel, { color: t.textMuted }]}>C2PA Manifest</Text>
                  <Pressable onPress={copyManifest} style={{ padding: 4 }}>
                    <Text style={{ color: t.purple, fontWeight: '600', fontSize: 12 }}>
                      {copiedKey === 'meta' ? 'Copied ✓' : 'Copy All'}
                    </Text>
                  </Pressable>
                </View>
                <JsonTree value={manifestForTree as Record<string, unknown>} />
              </>
            ) : (
              <View style={[styles.techHeader, { padding: 24, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: t.textMuted, fontSize: 14 }}>
                  No C2PA manifest found for this photo.
                </Text>
                <Text style={{ color: t.textMuted, fontSize: 12, marginTop: 6 }}>
                  Take a new photo with Pi CAM to generate a manifest.
                </Text>
              </View>
            )}
            <View style={{ height: 80 }} />
          </View>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={[styles.actions, { borderTopColor: t.border, paddingBottom: insets.bottom + 12 }]}>
        <Pressable onPress={share} style={[styles.primaryBtn, { backgroundColor: t.purple }]}>
          <ShareIcon size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Share</Text>
        </Pressable>
        <Pressable onPress={save} style={[styles.secondaryBtn, { borderColor: t.purple }]}>
          <Text style={[styles.secondaryBtnText, { color: t.purple }]}>Save</Text>
        </Pressable>
      </View>

      {/* Copy toast */}
      {copiedKey && (
        <View style={[styles.copyToast, { backgroundColor: Colors.navy }]}>
          <Text style={styles.copyToastText}>Copied!</Text>
        </View>
      )}
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
  mediaWrap: { backgroundColor: '#000', aspectRatio: 4 / 3, position: 'relative' },
  badgeOverlay: { position: 'absolute', bottom: 12, left: 0, right: 0, alignItems: 'center' },
  tabs: { flexDirection: 'row', borderBottomWidth: 0.5 },
  tab: { flex: 1, height: 44, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2 },
  tabText: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  detailRow: {
    height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    borderBottomWidth: 0.5, gap: 4,
  },
  detailText: { flex: 1, marginLeft: 4 },
  detailLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
  detailValue: { marginTop: 2 },
  techHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  techLabel: { fontSize: 13, fontWeight: '600' },
  actions: {
    flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 0.5,
  },
  primaryBtn: {
    flex: 1, height: 52, borderRadius: Radius.lg, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    flex: 1, height: 48, borderRadius: Radius.lg, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600' },
  copyToast: {
    position: 'absolute', bottom: 100, alignSelf: 'center',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9999,
  },
  copyToastText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
