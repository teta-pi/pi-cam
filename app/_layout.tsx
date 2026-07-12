import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/context/ThemeContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="splash" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="preview" options={{ presentation: 'modal', animation: 'fade' }} />
          <Stack.Screen name="verify" options={{ presentation: 'modal', animation: 'fade' }} />
          <Stack.Screen name="manifest" options={{ presentation: 'modal', animation: 'fade' }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
