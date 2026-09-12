import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, FlatList, Dimensions, ScrollView,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Radius } from '@/constants/tokens';
import { PlusIcon, ShieldCheckIcon, ShieldIcon, CameraIcon, CheckIcon } from '@/components/ui/Icons';
import { loadTrustIndex } from '@/modules/c2pa';

const W = Dimensions.get('window').width;
const CELL = (W - 4) / 3;

type PhotoItem = MediaLibrary.Asset & { trustLevel?: 'ca' | 'device' };
type Filter = 'all' | 'device' | 'ca';

export default function GalleryScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = MediaLibrary.usePermissions();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const selecting = selected.size > 0;

  const loadPhotos = useCallback(async () => {
    if (!permission?.granted) return;
    const [result, index] = await Promise.all([
      MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        sortBy: [['creationTime', false]],
        first: 60,
      }),
      loadTrustIndex(),
    ]);
    setPhotos(result.assets.map((a) => ({
      ...a,
      trustLevel: index[a.id],
    })));
  }, [permission]);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  // Re-read the library every time the Gallery tab gains focus — tabs stay
  // mounted, so a photo taken on the Camera tab wouldn't otherwise appear
  // until the app restarted.
  useFocusEffect(useCallback(() => {
    loadPhotos();
  }, [loadPhotos]));

  const shareSelected = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    const info = await MediaLibrary.getAssetInfoAsync(ids[0]);
    const fileUri = info.localUri ?? info.uri;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    }
    setSelected(new Set());
  };

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const filtered = photos.filter((p) => {
    if (filter === 'all') return true;
    return p.trustLevel === filter;
  });

  const FILTERS: { id: Filter; label: string; dot?: string }[] = [
    { id: 'all', label: `All · ${photos.length}` },
    { id: 'device', label: 'Device', dot: Colors.device },
    { id: 'ca', label: 'Pi Verified', dot: Colors.verified },
  ];

  if (!permission?.granted) {
    return (
      <View style={[styles.container, { backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: t.textMuted, marginBottom: 16 }}>Photo library access required</Text>
        <Pressable onPress={requestPermission} style={[styles.ctaBtn, { backgroundColor: t.purple }]}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Grant Access</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: t.border }]}>
        <Text style={[styles.heading, { color: t.text }]}>Pi CAM Gallery</Text>
        <Pressable
          onPress={() => router.push('/(tabs)/camera')}
          style={[styles.addBtn, { backgroundColor: t.lavender }]}
          accessibilityLabel="Open camera"
        >
          <PlusIcon size={20} color={t.purple} stroke={2.4} />
        </Pressable>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 12 }}>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={[styles.filterChip, { backgroundColor: active ? t.purple : t.lavender }]}
            >
              {f.dot && <View style={[styles.filterDot, { backgroundColor: f.dot }]} />}
              <Text style={[styles.filterText, { color: active ? '#fff' : t.purple }]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Grid */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <CameraIcon size={48} color={t.grayLt} />
          <Text style={[styles.emptyText, { color: t.textMuted }]}>
            {photos.length === 0 ? 'Take your first verified photo' : 'No matching photos'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          numColumns={3}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSel = selected.has(item.id);
            return (
              <Pressable
                onPress={() => selecting ? toggle(item.id) : router.push({ pathname: '/preview', params: { assetId: item.id } })}
                onLongPress={() => toggle(item.id)}
                style={styles.cell}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
                {/* Trust pip — only for Pi CAM signed photos */}
                {item.trustLevel && (
                  <View style={[styles.pip, { backgroundColor: item.trustLevel === 'ca' ? Colors.verified : Colors.device }]}>
                    {item.trustLevel === 'ca'
                      ? <ShieldCheckIcon size={12} color="#fff" stroke={2.6} />
                      : <ShieldIcon size={12} color="#fff" stroke={2.6} />}
                  </View>
                )}
                {/* Selection circle */}
                {selecting && (
                  <View style={[styles.selCircle, { backgroundColor: isSel ? t.purple : 'rgba(255,255,255,0.9)', borderColor: isSel ? 'transparent' : 'rgba(0,0,0,0.15)' }]}>
                    {isSel && <CheckIcon size={14} color="#fff" stroke={3} />}
                  </View>
                )}
              </Pressable>
            );
          }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80, paddingTop: 4 }}
          ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
        />
      )}

      {/* Selection bar */}
      {selecting && (
        <View style={[styles.selBar, { backgroundColor: t.bg, borderTopColor: t.border, paddingBottom: insets.bottom + 8 }]}>
          <Pressable onPress={shareSelected} style={[styles.selBtn, { borderColor: t.purple }]}>
            <Text style={{ color: t.purple, fontWeight: '600' }}>Share · {selected.size}</Text>
          </Pressable>
          <Pressable onPress={() => setSelected(new Set())} style={[styles.selBtn, { borderColor: Colors.alert }]}>
            <Text style={{ color: Colors.alert, fontWeight: '600' }}>Cancel</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 8, borderBottomWidth: 0.5,
  },
  heading: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  filters: { flexGrow: 0 },
  filterChip: {
    height: 32, paddingHorizontal: 14, borderRadius: 9999,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  filterDot: { width: 6, height: 6, borderRadius: 3 },
  filterText: { fontSize: 13, fontWeight: '600' },
  cell: { width: CELL, height: CELL, backgroundColor: '#1a1a2e', marginRight: 2, position: 'relative', overflow: 'hidden' },
  pip: {
    position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6,
    elevation: 4,
  },
  selCircle: {
    position: 'absolute', bottom: 6, right: 6, width: 22, height: 22,
    borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 15 },
  selBar: {
    flexDirection: 'row', gap: 12, padding: 12, borderTopWidth: 0.5,
  },
  selBtn: {
    flex: 1, height: 48, borderRadius: 12, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
});
