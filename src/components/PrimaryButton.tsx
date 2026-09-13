import React from 'react';
import {
  Text,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';

export interface PrimaryButtonProps {
  title?: string;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  uppercase?: boolean;
}

export default function PrimaryButton({
  title,
  onPress,
  icon,
  disabled = false,
  style,
  textStyle,
  children,
  uppercase = true,
}: PrimaryButtonProps) {
  const formattedTitle = title ? (uppercase ? title.toUpperCase() : title) : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      {formattedTitle ? (
        <Text style={[styles.text, textStyle]}>
          {formattedTitle}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    marginRight: 6,
  },
  text: {
    fontWeight: '600',
    fontSize: 14,
    color: '#000000',
    letterSpacing: 1.2,
  },
});