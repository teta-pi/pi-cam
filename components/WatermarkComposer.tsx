import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { Colors } from '@/constants/tokens';

export type WatermarkRef = {
  apply: (uri: string) => Promise<string>;
};

const { width: SW, height: SH } = Dimensions.get('window');

const WatermarkComposer = forwardRef<WatermarkRef>((_, ref) => {
  const viewRef = useRef<View>(null);
  const [uri, setUri] = useState<string | null>(null);
  const resolveRef = useRef<((u: string) => void) | null>(null);
  const rejectRef = useRef<((e: unknown) => void) | null>(null);

  useImperativeHandle(ref, () => ({
    apply: (photoUri: string) =>
      new Promise<string>((resolve, reject) => {
        resolveRef.current = resolve;
        rejectRef.current = reject;
        setUri(photoUri);
      }),
  }));

  const onImageLoad = async () => {
    // Two RAF — дочекуємось що нативний рендерер закомітив пікселі
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r()))
    );
    try {
      const result = await captureRef(viewRef, {
        format: 'jpg',
        quality: 0.93,
        // Без width/height — захоплюємо в натуральних point×scale пікселях
      });
      setUri(null);
      resolveRef.current?.(result);
    } catch (e) {
      setUri(null);
      rejectRef.current?.(e);
    }
  };

  return (
    <View
      style={styles.shell}
      pointerEvents="none"
    >
      <View ref={viewRef} style={styles.canvas} collapsable={false}>
        {uri && (
          <>
            <Image
              source={{ uri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              onLoad={onImageLoad}
            />
            <View style={styles.badge}>
              <Text style={styles.pi}>π</Text>
              <Text style={styles.badgeText}>PI CAM</Text>
            </View>
            <View style={styles.topBar}>
              <Text style={styles.topText}>VERIFIED · PI CAM</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
});

export default WatermarkComposer;

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SW,   // ← розміри екрану в points, не 1080
    height: SH,  // ← нативний рендерер рендерить цей вью повністю
    opacity: 0.01,
    zIndex: -1,  // ← не -999, просто за іншими вьюхами
  },
  canvas: {
    width: SW,
    height: SH,
    backgroundColor: '#000',
  },
  badge: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(10,10,26,0.72)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: `${Colors.purple}BB`,
  },
  pi: {
    color: Colors.purple,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Menlo',
  },
  badgeText: {
    color: '#fff',
    fontFamily: 'Menlo',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 14,
    paddingBottom: 8,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(10,10,26,0.5)',
    alignItems: 'flex-end',
  },
  topText: {
    color: `${Colors.purple}CC`,
    fontFamily: 'Menlo',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.8,
  },
});
