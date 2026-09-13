import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Shield, Users, ChevronRight, Swords, Compass } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useGuild } from '../../context/GuildContext';
import { typography } from '../../styles/typography';

const ACCENT_BLUE = '#4080E7';

export default function GuildAffiliationCard() {
  const router = useRouter();
  const { currentGuild } = useGuild();

  const handleGuildPress = () => {
    router.push('/(tabs)/friends' as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>GUILD AFFILIATION</Text>

      <View style={styles.card}>
        {currentGuild ? (
          <View style={styles.guildContent}>
            <View style={styles.guildTopRow}>
              <View style={styles.guildLeft}>
                <View style={styles.emblemCircle}>
                  <Shield size={24} color={ACCENT_BLUE} />
                </View>
                <View style={styles.guildMeta}>
                  <Text style={styles.guildName}>{currentGuild.name}</Text>
                  <Text style={styles.guildMotto} numberOfLines={1}>
                    "{currentGuild.motto || 'Arise to Greatness'}"
                  </Text>
                </View>
              </View>

              <View style={styles.guildLevelPill}>
                <Text style={styles.guildLevelText}>LV.{currentGuild.level || 1}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Users size={14} color="rgba(255, 255, 255, 0.6)" />
                <Text style={styles.statText}>
                  {currentGuild.members?.length || 1} Members
                </Text>
              </View>
              <View style={styles.statItem}>
                <Swords size={14} color="rgba(255, 255, 255, 0.6)" />
                <Text style={styles.statText}>Raid Guild</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.8}
              onPress={handleGuildPress}
            >
              <Text style={styles.actionBtnText}>VIEW GUILD HALL & RAIDS</Text>
              <ChevronRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noGuildContent}>
            <View style={styles.noGuildTop}>
              <View style={styles.unaffiliatedIconBox}>
                <Compass size={24} color={ACCENT_BLUE} />
              </View>
              <View style={styles.noGuildTextCol}>
                <Text style={styles.noGuildTitle}>Lone Wolf Hunter</Text>
                <Text style={styles.noGuildDesc}>
                  Join a guild to unlock cooperative Dungeon Raids, Guild Duels, and EXP multipliers.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.joinGuildBtn}
              activeOpacity={0.8}
              onPress={handleGuildPress}
            >
              <Text style={styles.joinGuildBtnText}>FIND & JOIN A GUILD</Text>
              <ChevronRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  sectionTitle: {
    ...typography.h2,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
  },
  guildContent: {
    gap: 14,
  },
  guildTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guildLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  emblemCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(64, 128, 231, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guildMeta: {
    flex: 1,
    gap: 2,
  },
  guildName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  guildMotto: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  guildLevelPill: {
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
    borderWidth: 1,
    borderColor: ACCENT_BLUE,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  guildLevelText: {
    fontSize: 11,
    fontWeight: '800',
    color: ACCENT_BLUE,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.4)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  noGuildContent: {
    gap: 14,
  },
  noGuildTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  unaffiliatedIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(64, 128, 231, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noGuildTextCol: {
    flex: 1,
    gap: 3,
  },
  noGuildTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  noGuildDesc: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 16,
  },
  joinGuildBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ACCENT_BLUE,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  joinGuildBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
