import '../global.css';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { QuestionnaireProvider } from '../src/context/QuestionnaireContext';
import { WorkoutPlanProvider } from '../src/context/WorkoutPlanContext';
import { ProgressionProvider, useProgression } from '../src/context/ProgressionContext';
import LevelUpNotification from '../src/components/LevelUpNotification';
import { CustomWorkoutsProvider } from '../src/context/CustomWorkoutsContext';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, asyncStoragePersister } from '../src/lib/queryClient';

import { GuildProvider } from '../src/context/GuildContext';

import { 
  Inter_400Regular, 
  Inter_500Medium, 
  Inter_600SemiBold, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';

// Configure notifications (native only — not available on web)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Set up Android notification channel (required for Android 8+)
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('workout-reminders', {
      name: 'Workout Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }
}

import { useNotificationObserver } from '../src/hooks/useNotificationObserver';

SplashScreen.preventAutoHideAsync();

function GlobalLevelUpHandler() {
  const { pendingLevelUp, dismissLevelUp } = useProgression();
  if (!pendingLevelUp) return null;
  return <LevelUpNotification event={pendingLevelUp} onDismiss={dismissLevelUp} />;
}

function NotificationResponseHandler() {
  useNotificationObserver();
  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Eternal': require('../src/src/big title Eternal.ttf'),
    'LatoRegular': require('../src/src/text-Lato-Regular.ttf'),
    'TruenoRoundBold': require('../src/src/title-Trueno-Round-Bold.otf'),
    'Orbitron': require('../src/src/Orbitron-Bold.ttf'),
    'PressStart2P': require('../src/src/PressStart2P-Regular.ttf'),
    'Inter': Inter_400Regular,
    'InterMedium': Inter_500Medium,
    'InterSemiBold': Inter_600SemiBold,
    'InterBold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister }}>
        <QuestionnaireProvider>
          <ProgressionProvider>
            <CustomWorkoutsProvider>
              <WorkoutPlanProvider>
                <GuildProvider>
                  <StatusBar style="light" />
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: '#121212' },
                      animation: 'none',
                    }}
                  />
                  <GlobalLevelUpHandler />
                  <NotificationResponseHandler />
                </GuildProvider>
              </WorkoutPlanProvider>
            </CustomWorkoutsProvider>
          </ProgressionProvider>
        </QuestionnaireProvider>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}
