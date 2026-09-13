import { Tabs } from 'expo-router';
import { Home, Users, BarChart2, User, Layers } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { TabBarVisibilityProvider, useTabBarVisibility } from '../../src/context/TabBarVisibilityContext';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [containerWidth, setContainerWidth] = useState(0);
  const { isTabBarVisible, showTabBar } = useTabBarVisibility();

  const routeConfig: Record<string, { label: string; icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }> }> = {
    home: { label: 'Home', icon: Home },
    cards: { label: 'Cards', icon: Layers },
    friends: { label: 'Friends', icon: Users },
    reports: { label: 'Reports', icon: BarChart2 },
    profile: { label: 'Profile', icon: User },
  };

  const visibleRoutes = state.routes.filter(
    (r) => descriptors[r.key]?.options?.href !== null && routeConfig[r.name]
  );

  const activeRouteName = state.routes[state.index]?.name;
  const activeVisibleIndex = visibleRoutes.findIndex((r) => r.name === activeRouteName);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const paddingHorizontal = 6;
  const pillWidth = 64;

  // Reset tab bar visibility when switching tabs
  useEffect(() => {
    showTabBar();
  }, [activeRouteName, showTabBar]);

  // Ensure tab bar is always visible
  useEffect(() => {
    translateY.value = withTiming(0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  useEffect(() => {
    if (containerWidth > 0 && activeVisibleIndex >= 0 && visibleRoutes.length > 0) {
      const availableWidth = containerWidth - paddingHorizontal * 2;
      const tabSlotWidth = availableWidth / visibleRoutes.length;
      const offsetInSlot = (tabSlotWidth - pillWidth) / 2;
      const targetX = paddingHorizontal + activeVisibleIndex * tabSlotWidth + offsetInSlot;

      translateX.value = withSpring(targetX, {
        damping: 22,
        stiffness: 240,
        mass: 0.8,
      });
    }
  }, [activeVisibleIndex, containerWidth, visibleRoutes.length]);

  const animatedPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        {
          bottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : 20,
        },
        animatedContainerStyle,
      ]}
    >
      <View style={styles.tabBar} onLayout={handleLayout}>
        {/* Animated Sliding Active Pill */}
        {containerWidth > 0 && activeVisibleIndex >= 0 && (
          <Animated.View style={[styles.slidingPill, animatedPillStyle]} />
        )}

        {state.routes.map((route) => {
          const { options } = descriptors[route.key];

          if (options.href === null || !routeConfig[route.name]) {
            return null;
          }

          const isFocused = route.name === activeRouteName;
          const config = routeConfig[route.name];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              if (typeof (navigation as any).jumpTo === 'function') {
                (navigation as any).jumpTo(route.name);
              } else {
                navigation.navigate(route.name as any);
              }
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tabItemWrapper}
            >
              <View style={styles.tabContent}>
                <config.icon
                  size={20}
                  color={isFocused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.55)'}
                  strokeWidth={isFocused ? 2.5 : 1.8}
                />
                <Text
                  style={[
                    styles.label,
                    {
                      color: isFocused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.55)',
                      fontWeight: isFocused ? '600' : '400',
                    },
                  ]}
                >
                  {config.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

export default function TabLayout() {
  const prevIndexRef = React.useRef(0);

  return (
    <TabBarVisibilityProvider>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={({ route }) => ({
          headerShown: false,
          lazy: false,
          freezeOnBlur: false,
        })}
        screenListeners={({ navigation }) => ({
          tabPress: (e) => {
            // Track direction for potential future gesture use
          },
          state: (e) => {
            const state = navigation.getState();
            if (state) {
              prevIndexRef.current = state.index;
            }
          },
        })}
        sceneContainerStyle={{
          backgroundColor: '#000000',
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            animation: 'shift',
          }}
        />
        <Tabs.Screen
          name="cards"
          options={{
            title: 'Cards',
            animation: 'shift',
          }}
        />
        <Tabs.Screen
          name="friends"
          options={{
            title: 'Friends',
            animation: 'shift',
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Reports',
            animation: 'shift',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            animation: 'shift',
          }}
        />
      </Tabs>
    </TabBarVisibilityProvider>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    left: 12,
    right: 12,
    maxWidth: 480,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 20, 24, 0.72)',
    borderRadius: 36,
    height: 62,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px) saturate(190%)',
          WebkitBackdropFilter: 'blur(20px) saturate(190%)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
        } as any)
      : {}),
  },
  slidingPill: {
    position: 'absolute',
    left: 0,
    width: 64,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#35353A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 2px 8px rgba(0, 0, 0, 0.25)',
        } as any)
      : {}),
  },
  tabItemWrapper: {
    flex: 1,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabContent: {
    width: '100%',
    maxWidth: 64,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.3,
  },
});


