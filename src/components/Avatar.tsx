import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
  ImageStyle,
} from 'react-native';

export const DEFAULT_AVATAR = require('../images/avatar_placeholder.png');

export interface AvatarProps {
  source?: string | ImageSourcePropType | null;
  size?: number;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

export default function Avatar({
  source,
  size = 40,
  borderColor,
  borderWidth = 0,
  borderRadius,
  style,
  imageStyle,
}: AvatarProps) {
  const radius = borderRadius !== undefined ? borderRadius : size / 2;

  let imageSource: ImageSourcePropType = DEFAULT_AVATAR;
  if (typeof source === 'string' && source.trim().length > 0) {
    imageSource = { uri: source };
  } else if (source && typeof source === 'object') {
    imageSource = source as ImageSourcePropType;
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: radius,
          borderColor: borderColor || 'transparent',
          borderWidth: borderColor ? (borderWidth || 2) : borderWidth,
        },
        style,
      ]}
    >
      <Image
        source={imageSource}
        style={[
          styles.image,
          {
            width: '100%',
            height: '100%',
            borderRadius: Math.max(0, radius - (borderWidth || 0)),
          },
          imageStyle,
        ]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
