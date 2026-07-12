// Pi CAM design tokens. Two palettes (light / dark) keyed off spec S-01 + S-12.
// Everything else in the app reads from a theme object — pass it down via a
// React context so a single device frame can independently choose its mode.

const PI_LIGHT = {
  // Brand
  navy: '#1A1A2E',
  purple: '#6C63FF',
  purpleLt: '#8B85FF',
  lavender: '#F0EFFF',
  // Status
  verified: '#27AE60',
  device: '#F5A623',
  alert: '#E74C3C',
  // Neutrals
  camBlack: '#111111',
  white: '#FFFFFF',
  offWhite: '#F7F6FF',
  grayMid: '#888888',
  grayLt: '#CCCCCC',
  // Semantic — light surface
  bg: '#FFFFFF',
  bgAlt: '#F7F6FF',
  bgCode: '#F4F4F8',
  text: '#1A1A2E',
  textBody: '#444444',
  textMuted: '#888888',
  border: '#CCCCCC',
  borderSoft: 'rgba(0,0,0,0.08)',
  // Badge skins
  badgeDevice: { bg: '#FFFBEB', border: '#F5A623', text: '#92400E' },
  badgeCa:     { bg: '#ECFDF5', border: '#27AE60', text: '#065F46' },
  badgeError:  { bg: '#FEF2F2', border: '#E74C3C', text: '#991B1B' },
  badgeSign:   { bg: '#F0EFFF', border: '#6C63FF', text: '#4C1D95' },
  // Mono
  mono: '#5B21B6',
  isDark: false,
};

const PI_DARK = {
  ...PI_LIGHT,
  bg: '#0D0D1A',
  bgAlt: '#12122A',
  bgCode: '#12122A',
  text: '#FFFFFF',
  textBody: '#CCCCCC',
  textMuted: '#888888',
  border: '#2A2A4A',
  borderSoft: 'rgba(255,255,255,0.08)',
  navy: '#1A1A2E',
  lavender: '#1F1B3F',
  badgeDevice: { bg: '#2A1F0E', border: '#F5A623', text: '#FDD17A' },
  badgeCa:     { bg: '#0C2A1A', border: '#27AE60', text: '#7EE2A8' },
  badgeError:  { bg: '#2A0F0F', border: '#E74C3C', text: '#FCA5A5' },
  badgeSign:   { bg: '#1A1840', border: '#6C63FF', text: '#C7C3FF' },
  mono: '#C7C3FF',
  isDark: true,
};

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", system-ui, sans-serif';
const MONO_STACK = '"SF Mono", "JetBrains Mono", "Roboto Mono", ui-monospace, Menlo, monospace';

const SPACE = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
const RADIUS = { sm: 8, md: 12, lg: 20, full: 9999 };

const ThemeCtx = React.createContext(PI_LIGHT);
const useTheme = () => React.useContext(ThemeCtx);

function ThemeProvider({ mode, children }) {
  const t = mode === 'dark' ? PI_DARK : PI_LIGHT;
  return <ThemeCtx.Provider value={t}>{children}</ThemeCtx.Provider>;
}

Object.assign(window, {
  PI_LIGHT, PI_DARK, FONT_STACK, MONO_STACK, SPACE, RADIUS,
  ThemeCtx, ThemeProvider, useTheme,
});
