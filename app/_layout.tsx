import 'react-native-gesture-handler';
import { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const APP_DATA_VERSION = 4;

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [checked, setChecked] = useState(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    AsyncStorage.getItem('@football_stars_game').then((raw) => {
      let onboardingDone = false;
      let favoriteTeam: string | null = null;
      let appDataVersion = 0;

      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          appDataVersion = parsed.appDataVersion ?? 0;
          onboardingDone = parsed.onboardingDone ?? false;
          favoriteTeam = parsed.favoriteTeam ?? null;
        } catch {
          onboardingDone = false;
        }
      }

      const inOnboarding = (segments as string[])[0] === 'onboarding';
      const mustMigrate = appDataVersion !== APP_DATA_VERSION;
      const shouldShowOnboarding = mustMigrate || !onboardingDone || !favoriteTeam;

      if (shouldShowOnboarding && !inOnboarding) {
        router.replace('/onboarding' as never);
      }

      setChecked(true);
      SplashScreen.hideAsync().catch(() => {});
    });
  }, [router, segments]);

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
