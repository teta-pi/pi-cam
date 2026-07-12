import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/tokens';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  active?: boolean;
  label?: string;
};

export default function CamControl({ children, onPress, active, label }: Props) {
  return (
    <Pressable onPress={onPress} accessibilityLabel={label} style={styles.wrap}>
      <BlurView
        intensity={60}
        tint="dark"
        style={[styles.btn, active && styles.active]}
      >
        {children}
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26,26,46,0.55)',
  },
  active: {
    backgroundColor: 'rgba(108,99,255,0.9)',
  },
});
