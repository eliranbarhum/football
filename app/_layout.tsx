import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@football_stars_game').then((raw) => {
      let onboardingDone = false;
      if (raw) {
        try { onboardingDone = JSON.parse(raw).onboardingDone ?? false; } catch {}
      }
      const inOnboarding = (segments as string[])[0] === 'onboarding';
      if (!onboardingDone && !inOnboarding) {
        router.replace('/onboarding' as never);
      }
      setChecked(true);
      SplashScreen.hideAsync();
    });
  }, []);

  if (!checked) return null;
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      <OnboardingGate>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.primary },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen
            name="wallpaper/[id]"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
        </Stack>
      </OnboardingGate>
    </SafeAreaProvider>
  );
}
