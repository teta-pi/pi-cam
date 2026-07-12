import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

type Option = { value: string; label: string };

type Props = {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
};

export default function PillToggle({ value, onChange, options }: Props) {
  return (
    <BlurView intensity={60} tint="dark" style={styles.container}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.pill, active && styles.activePill]}
          >
            <Text style={[styles.label, { color: active ? '#1A1A2E' : '#fff' }]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 32,
    padding: 3,
    borderRadius: 9999,
    overflow: 'hidden',
    backgroundColor: 'rgba(26,26,46,0.55)',
  },
  pill: {
    height: 26,
    paddingHorizontal: 14,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    backgroundColor: '#fff',
  },
  label: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '600',
  },
});
