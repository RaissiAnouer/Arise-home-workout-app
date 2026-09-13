import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Check,
  Users,
  Shield,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useGuild } from '../../context/GuildContext';
import { Guild } from '../../types/guild';
import { GUILD_IMAGES_MAP } from './GuildEmblem';
import { typography } from '../../styles/typography';

const ACCENT_BLUE = '#4080E7';

interface JoinGuildModalProps {
  visible: boolean;
  onClose: () => void;
  onGuildJoined?: (guildName: string) => void;
}

export default function JoinGuildModal({ visible, onClose, onGuildJoined }: JoinGuildModalProps) {
  const insets = useSafeAreaInsets();
  const { guilds, joinGuild, requestToJoinGuild, sentRequestGuildIds } = useGuild();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleJoinOrRequest = async (guild: Guild) => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (guild.isPrivate) {
      const res = await requestToJoinGuild(guild.id);
      triggerToast(res.message);
    } else {
      const res = await joinGuild(guild.id);
      if (res.success) {
        if (onGuildJoined) onGuildJoined(guild.name);
        onClose();
      } else {
        triggerToast(res.message);
      }
    }
  };

  const renderGuildCard = ({ item }: { item: Guild }) => {
    const isFull = item.memberCount >= item.maxMembers;
    const hasRequested = sentRequestGuildIds.has(item.id);
    const bgImage = GUILD_IMAGES_MAP[item.emblem] || GUILD_IMAGES_MAP.guild_1;

    return (
      <View style={styles.guildCard}>
        {/* Profile Guild Picture as Background */}
        <Image
          source={bgImage}
          style={styles.cardBgImage}
          resizeMode="cover"
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.4)', 'rgba(10,10,12,0.95)']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Top Badges Row */}
        <View style={styles.cardTopRow}>
          {/* Top Left: Level */}
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Lv.{item.level}</Text>
          </View>

          {/* Top Right: Number of Hunters */}
          <View style={styles.huntersBadge}>
            <Users size={11} color="#4080E7" strokeWidth={2.5} />
            <Text style={styles.huntersBadgeText}>
              {item.memberCount}/{item.maxMembers}
            </Text>
          </View>
        </View>

        {/* Bottom Content Area */}
        <View style={styles.cardBottom}>
          <Text style={styles.guildName} numberOfLines={1}>
            {item.name}
          </Text>

          {/* Action CTA Button */}
          <View style={styles.actionBtnWrap}>
            {isFull ? (
              <View style={styles.fullBtn}>
                <Text style={styles.fullBtnText}>FULL</Text>
              </View>
            ) : hasRequested ? (
              <View style={styles.requestedBtn}>
                <Check size={12} color="#4080E7" strokeWidth={2.5} />
                <Text style={styles.requestedBtnText}>REQUESTED</Text>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  item.isPrivate ? styles.requestBtn : styles.joinBtn,
                  pressed && styles.btnPressed,
                ]}
                onPress={() => handleJoinOrRequest(item)}
              >
                <Text style={item.isPrivate ? styles.requestBtnText : styles.joinBtnText}>
                  {item.isPrivate ? 'REQUEST' : 'JOIN'}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.backBtn} hitSlop={8}>
            <ChevronLeft size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Hunter Guild Registry</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Toast Alert */}
        {toastMessage && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        {/* Section Heading */}
        <View style={styles.topHeadingSection}>
          <Text style={styles.topHeadingTitle}>Choose a Guild</Text>
        </View>

        {/* Guilds List (2 Cards Per Line) */}
        <FlatList
          key="guild_grid_2"
          data={guilds}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={renderGuildCard}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Shield size={36} color="rgba(255, 255, 255, 0.3)" />
              <Text style={styles.emptyTitle}>No Guilds Found</Text>
              <Text style={styles.emptySub}>
                Try adjusting your search terms or filter selection.
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E10',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 36,
  },
  toastContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 99,
    backgroundColor: '#1E2028',
    borderColor: 'rgba(64, 128, 231, 0.5)',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  topHeadingSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  topHeadingTitle: {
    ...typography.h2,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  guildCard: {
    flex: 1,
    height: 460,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#181A20',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'space-between',
    padding: 12,
    position: 'relative',
  },
  cardBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  huntersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  huntersBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardBottom: {
    gap: 8,
    alignItems: 'center',
  },
  guildName: {
    ...typography.h2,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  actionBtnWrap: {
    width: '100%',
  },
  joinBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  joinBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  requestBtn: {
    backgroundColor: '#4080E7',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  requestBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  requestedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(64, 128, 231, 0.18)',
    borderColor: 'rgba(64, 128, 231, 0.4)',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    width: '100%',
  },
  requestedBtnText: {
    color: '#4080E7',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  fullBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  fullBtnText: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 11,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.45)',
    textAlign: 'center',
  },
});
