import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { Light, Dark, Theme } from '@/constants/tokens';

const ThemeCtx = createContext<Theme>(Light);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const theme = (scheme === 'dark' ? { ...Light, ...Dark } : Light) as Theme;
  return <ThemeCtx.Provider value={theme}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
