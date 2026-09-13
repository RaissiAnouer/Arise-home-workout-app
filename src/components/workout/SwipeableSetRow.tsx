import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Pressable,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { Trash2 } from 'lucide-react-native';

export interface SwipeableSetRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  onOpen?: () => void;
  onClose?: () => void;
  disabled?: boolean;
  rightActionsWidth?: number;
  thresholdRatio?: number; // e.g. 0.7 for 70%
  requireConfirmation?: boolean;
  isOpen?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_ACTION_WIDTH = Math.round(SCREEN_WIDTH * 0.32); // 32% of screen size

export default function SwipeableSetRow({
  children,
  onDelete,
  onOpen,
  onClose,
  disabled = false,
  rightActionsWidth = DEFAULT_ACTION_WIDTH,
  thresholdRatio = 0.7,
  requireConfirmation = false,
  isOpen = false,
}: SwipeableSetRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const rowHeight = useRef(new Animated.Value(60)).current;
  const rowOpacity = useRef(new Animated.Value(1)).current;
  const rowMarginBottom = useRef(new Animated.Value(0)).current;

  const isSwipingOpen = useRef(false);
  const [isCollapsing, setIsCollapsing] = useState(false);

  // Dynamic opacity so red background NEVER peeks or shows when unswiped
  const deleteOpacity = translateX.interpolate({
    inputRange: [-20, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Sync external isOpen prop (for mutual exclusion)
  useEffect(() => {
    if (!isOpen && isSwipingOpen.current) {
      snapClosed();
    }
  }, [isOpen]);

  const triggerHaptic = () => {
    try {
      if (Platform.OS !== 'web') {
        const Haptics = require('expo-haptics');
        if (Haptics && Haptics.impactAsync && Haptics.ImpactFeedbackStyle) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }
    } catch {
      // safe fallback
    }
  };

  const snapClosed = () => {
    isSwipingOpen.current = false;
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: false,
      bounciness: 4,
    }).start(() => {
      if (onClose) onClose();
    });
  };

  const snapOpen = () => {
    isSwipingOpen.current = true;
    Animated.spring(translateX, {
      toValue: -rightActionsWidth,
      useNativeDriver: false,
      bounciness: 4,
    }).start(() => {
      if (onOpen) onOpen();
    });
  };

  const animateCollapseAndDelete = () => {
    triggerHaptic();
    setIsCollapsing(true);
    Animated.parallel([
      Animated.timing(rowHeight, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(rowOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(rowMarginBottom, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onDelete();
    });
  };

  const handleDeleteTrigger = () => {
    if (requireConfirmation) {
      if (Platform.OS === 'web') {
        const confirmed = window.confirm('Are you sure you want to remove this set?');
        if (confirmed) animateCollapseAndDelete();
        else snapClosed();
      } else {
        Alert.alert(
          'Delete Set',
          'Are you sure you want to remove this set?',
          [
            { text: 'Cancel', style: 'cancel', onPress: snapClosed },
            { text: 'Delete', style: 'destructive', onPress: animateCollapseAndDelete },
          ]
        );
      }
    } else {
      animateCollapseAndDelete();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (disabled) return false;
        // Only activate on horizontal swipes (ignore vertical scrolling)
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        if (onOpen && !isSwipingOpen.current) {
          onOpen();
        }
      },
      onPanResponderMove: (_, gestureState) => {
        if (disabled) return;
        const initialX = isSwipingOpen.current ? -rightActionsWidth : 0;
        let newX = initialX + gestureState.dx;

        // Limit right dragging past zero
        if (newX > 0) newX = 0;

        translateX.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (disabled) return;
        const currentX = (isSwipingOpen.current ? -rightActionsWidth : 0) + gestureState.dx;
        const autoDeleteThreshold = -(SCREEN_WIDTH * thresholdRatio);

        // Auto delete if swiped past threshold (>70%)
        if (currentX < autoDeleteThreshold) {
          handleDeleteTrigger();
        } else if (currentX < -rightActionsWidth / 2) {
          // Snap open to 32% size
          snapOpen();
        } else {
          // Snap closed
          snapClosed();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.rowContainer,
        isCollapsing ? { height: rowHeight } : null,
        {
          opacity: rowOpacity,
          marginBottom: rowMarginBottom,
        },
      ]}
    >
      {/* Background Delete Action Button with Opacity Fade-in */}
      <Animated.View
        style={[
          styles.deleteBackground,
          { width: SCREEN_WIDTH, opacity: deleteOpacity },
        ]}
      >
        <Pressable
          style={[styles.deleteButton, { width: rightActionsWidth }]}
          onPress={handleDeleteTrigger}
        >
          <Trash2 size={20} color="#FFFFFF" />
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </Animated.View>

      {/* Foreground Sliding Content */}
      <Animated.View
        style={[
          styles.foregroundContainer,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}

const iosFont = Platform.select({
  ios: 'System',
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "San Francisco", sans-serif',
  default: 'System',
});

const styles = StyleSheet.create({
  rowContainer: {
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  deleteButton: {
    height: '100%',
    backgroundColor: '#FF3B30',
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  deleteText: {
    fontFamily: iosFont,
    fontWeight: '700',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  foregroundContainer: {
    width: '100%',
  },
});
