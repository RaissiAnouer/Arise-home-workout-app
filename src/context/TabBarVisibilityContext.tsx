import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

interface TabBarVisibilityContextType {
  isTabBarVisible: boolean;
  showTabBar: () => void;
  hideTabBar: () => void;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const TabBarVisibilityContext = createContext<TabBarVisibilityContextType>({
  isTabBarVisible: true,
  showTabBar: () => {},
  hideTabBar: () => {},
  onScroll: () => {},
});

export const TabBarVisibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const SCROLL_THRESHOLD = 8; // Small delta to prevent jitter

  const showTabBar = useCallback(() => {
    setIsTabBarVisible(true);
  }, []);

  const hideTabBar = useCallback(() => {
    setIsTabBarVisible(false);
  }, []);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    // Scrolled near top: always show
    if (currentY <= 15) {
      setIsTabBarVisible(true);
      lastScrollY.current = currentY;
      return;
    }

    // Scroll Down: hide tab bar
    if (diff > SCROLL_THRESHOLD && currentY > 50) {
      setIsTabBarVisible(false);
    }
    // Scroll Up: show tab bar
    else if (diff < -SCROLL_THRESHOLD) {
      setIsTabBarVisible(true);
    }

    lastScrollY.current = currentY;
  }, []);

  return (
    <TabBarVisibilityContext.Provider
      value={{
        isTabBarVisible,
        showTabBar,
        hideTabBar,
        onScroll,
      }}
    >
      {children}
    </TabBarVisibilityContext.Provider>
  );
};

export const useTabBarVisibility = () => useContext(TabBarVisibilityContext);
