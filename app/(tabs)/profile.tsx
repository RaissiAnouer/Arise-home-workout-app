import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Platform,
  Alert,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Camera,
  Gauge,
  Dumbbell,
  Footprints,
  Heart,
  Brain,
  Eye,
  Database,
  HardDrive,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useProgression } from '../../src/context/ProgressionContext';
import ProfileStatsPane from '../../src/components/profile/ProfileStatsPane';
import RadarChart from '../../src/components/RadarChart';
import { typography } from '../../src/styles/typography';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BG_IMAGE = require('../../src/images/challenge_bg.jpg');
const DEFAULT_AVATAR = require('../../src/images/avatar_placeholder.png');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.30;
const AVATAR_SIZE = 96;
const ACCENT_BLUE = '#4080E7';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    profilePicture,
    updateProfilePicture,
    hunterName,
    userId,
    updateHunterName,
    attributes,
  } = useProgression();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(hunterName);
  const [authInfo, setAuthInfo] = useState<{
    isGuest?: boolean;
    email?: string | null;
    storage?: string;
  } | null>(null);

  React.useEffect(() => {
    AsyncStorage.getItem('@arise_auth_user').then((res) => {
      if (res) {
        try {
          setAuthInfo(JSON.parse(res));
        } catch {}
      }
    });
  }, []);

  // Scroll animation for cover header rubber-band zoom & parallax
  const scrollY = useRef(new Animated.Value(0)).current;

  // Header translateY:
  // When pulling down (scrollY < 0), shifts down to keep top edge pinned during scale
  // When scrolling up (scrollY > 0), moves up at parallax speed
  const headerTranslateY = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0, HERO_HEIGHT],
    outputRange: [HERO_HEIGHT / 2, 0, -HERO_HEIGHT * 0.5],
    extrapolate: 'clamp',
  });

  // Header scale: expands on pull-down (overscroll), stays 1.0 on scroll up
  const headerScale = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0],
    outputRange: [2, 1],
    extrapolateRight: 'clamp',
  });

  // Header opacity: fades smoothly when scrolling up through profile cards
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT * 0.8],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Radar chart attributes
  const radarAttributes = useMemo(() => [
    { name: 'STR', value: attributes?.STR || 10 },
    { name: 'AGI', value: attributes?.AGI || 10 },
    { name: 'VIT', value: attributes?.VIT || 10 },
    { name: 'INT', value: attributes?.INT || 10 },
    { name: 'PER', value: attributes?.PER || 10 },
  ], [attributes]);

  const maxRadarValue = useMemo(() => {
    const vals = radarAttributes.map(a => a.value);
    return Math.max(40, Math.ceil(Math.max(...vals) / 10) * 10 + 10);
  }, [radarAttributes]);

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
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top Header Hero Background with Rubber-Band Zoom & Parallax */}
      <Animated.View
        style={[
          styles.heroWrapper,
          {
            transform: [
              { translateY: headerTranslateY },
              { scale: headerScale },
            ],
            opacity: headerOpacity,
          },
        ]}
        pointerEvents="none"
      >
        <Image
          source={BG_IMAGE}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Gradient Fade to black at bottom */}
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.45)', '#000000']}
          style={styles.heroGradient}
        />
      </Animated.View>

      {/* Profile Page Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Spacer matching hero height to position avatar and cards seamlessly */}
        <View style={styles.heroSpacer} />

        {/* Centered Profile Avatar directly under the image */}
        <View style={styles.avatarSection}>
            <Pressable
              style={({ pressed }) => [
                styles.avatarWrapper,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
              onPress={handleAvatarPress}
            >
              <Image
                source={profilePicture ? { uri: profilePicture } : DEFAULT_AVATAR}
                style={styles.avatarImage}
              />
              <View style={styles.cameraBadge}>
                <Camera size={14} color="#000000" strokeWidth={2.4} />
              </View>
            </Pressable>

            {/* Hunter Name */}
            {isEditingName ? (
              <TextInput
                style={styles.nameInput}
                value={editName}
                onChangeText={setEditName}
                onBlur={() => {
                  updateHunterName(editName);
                  setIsEditingName(false);
                }}
                onSubmitEditing={() => {
                  updateHunterName(editName);
                  setIsEditingName(false);
                }}
                autoFocus
                maxLength={20}
                placeholderTextColor="rgba(255,255,255,0.3)"
                placeholder="Enter name"
                selectionColor={ACCENT_BLUE}
              />
            ) : (
              <Pressable
                onPress={() => {
                  setEditName(hunterName);
                  setIsEditingName(true);
                }}
                hitSlop={8}
              >
                <Text style={styles.hunterNameText}>{hunterName}</Text>
              </Pressable>
            )}

            {/* User ID Tag */}
            {userId ? (
              <Text style={styles.userIdText}>#{userId}</Text>
            ) : null}

            {/* Account Storage Status */}
            <Pressable
              style={styles.accountBadge}
              onPress={() => router.push('/auth' as any)}
            >
              {authInfo?.isGuest ? (
                <>
                  <HardDrive size={11} color="#8E8E93" />
                  <Text style={styles.accountBadgeGuest}>LOCALHOST MODE • TAP TO SYNC</Text>
                </>
              ) : (
                <>
                  <Database size={11} color="#30D158" />
                  <Text style={styles.accountBadgeCloud}>
                    {authInfo?.email ? `CLOUD SYNCED: ${authInfo.email}` : 'DATABASE CONNECTED'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Four-Column Statistics Pane */}
          <ProfileStatsPane />

          {/* ─── MAIN CONTENT SECTIONS ─── */}
          <View style={styles.mainContent}>

            {/* Core Attributes & Fatigue (Centered, open layout) */}
            <View style={styles.attributesSection}>
              <View style={styles.attributesGrid}>
                {/* Left Column: STR, AGI, VIT */}
                <View style={styles.attrCol}>
                  <View style={styles.attrItem}>
                    <View style={styles.attrIconWrapper}>
                      <Dumbbell size={15} color="#9E9E9E" />
                    </View>
                    <Text style={styles.attrLabel}>STR:</Text>
                    <Text style={styles.attrValue}>{attributes?.STR || 10}</Text>
                  </View>

                  <View style={styles.attrItem}>
                    <View style={styles.attrIconWrapper}>
                      <Footprints size={15} color="#9E9E9E" />
                    </View>
                    <Text style={styles.attrLabel}>AGI:</Text>
                    <Text style={styles.attrValue}>{attributes?.AGI || 10}</Text>
                  </View>

                  <View style={styles.attrItem}>
                    <View style={styles.attrIconWrapper}>
                      <Heart size={15} color="#9E9E9E" />
                    </View>
                    <Text style={styles.attrLabel}>VIT:</Text>
                    <Text style={styles.attrValue}>{attributes?.VIT || 10}</Text>
                  </View>
                </View>

                {/* Right Column: INT, PER, FATIGUE */}
                <View style={styles.attrCol}>
                  <View style={styles.attrItem}>
                    <View style={styles.attrIconWrapper}>
                      <Brain size={15} color="#9E9E9E" />
                    </View>
                    <Text style={styles.attrLabel}>INT:</Text>
                    <Text style={styles.attrValue}>{attributes?.INT || 10}</Text>
                  </View>

                  <View style={styles.attrItem}>
                    <View style={styles.attrIconWrapper}>
                      <Eye size={15} color="#9E9E9E" />
                    </View>
                    <Text style={styles.attrLabel}>PER:</Text>
                    <Text style={styles.attrValue}>{attributes?.PER || 10}</Text>
                  </View>

                  <View style={styles.attrItem}>
                    <View style={styles.attrIconWrapper}>
                      <Gauge size={15} color="#10B981" />
                    </View>
                    <Text style={styles.attrLabel}>FATIGUE:</Text>
                    <Text style={[styles.attrValue, { color: '#10B981' }]}>0</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 2. ATTRIBUTE RADAR ANALYSIS */}
            <View style={styles.sectionWrapper}>
              <Text style={styles.sectionTitle}>ATTRIBUTE DISTRIBUTION</Text>
              <View style={styles.radarCard}>
                <RadarChart
                  attributes={radarAttributes}
                  maxValue={maxRadarValue}
                  size={260}
                />
                <View style={styles.radarLegendRow}>
                  <View style={styles.radarLegendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#00A3FF' }]} />
                    <Text style={styles.legendText}>Combat Prowess Profile</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  heroWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
    overflow: 'hidden',
    zIndex: 0,
  },
  heroSpacer: {
    height: HERO_HEIGHT,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HERO_HEIGHT * 0.65,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  avatarSection: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    marginTop: -(AVATAR_SIZE / 2),
  },
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: '#000000',
    backgroundColor: '#12141C',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: (AVATAR_SIZE / 2) - 3,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 20,
  },
  hunterNameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 14,
    letterSpacing: 0.3,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 14,
    letterSpacing: 0.3,
    borderBottomWidth: 1,
    borderBottomColor: '#4080E7',
    paddingBottom: 4,
    paddingHorizontal: 8,
    minWidth: 120,
    textAlign: 'center',
  },
  userIdText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.35)',
    marginTop: 4,
    letterSpacing: 1,
  },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  accountBadgeGuest: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  accountBadgeCloud: {
    fontSize: 10,
    color: '#30D158',
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  // ─── Fatigue & Attributes (Centered, open layout) ───
  attributesSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  attributesGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 64,
  },
  attrCol: {
    gap: 18,
  },
  attrItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  attrIconWrapper: {
    width: 22,
    alignItems: 'center',
  },
  attrLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.55)',
    marginRight: 2,
  },
  attrValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },


  // ─── 2. Sections & Radar ───
  sectionWrapper: {
    gap: 10,
  },
  sectionTitle: {
    ...typography.h2,
  },
  radarCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  radarLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
});
