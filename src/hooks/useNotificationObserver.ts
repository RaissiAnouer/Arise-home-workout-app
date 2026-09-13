import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';

/**
 * Normalizes any notification URL (internal route or arise:// deep link)
 * into a valid Expo Router path.
 */
export function normalizeNotificationRoute(rawUrl?: unknown): string {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return '/(tabs)/home';
  }

  const trimmed = rawUrl.trim();

  // If it's a custom scheme like arise://streak or arise://(tabs)/home
  if (trimmed.startsWith('arise://')) {
    const parsed = Linking.parse(trimmed);
    if (parsed.path) {
      return parsed.path.startsWith('/') ? parsed.path : `/${parsed.path}`;
    }
    return '/(tabs)/home';
  }

  // If it's an absolute path
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `/${trimmed}`;
}

/**
 * Dispatches a test push notification scheduled to arrive in a few seconds.
 * Useful for testing that tapping a notification wakes/opens the app and navigates.
 */
export async function sendTestNotificationAsync(delaySeconds: number = 3, targetRoute: string = '/(tabs)/home') {
  if (Platform.OS === 'web') {
    return { success: false, reason: 'Notifications not supported on web' };
  }

  try {
    const settings = await Notifications.getPermissionsAsync();
    let granted = settings.granted;
    if (!granted && settings.canAskAgain) {
      const req = await Notifications.requestPermissionsAsync();
      granted = req.granted;
    }

    if (!granted) {
      return { success: false, reason: 'Permission not granted' };
    }

    // Ensure channel exists on Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('workout-reminders', {
        name: 'Workout Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚔️ Daily Quest Ready, Hunter!',
        body: 'Your daily workout quest is waiting. Rise up and keep your streak alive!',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === 'android' && { channelId: 'workout-reminders' }),
        data: {
          url: targetRoute,
          type: 'workout_reminder',
          sentAt: new Date().toISOString(),
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, delaySeconds),
        ...(Platform.OS === 'android' && { channelId: 'workout-reminders' }),
      },
    });

    return { success: true, notificationId: id };
  } catch (error) {
    console.error('Error sending test notification:', error);
    return { success: false, reason: String(error) };
  }
}

/**
 * Hook that observes notification tap interactions and opens the app
 * to the appropriate destination route when tapped.
 */
export function useNotificationObserver() {
  const handledResponseIds = useRef(new Set<string>());

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let isMounted = true;

    const navigateFromResponse = async (response: Notifications.NotificationResponse) => {
      const identifier = response?.notification?.request?.identifier;
      if (identifier && handledResponseIds.current.has(identifier)) {
        return;
      }
      if (identifier) {
        handledResponseIds.current.add(identifier);
      }

      try {
        const rawUrl = response?.notification?.request?.content?.data?.url;
        const targetRoute = normalizeNotificationRoute(rawUrl);

        // Allow layout and router to finish any pending mount transition
        setTimeout(() => {
          if (!isMounted) return;
          try {
            router.push(targetRoute as any);
          } catch (navError) {
            console.warn('Router push failed, falling back to replace / home:', navError);
            router.replace('/(tabs)/home' as any);
          }
        }, 150);

        // Clear the response so it is not processed again on remount
        if (typeof Notifications.clearLastNotificationResponseAsync === 'function') {
          await Notifications.clearLastNotificationResponseAsync().catch(() => {});
        }
      } catch (err) {
        console.warn('Error handling notification tap response:', err);
      }
    };

    // 1. Handle app cold start (launched by tapping a notification)
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (isMounted && response?.notification) {
          navigateFromResponse(response);
        }
      })
      .catch((err) => {
        console.warn('Error retrieving last notification response on start:', err);
      });

    // 2. Handle foreground / background notification response (user tapped banner or tray)
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      if (isMounted && response?.notification) {
        navigateFromResponse(response);
      }
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
}
