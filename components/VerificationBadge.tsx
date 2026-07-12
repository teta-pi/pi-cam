import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Radius } from '@/constants/tokens';
import { ShieldCheckIcon, ShieldIcon, ShieldXIcon, SparkleIcon } from '@/components/ui/Icons';

export type BadgeStatus = 'ca' | 'device' | 'error' | 'signing' | 'certifying';

type Props = {
  status?: BadgeStatus;
  size?: 'sm' | 'md';
  label?: string;
};

const LABELS: Record<BadgeStatus, string> = {
  ca: 'Pi Verified',
  device: 'Device Signed',
  error: 'Verification failed',
  signing: 'Signing…',
  certifying: 'Certifying…',
};

export default function VerificationBadge({ status = 'ca', size = 'md', label }: Props) {
  const t = useTheme();
  const BADGE_KEYS: Record<BadgeStatus, 'badgeCa' | 'badgeDevice' | 'badgeError' | 'badgeSign'> = {
    ca: 'badgeCa',
    device: 'badgeDevice',
    error: 'badgeError',
    signing: 'badgeSign',
    certifying: 'badgeSign',
  };
  const skin = t[BADGE_KEYS[status]];

  const text = label ?? LABELS[status];
  const compact = size === 'sm';
  const iconSize = compact ? 12 : 14;

  const Icon = {
    ca: ShieldCheckIcon,
    device: ShieldIcon,
    error: ShieldXIcon,
    signing: ShieldIcon,
    certifying: SparkleIcon,
  }[status];

  return (
    <View style={[
      styles.badge,
      {
        backgroundColor: skin.bg,
        borderColor: skin.border,
        paddingHorizontal: compact ? 10 : 12,
        paddingVertical: compact ? 4 : 6,
      },
    ]}>
      <Icon size={iconSize} color={skin.text} stroke={2.2} />
      <Text style={[styles.label, { color: skin.text, fontSize: compact ? 11 : 12 }]}>
        {text}
      </Text>
      {status === 'signing' && (
        <ActivityIndicator size="small" color={skin.text} style={{ width: 10, height: 10, transform: [{ scale: 0.6 }] }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
