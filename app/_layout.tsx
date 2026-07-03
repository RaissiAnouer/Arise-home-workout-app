import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { QuestionnaireProvider } from '../src/context/QuestionnaireContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Eternal': require('../src/src/big title Eternal.ttf'),
    'LatoRegular': require('../src/src/text-Lato-Regular.ttf'),
    'TruenoRoundBold': require('../src/src/title-Trueno-Round-Bold.otf'),
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
    <QuestionnaireProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
          animation: 'none',
        }}
      />
    </QuestionnaireProvider>
  );
}
