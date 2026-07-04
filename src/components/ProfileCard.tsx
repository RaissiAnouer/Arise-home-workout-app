import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import RadarChart from './RadarChart';

const { width } = Dimensions.get('window');

const AvatarFrame = () => (
  <View style={styles.avatarContainer}>
    {/* High tech glow */}
    <View style={styles.avatarGlow} />
    <View style={styles.avatarBorder}>
      <Image 
        source={require('../images/e-rank-pic-removebg.png')} 
        style={styles.avatarImage} 
      />
    </View>
    <View style={styles.levelBadge}>
      <Text style={styles.levelBadgeText}>LV. 1</Text>
    </View>
  </View>
);

const HeaderRow = () => (
  <View style={styles.headerRow}>
    <View style={styles.headerLeft}>
      <Text style={styles.playerName} numberOfLines={1}>JUNG WIN JOO</Text>
      <Text style={styles.playerClass}>CLASS: NECROMANCER</Text>
    </View>
    <View style={styles.coinsContainer}>
      <Text style={styles.coinsAmount}>36</Text>
      <Text style={styles.coinsLabel}>COINS</Text>
    </View>
  </View>
);

const ResourceBar = ({ label, current, max, color, icon }: any) => {
  const percentage = (current / max) * 100;
  return (
    <View style={styles.resourceContainer}>
      <View style={styles.resourceHeader}>
        <View style={styles.resourceLabelContainer}>
          <Ionicons name={icon} size={14} color={color} />
          <Text style={[styles.resourceLabel, { color }]}>{label}</Text>
        </View>
        <Text style={styles.resourceValue}>{current} / {max}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const AttributeRadar = () => {
  const attributes = [
    { name: 'STR', value: 32 },
    { name: 'AGI', value: 27 },
    { name: 'VIT', value: 24 },
    { name: 'INT', value: 15 },
    { name: 'PER', value: 18 },
  ];

  return (
    <View style={styles.attributesContainer}>
      <Text style={styles.sectionTitle}>ATTRIBUTES RADAR</Text>
      <RadarChart attributes={attributes} maxValue={50} size={280} />
    </View>
  );
}

export default function ProfileCard() {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.contentContainer}>
        <AvatarFrame />
        <HeaderRow />
        
        <View style={styles.divider} />
        
        <View style={styles.resourcesSection}>
          <ResourceBar label="HP" current={910} max={1000} color="#FF3366" icon="heart" />
          <ResourceBar label="MP" current={150} max={300} color="#33CCFF" icon="water" />
          <ResourceBar label="EXP" current={310} max={500} color="#FFD700" icon="star" />
        </View>
        
        <View style={styles.divider} />
        
        <AttributeRadar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: width - 32,
    marginTop: 10,
  },
  contentContainer: {
    padding: 24,
    width: '100%',
  },
  
  // Avatar
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55, 
    backgroundColor: 'transparent',
    shadowColor: '#00A3FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 20,
  },
  avatarBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#00A3FF',
    padding: 2,
    backgroundColor: '#020D1A',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    backgroundColor: '#0B192C',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#00A3FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6F7FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  levelBadgeText: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 12,
    color: '#020D1A',
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  headerLeft: {
    flex: 1,
  },
  playerName: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 24,
    color: '#E6F7FF',
    letterSpacing: 2,
    textShadowColor: '#00A3FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  playerClass: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#00A3FF',
    letterSpacing: 3,
    marginTop: 4,
    opacity: 0.8,
  },
  coinsContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  coinsAmount: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 22,
    color: '#FFD700',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  coinsLabel: {
    fontFamily: 'LatoRegular',
    fontSize: 10,
    color: '#FFD700',
    letterSpacing: 2,
    marginTop: 2,
    opacity: 0.8,
  },
  
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 163, 255, 0.2)',
    marginVertical: 16,
    width: '100%',
  },

  // Resources (HP, MP, EXP)
  resourcesSection: {
    gap: 16,
  },
  resourceContainer: {
    width: '100%',
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  resourceLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resourceLabel: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 12,
    letterSpacing: 1,
  },
  resourceValue: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 12,
    color: '#CCCCCC',
  },
  barTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Attributes
  attributesContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#00A3FF',
    letterSpacing: 3,
    marginBottom: 16,
    textAlign: 'center',
  },

});
