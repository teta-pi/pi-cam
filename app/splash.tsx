import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/tokens';
import PiMark from '@/components/PiMark';
import HashStream from '@/components/HashStream';

export type SplashStatus = 'initializing' | 'generating-key' | 'error';

type Props = { status?: SplashStatus };

const STATUS_TEXT: Record<SplashStatus, string> = {
  initializing: 'Initializing…',
  'generating-key': 'Generating secure key…',
  error: 'Permission needed',
};

function PulseDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        Animated.delay(1200 - delay - 800),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay]);

  return (
    <Animated.View style={[styles.dot, { opacity: anim }]} />
  );
}

export default function SplashScreen({ status = 'initializing' }: Props) {
  return (
    <View style={styles.container}>
      {/* Hash backdrop */}
      <View style={styles.hashBg} pointerEvents="none">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <HashStream key={i} speed={20 + i * 4} color="#6C63FF" opacity={0.18} />
        ))}
      </View>

      {/* Radial glow */}
      <View style={styles.glow} pointerEvents="none" />

      {/* Logo */}
      <View style={styles.logoWrap}>
        <PiMark size={88} color={Colors.purple} />
      </View>

      <Text style={styles.title}>Pi CAM</Text>
      <Text style={styles.tagline}>Verified by Design</Text>

      {/* Loading dots */}
      <View style={styles.dots}>
        <PulseDot delay={0} />
        <PulseDot delay={150} />
        <PulseDot delay={300} />
      </View>

      <Text style={styles.statusText}>{STATUS_TEXT[status]}</Text>

      <Text style={styles.version}>v1.0 · by Pi</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  hashBg: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    gap: 32,
  },
  glow: {
    position: 'absolute',
    top: '18%',
    alignSelf: 'center',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(108,99,255,0.18)',
  },
  logoWrap: {
    marginBottom: 18,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  tagline: {
    color: Colors.purpleLt,
    fontSize: 14,
    marginTop: 4,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 48,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.purple,
  },
  statusText: {
    color: '#888',
    fontSize: 12,
    marginTop: 14,
    minHeight: 16,
  },
  version: {
    position: 'absolute',
    bottom: 56,
    color: '#666',
    fontSize: 11,
    fontFamily: 'Menlo',
    letterSpacing: 0.5,
  },
});
