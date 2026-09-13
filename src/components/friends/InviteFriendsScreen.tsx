import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  Share,
  Platform,
} from 'react-native';
import { ChevronLeft, Search, Check, Share2, UserPlus, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { typography } from '../../styles/typography';
import Avatar from '../Avatar';

const ACCENT_BLUE = '#4080E7';
const STORAGE_KEY = '@arise_invited_contacts_v1';

export interface ContactItem {
  id: string;
  name: string;
  phone: string;
  avatar?: string | null;
  avatarColor: string;
  initials: string;
}

export const INITIAL_CONTACTS: ContactItem[] = [
  { id: 'c1', name: 'Mary Pace', phone: '+(406) 555-0120', avatarColor: '#F59E0B', initials: 'MP' },
  { id: 'c2', name: 'John Smith', phone: '+(256) 289-9707', avatarColor: '#3B82F6', initials: 'JS' },
  { id: 'c3', name: 'Esther Howard', phone: '+(818) 313-7673', avatarColor: '#EC4899', initials: 'EH' },
  { id: 'c4', name: 'Robert Fox', phone: '+(907) 248-8330', avatarColor: '#10B981', initials: 'RF' },
  { id: 'c5', name: 'Kristin Watson', phone: '+(347) 438-7215', avatarColor: '#8B5CF6', initials: 'KW' },
  { id: 'c6', name: 'Anne Russell', phone: '+(907) 623-2338', avatarColor: '#EF4444', initials: 'AR' },
  { id: 'c7', name: 'Teresa Webb', phone: '+(256) 289-9707', avatarColor: '#14B8A6', initials: 'TW' },
  { id: 'c8', name: 'Jack McKinney', phone: '+(208) 555-8989', avatarColor: '#F97316', initials: 'JM' },
  { id: 'c9', name: 'Leonard Ward', phone: '+(312) 555-0142', avatarColor: '#6366F1', initials: 'LW' },
  { id: 'c10', name: 'Devon Lane', phone: '+(603) 555-0123', avatarColor: '#06B6D4', initials: 'DL' },
  { id: 'c11', name: 'Cody Fisher', phone: '+(704) 555-0127', avatarColor: '#84CC16', initials: 'CF' },
  { id: 'c12', name: 'Bessie Cooper', phone: '+(480) 555-0103', avatarColor: '#E11D48', initials: 'BC' },
];

interface InviteFriendsScreenProps {
  onBack: () => void;
  onFriendInvited?: (contact: ContactItem) => void;
  onInviteSent?: (contact: ContactItem) => void;
  activeFriendIds?: Set<string>;
}

export default function InviteFriendsScreen({
  onBack,
  onFriendInvited,
  onInviteSent,
  activeFriendIds = new Set(),
}: InviteFriendsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadInvitedState();
  }, []);

  const loadInvitedState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setInvitedIds(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.error('Failed to load invited contacts', e);
    }
  };

  const handleSendInvite = async (item: ContactItem) => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (activeFriendIds.has(item.id)) {
      return; // already friends
    }

    const next = new Set(invitedIds);
    if (next.has(item.id)) {
      // Already sent
      return;
    } else {
      next.add(item.id);
      if (onInviteSent) {
        onInviteSent(item);
      }
    }

    setInvitedIds(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
    } catch (e) {
      console.error('Failed to save invited contacts', e);
    }
  };

  const handleShareLink = async () => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    try {
      await Share.share({
        message: 'Join me on Arise to track workouts, level up your hunter rank, and crush daily training quests together! Download: https://arise.app/invite',
        title: 'Join me on Arise!',
      });
    } catch (e) {
      console.error('Share error', e);
    }
  };

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return INITIAL_CONTACTS;
    const q = searchQuery.toLowerCase().trim();
    return INITIAL_CONTACTS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [searchQuery]);

  const renderContactItem = ({ item }: { item: ContactItem }) => {
    const isFriend = activeFriendIds.has(item.id);
    const isInvited = invitedIds.has(item.id);

    return (
      <View style={styles.contactRow}>
        {/* Avatar Circle */}
        <Avatar
          source={item.avatar}
          size={40}
          borderColor={item.avatarColor}
          borderWidth={1.5}
        />

        {/* Info Column */}
        <View style={styles.contactInfo}>
          <Text style={styles.contactName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.contactPhone}>{item.phone}</Text>
        </View>

        {/* Action Button: Friends vs Request Sent vs Invite */}
        {isFriend ? (
          <View style={[styles.invitePillBtn, styles.friendsPillBtn]}>
            <Check size={13} color="#4080E7" strokeWidth={2.5} />
            <Text style={styles.friendsPillText}>Friends</Text>
          </View>
        ) : isInvited ? (
          <View style={[styles.invitePillBtn, styles.invitedPillBtn]}>
            <View style={styles.invitedBtnContent}>
              <Check size={13} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.invitedPillText}>Request Sent</Text>
            </View>
          </View>
        ) : (
          <Pressable
            style={styles.invitePillBtn}
            onPress={() => handleSendInvite(item)}
            hitSlop={6}
          >
            <Text style={styles.invitePillText}>Invite</Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Invite friends</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Search size={18} color="rgba(255, 255, 255, 0.4)" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor="rgba(255, 255, 255, 0.35)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />
      </View>

      {/* Quick Share Link Banner */}
      <Pressable style={styles.shareBanner} onPress={handleShareLink}>
        <View style={styles.shareIconBox}>
          <Share2 size={16} color={ACCENT_BLUE} />
        </View>
        <View style={styles.shareTextCol}>
          <Text style={styles.shareTitle}>Share Invite Link</Text>
          <Text style={styles.shareSubtitle}>Invite anyone via WhatsApp, SMS, or Telegram</Text>
        </View>
      </Pressable>

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContactItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerRow: {
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
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  headerSpacer: {
    width: 36,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 10,
    padding: 0,
  },
  shareBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(64, 128, 231, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.25)',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  shareIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(64, 128, 231, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  shareTextCol: {
    flex: 1,
  },
  shareTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shareSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  invitePillBtn: {
    backgroundColor: ACCENT_BLUE,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 74,
  },
  invitedPillBtn: {
    backgroundColor: '#27272A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
  },
  friendsPillBtn: {
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.3)',
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 14,
  },
  friendsPillText: {
    color: '#4080E7',
    fontSize: 12,
    fontWeight: '700',
  },
  invitePillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  invitedBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  invitedPillText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
});
