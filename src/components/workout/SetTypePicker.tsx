import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';

export type SetType = 'normal' | 'warmup' | 'dropset' | 'failure';

export const SET_TYPE_CONFIG: Record<SetType, {
  label: string;
  short: string;
  color: string;
  bgColor: string;
}> = {
  normal: { label: 'Normal', short: '', color: '#FFFFFF', bgColor: 'rgba(255,255,255,0.1)' },
  warmup: { label: 'Warm-up', short: 'W', color: '#FF9500', bgColor: 'rgba(255,149,0,0.15)' },
  dropset: { label: 'Drop Set', short: 'D', color: '#AF52DE', bgColor: 'rgba(175,82,222,0.15)' },
  failure: { label: 'Failure', short: 'F', color: '#FF3B30', bgColor: 'rgba(255,59,48,0.15)' },
};

const SET_TYPES: SetType[] = ['normal', 'warmup', 'dropset', 'failure'];

interface SetTypePickerProps {
  visible: boolean;
  currentType: SetType;
  onSelect: (type: SetType) => void;
  onClose: () => void;
  anchorY: number;
  anchorX: number;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SetTypePicker({ visible, currentType, onSelect, onClose, anchorY, anchorX }: SetTypePickerProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 120, useNativeDriver: false }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleSelect = (type: SetType) => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 120, useNativeDriver: false }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 120, useNativeDriver: false }),
    ]).start(() => onSelect(type));
  };

  if (!visible) return null;

  const showAbove = anchorY > SCREEN_HEIGHT * 0.6;
  const dropdownTop = showAbove ? anchorY - 200 : anchorY;

  return (
    <Modal transparent animationType="none" visible>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.dropdown,
            {
              top: dropdownTop,
              left: Math.max(12, Math.min(anchorX - 80, Dimensions.get('window').width - 192)),
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>SET TYPE</Text>
          </View>

          {SET_TYPES.map((type) => {
            const cfg = SET_TYPE_CONFIG[type];
            const isSelected = type === currentType;

            return (
              <Pressable
                key={type}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => handleSelect(type)}
              >
                <View style={[styles.colorDot, { backgroundColor: cfg.color }]} />
                <Text style={[styles.optionLabel, { color: cfg.color }]}>{cfg.label}</Text>
                {cfg.short !== '' && (
                  <View style={[styles.shortBadge, { backgroundColor: cfg.bgColor, borderColor: `${cfg.color}40` }]}>
                    <Text style={[styles.shortText, { color: cfg.color }]}>{cfg.short}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }} />
                {isSelected && (
                  <CheckCircle2 size={18} color={cfg.color} />
                )}
              </Pressable>
            );
          })}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const iosFont = Platform.select({
  ios: 'System',
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "San Francisco", sans-serif',
  default: 'System',
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dropdown: {
    position: 'absolute',
    width: 180,
    backgroundColor: '#1A1D28',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
  },
  dropdownHeader: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  dropdownTitle: {
    fontFamily: iosFont,
    fontWeight: '700',
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 2,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  optionSelected: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionLabel: {
    fontFamily: iosFont,
    fontWeight: '500',
    fontSize: 14,
  },
  shortBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  shortText: {
    fontFamily: iosFont,
    fontWeight: '700',
    fontSize: 11,
  },
});
