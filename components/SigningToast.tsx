import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
} from 'react-native-reanimated';
import { ShieldCheckIcon, ShieldIcon, AlertIcon, SparkleIcon } from '@/components/ui/Icons';
import { Radius } from '@/constants/tokens';

export type ToastPhase = 'signing' | 'signed' | 'certifying' | 'verified' | 'error';

type Config = {
  text: string;
  bg: string;
  icon: React.ReactNode;
};

const CONFIGS: Record<ToastPhase, Config> = {
  signing:    { text: 'Signing…',              bg: 'rgba(26,26,46,0.92)', icon: null },
  signed:     { text: 'Device Signed',         bg: 'rgba(26,26,46,0.92)', icon: null },
  certifying: { text: 'Certifying…',           bg: 'rgba(26,26,46,0.92)', icon: null },
  verified:   { text: 'Pi Verified ✓',         bg: 'rgba(6,95,70,0.92)',  icon: null },
  error:      { text: 'Signing failed — Retry', bg: 'rgba(153,27,27,0.92)', icon: null },
};

type Props = {
  visible: boolean;
  phase: ToastPhase | null;
};

export default function SigningToast({ visible, phase }: Props) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 250 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(12, { duration: 200 });
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!phase) return null;
  const cfg = CONFIGS[phase];

  const IconEl = {
    signing:    <ActivityIndicator size="small" color="#fff" style={{ width: 14, height: 14, transform: [{ scale: 0.7 }] }} />,
    signed:     <ShieldCheckIcon size={14} color="#FCD34D" />,
    certifying: <SparkleIcon size={14} color="#C7C3FF" />,
    verified:   <ShieldCheckIcon size={14} color="#7EE2A8" />,
    error:      <AlertIcon size={14} color="#FCA5A5" />,
  }[phase];

  return (
    <Animated.View style={[styles.toast, { backgroundColor: cfg.bg }, animStyle]}>
      {IconEl}
      <Text style={styles.text}>{cfg.text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 268,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: Radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 10,
    zIndex: 30,
    minWidth: 170,
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
