import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { GuildEmblemType } from '../../types/guild';

export const GUILD_IMAGES_MAP: Record<string, ImageSourcePropType> = {
  guild_1: require('../../../assets/guilds/473b125dedf394b40dda233533218140.jpg'),
  guild_2: require('../../../assets/guilds/86 Unique Angel Tattoo Stencil Designs For a Timeless & Divine Look.jpg'),
  guild_3: require('../../../assets/guilds/Another Sigil_.jpg'),
  guild_4: require('../../../assets/guilds/download (1).jpg'),
  guild_5: require('../../../assets/guilds/download.jpg'),
  guild_6: require('../../../assets/guilds/TRIAS.jpg'),
  // Aliases for initial/existing presets
  shadow_monarch: require('../../../assets/guilds/473b125dedf394b40dda233533218140.jpg'),
  void_crown: require('../../../assets/guilds/86 Unique Angel Tattoo Stencil Designs For a Timeless & Divine Look.jpg'),
  titan_aegis: require('../../../assets/guilds/Another Sigil_.jpg'),
  phoenix_blaze: require('../../../assets/guilds/download (1).jpg'),
  dragon_fang: require('../../../assets/guilds/download.jpg'),
  dual_daggers: require('../../../assets/guilds/TRIAS.jpg'),
  iron_fortress: require('../../../assets/guilds/Another Sigil_.jpg'),
  eclipse_gate: require('../../../assets/guilds/TRIAS.jpg'),
};

export interface GuildOptionItem {
  id: GuildEmblemType;
  label: string;
  image: ImageSourcePropType;
}

export const GUILD_IMAGE_OPTIONS: GuildOptionItem[] = [
  {
    id: 'guild_1',
    label: 'Dark Sigil',
    image: require('../../../assets/guilds/473b125dedf394b40dda233533218140.jpg'),
  },
  {
    id: 'guild_2',
    label: 'Archangel',
    image: require('../../../assets/guilds/86 Unique Angel Tattoo Stencil Designs For a Timeless & Divine Look.jpg'),
  },
  {
    id: 'guild_3',
    label: 'Ancient Seal',
    image: require('../../../assets/guilds/Another Sigil_.jpg'),
  },
  {
    id: 'guild_4',
    label: 'Shadow Crest',
    image: require('../../../assets/guilds/download (1).jpg'),
  },
  {
    id: 'guild_5',
    label: 'Dragon Fang',
    image: require('../../../assets/guilds/download.jpg'),
  },
  {
    id: 'guild_6',
    label: 'Trias',
    image: require('../../../assets/guilds/TRIAS.jpg'),
  },
];

interface GuildEmblemProps {
  emblem: GuildEmblemType | string;
  size?: number;
  borderRadius?: number;
}

export default function GuildEmblem({ emblem, size = 48, borderRadius }: GuildEmblemProps) {
  const imageSource = GUILD_IMAGES_MAP[emblem] || GUILD_IMAGES_MAP.guild_1;
  const radius = borderRadius !== undefined ? borderRadius : size / 2;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: radius,
        },
      ]}
    >
      <Image
        source={imageSource}
        style={[
          styles.image,
          {
            width: '100%',
            height: '100%',
          },
        ]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#181A20',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  image: {
    backgroundColor: '#000000',
  },
});
