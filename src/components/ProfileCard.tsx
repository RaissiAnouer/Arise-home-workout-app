import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {
  Plus,
  Sparkles,
  Heart,
  Footprints,
  Brain,
  Dumbbell,
  Eye,
  Camera,
  Gauge,
  Zap,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useProgression } from '../context/ProgressionContext';

const { width } = Dimensions.get('window');

const BORDER_WHITE = '#FFFFFF';
const BORDER_MUTED = 'rgba(255, 255, 255, 0.25)';
const ICON_GRAY = '#9E9E9E';
const TEXT_MUTED = '#A0A0A0';
const CARD_BG = '#121216';
const SUBPANEL_BG = 'rgba(255, 255, 255, 0.04)';

export default function ProfileCard() {
  const {
    level,
    xp,
    xpToNextLevel,
    rankTitle,
    activeTitle,
    skillPoints,
    attributes,
    profilePicture,
    updateProfilePicture,
  } = useProgression();

  const handleAvatarPress = async () => {
    if (Platform.OS === 'web') {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        window.alert('Permission to access camera roll is required!');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        updateProfilePicture(uri);
      }
      return;
    }

    Alert.alert(
      'Profile Picture',
      'Choose an option to update your profile picture:',
      [
        {
          text: 'Choose from Library',
          onPress: async () => {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
              Alert.alert('Permission to access camera roll is required!');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
              base64: true,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              const asset = result.assets[0];
              const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
              updateProfilePicture(uri);
            }
          },
        },
        {
          text: 'Take Photo',
          onPress: async () => {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
              Alert.alert('Permission to access camera is required!');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
              base64: true,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              const asset = result.assets[0];
              const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
              updateProfilePicture(uri);
            }
          },
        },
        {
          text: 'Remove Photo',
          style: 'destructive',
          onPress: () => {
            updateProfilePicture('');
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const maxHp = level * 1000 + 3290;
  const currentHp = maxHp;

  const hpPercent = maxHp > 0 ? Math.min(100, Math.max(8, (currentHp / maxHp) * 100)) : 0;
  const expPercent = xpToNextLevel > 0 ? Math.min(100, Math.max(8, (xp / xpToNextLevel) * 100)) : 0;

  return (
    <View style={styles.cardContainer}>
      {/* 1. Header: STATUS Outlined Box (on top of profile image) */}
      <View style={styles.statusHeaderRow}>
        <View style={styles.statusHeaderBox}>
          <Text style={styles.statusHeaderText}>STATUS</Text>
        </View>
      </View>

      {/* 2. Profile Avatar (beneath STATUS header) */}
      <View style={styles.avatarSection}>
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={handleAvatarPress}
          activeOpacity={0.85}
        >
          <View style={styles.avatarGlow}>
            <Image
              source={
                profilePicture
                  ? { uri: profilePicture }
                  : require('../images/avatar_placeholder.png')
              }
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.cameraBadge}>
            <Camera size={13} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* 3. Main Holographic STATUS Window */}
      <View style={styles.statusWindow}>
        {/* Corner Brackets */}
        <View style={[styles.cornerBracket, styles.topLeftBracket]} />
        <View style={[styles.cornerBracket, styles.topRightBracket]} />
        <View style={[styles.cornerBracket, styles.bottomLeftBracket]} />
        <View style={[styles.cornerBracket, styles.bottomRightBracket]} />

        {/* Top Section: LEVEL + JOB / TITLE */}
        <View style={styles.levelJobSection}>
          <View style={styles.levelCol}>
            <Text style={styles.levelValue}>{level}</Text>
            <Text style={styles.levelTitle}>LEVEL</Text>
          </View>

          <View style={styles.jobTitleCol}>
            <View style={styles.jobTitleRow}>
              <Text style={styles.metaLabel}>JOB:</Text>
              <Text style={styles.metaValue} numberOfLines={1}>
                {rankTitle || 'None'}
              </Text>
            </View>
            <View style={styles.jobTitleRow}>
              <Text style={styles.metaLabel}>TITLE:</Text>
              <Text style={styles.metaValue} numberOfLines={1}>
                {activeTitle || 'None'}
              </Text>
            </View>
          </View>
        </View>

        {/* Resource Bars Subpanel: HP, EXP, FATIGUE */}
        <View style={styles.resourceSubpanel}>
          {/* EXP Bar */}
          <View style={styles.resourceBarBlock}>
            <View style={styles.resourceHeader}>
              <Zap size={14} color={ICON_GRAY} />
              <Text style={styles.resourceName}>EXP</Text>
            </View>
            <View style={styles.capsuleTrack}>
              <View style={[styles.capsuleFill, { width: `${expPercent}%` }]} />
            </View>
            <Text style={styles.resourceNumText}>
              {Math.floor(xp)} <Text style={styles.resourceMaxText}>/ {xpToNextLevel}</Text>
            </Text>
          </View>

          {/* HP Bar */}
          <View style={styles.resourceBarBlock}>
            <View style={styles.resourceHeader}>
              <Plus size={14} color={ICON_GRAY} strokeWidth={2.5} />
              <Text style={styles.resourceName}>HP</Text>
            </View>
            <View style={styles.capsuleTrack}>
              <View style={[styles.capsuleFill, { width: `${hpPercent}%` }]} />
            </View>
            <Text style={styles.resourceNumText}>
              {currentHp} <Text style={styles.resourceMaxText}>/ {maxHp}</Text>
            </Text>
          </View>

          {/* Fatigue Meter */}
          <View style={styles.fatigueBlock}>
            <Gauge size={16} color={ICON_GRAY} />
            <Text style={styles.fatigueLabel}>
              FATIGUE: <Text style={styles.fatigueVal}>0</Text>
            </Text>
          </View>
        </View>

        {/* Bottom Attributes Subpanel */}
        <View style={styles.attributesSubpanel}>
          {/* Left Column: STR, AGI, PER */}
          <View style={styles.attrCol}>
            {/* STR */}
            <View style={styles.attrItem}>
              <View style={styles.attrIconWrapper}>
                <Dumbbell size={16} color={ICON_GRAY} />
              </View>
              <Text style={styles.attrLabel}>STR:</Text>
              <Text style={styles.attrValue}>{attributes.STR}</Text>
            </View>

            {/* AGI */}
            <View style={styles.attrItem}>
              <View style={styles.attrIconWrapper}>
                <Footprints size={16} color={ICON_GRAY} />
              </View>
              <Text style={styles.attrLabel}>AGI:</Text>
              <Text style={styles.attrValue}>{attributes.AGI}</Text>
            </View>

            {/* PER */}
            <View style={styles.attrItem}>
              <View style={styles.attrIconWrapper}>
                <Eye size={16} color={ICON_GRAY} />
              </View>
              <Text style={styles.attrLabel}>PER:</Text>
              <Text style={styles.attrValue}>{attributes.PER}</Text>
            </View>
          </View>

          {/* Right Column: VIT, INT, Ability Points */}
          <View style={styles.attrCol}>
            {/* VIT */}
            <View style={styles.attrItem}>
              <View style={styles.attrIconWrapper}>
                <Heart size={16} color={ICON_GRAY} />
              </View>
              <Text style={styles.attrLabel}>VIT:</Text>
              <Text style={styles.attrValue}>{attributes.VIT}</Text>
            </View>

            {/* INT */}
            <View style={styles.attrItem}>
              <View style={styles.attrIconWrapper}>
                <Brain size={16} color={ICON_GRAY} />
              </View>
              <Text style={styles.attrLabel}>INT:</Text>
              <Text style={styles.attrValue}>{attributes.INT}</Text>
            </View>

            {/* Available Ability Points */}
            <View style={styles.apItem}>
              <View style={styles.apTextGroup}>
                <Text style={styles.apLabelSmall}>Available</Text>
                <Text style={styles.apLabelSmall}>Ability</Text>
                <Text style={styles.apLabelSmall}>Points</Text>
              </View>
              <Text style={styles.apBigNumber}>{skillPoints}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
  },

  // 1. STATUS Header Box
  statusHeaderRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusHeaderBox: {
    borderWidth: 1.5,
    borderColor: BORDER_WHITE,
    paddingHorizontal: 36,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusHeaderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 6,
  },

  // 2. Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlow: {
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  avatarImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#16171C',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2A2B32',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#000000',
  },

  // 3. Main Status Window
  statusWindow: {
    backgroundColor: CARD_BG,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: BORDER_WHITE,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    position: 'relative',
    gap: 16,
  },

  // Corner Accent Brackets
  cornerBracket: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderColor: BORDER_WHITE,
  },
  topLeftBracket: {
    top: -2,
    left: -2,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  topRightBracket: {
    top: -2,
    right: -2,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bottomLeftBracket: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRightBracket: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },

  // Level & Job/Title
  levelJobSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 28,
  },
  levelCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelValue: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 46,
  },
  levelTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_MUTED,
    letterSpacing: 2,
    marginTop: 2,
  },
  jobTitleCol: {
    gap: 8,
    justifyContent: 'center',
  },
  jobTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  metaValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Resource Bars Subpanel
  resourceSubpanel: {
    backgroundColor: SUBPANEL_BG,
    borderWidth: 1,
    borderColor: BORDER_MUTED,
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  resourceBarBlock: {
    flex: 1,
    gap: 4,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resourceName: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  capsuleTrack: {
    height: 8,
    backgroundColor: '#16171C',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
  },
  capsuleFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  },
  resourceNumText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  resourceMaxText: {
    color: TEXT_MUTED,
    fontSize: 8,
  },
  fatigueBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingLeft: 4,
  },
  fatigueLabel: {
    color: TEXT_MUTED,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fatigueVal: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Attributes Subpanel
  attributesSubpanel: {
    backgroundColor: SUBPANEL_BG,
    borderWidth: 1,
    borderColor: BORDER_MUTED,
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attrCol: {
    flex: 1,
    gap: 14,
  },
  attrItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attrIconWrapper: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attrLabel: {
    color: TEXT_MUTED,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    width: 38,
  },
  attrValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Available Ability Points
  apItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 2,
  },
  apTextGroup: {
    alignItems: 'flex-start',
  },
  apLabelSmall: {
    fontSize: 8,
    lineHeight: 10,
    color: TEXT_MUTED,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  apBigNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
