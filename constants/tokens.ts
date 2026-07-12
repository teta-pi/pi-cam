export const Colors = {
  navy: '#1A1A2E',
  purple: '#6C63FF',
  purpleLt: '#8B85FF',
  lavender: '#F0EFFF',
  verified: '#27AE60',
  device: '#F5A623',
  alert: '#E74C3C',
  camBlack: '#111111',
  white: '#FFFFFF',
  offWhite: '#F7F6FF',
  grayMid: '#888888',
  grayLt: '#CCCCCC',
} as const;

export const Light = {
  bg: '#FFFFFF',
  bgAlt: '#F7F6FF',
  text: '#1A1A2E',
  textBody: '#444444',
  textMuted: '#888888',
  border: '#CCCCCC',
  borderSoft: 'rgba(0,0,0,0.08)',
  purple: '#6C63FF',
  lavender: '#F0EFFF',
  grayLt: '#CCCCCC',
  grayMid: '#888888',
  mono: '#444444',
  badgeDevice: { bg: '#FFFBEB', border: '#F5A623', text: '#92400E' },
  badgeCa:     { bg: '#ECFDF5', border: '#27AE60', text: '#065F46' },
  badgeError:  { bg: '#FEF2F2', border: '#E74C3C', text: '#991B1B' },
  badgeSign:   { bg: '#F0EFFF', border: '#6C63FF', text: '#4C1D95' },
  isDark: false,
} as const;

export const Dark = {
  bg: '#0D0D1A',
  bgAlt: '#12122A',
  text: '#FFFFFF',
  textBody: '#CCCCCC',
  textMuted: '#888888',
  border: '#2A2A4A',
  borderSoft: 'rgba(255,255,255,0.08)',
  purple: '#8B85FF',
  lavender: '#1A1840',
  grayLt: '#444444',
  grayMid: '#666666',
  mono: '#C7C3FF',
  badgeDevice: { bg: '#2A1F0E', border: '#F5A623', text: '#FDD17A' },
  badgeCa:     { bg: '#0C2A1A', border: '#27AE60', text: '#7EE2A8' },
  badgeError:  { bg: '#2A0F0F', border: '#E74C3C', text: '#FCA5A5' },
  badgeSign:   { bg: '#1A1840', border: '#6C63FF', text: '#C7C3FF' },
  isDark: true,
} as const;

export const Space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const Radius = { sm: 8, md: 12, lg: 20, full: 9999 } as const;

export type Theme = typeof Light & { isDark: boolean };
