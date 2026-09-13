import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import {
  UserPlus,
  Search,
  Check,
  X,
  QrCode,
  Share2,
  Inbox,
  Send,
} from 'lucide-react-native';
import { FriendRequest } from '../../types/friends';
import { RANK_CONFIG } from '../../data/levelConfig';
import { typography } from '../../styles/typography';
import Avatar from '../Avatar';

type FriendsListSectionProps = {
  requests: FriendRequest[];
  onAcceptRequest: (id: string) => void;
  onDeclineRequest: (id: string) => void;
  onSendRequest?: (username: string) => void;
};

// ── Request Row Component ───────────────────────────────────────
function RequestRow({
  request,
  onAccept,
  onDecline,
}: {
  request: FriendRequest;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { from } = request;
  const rankColor = RANK_CONFIG[from.rank]?.color || '#4080E7';

  return (
    <View style={styles.requestRow}>
      <Avatar
        source={from.avatar}
        size={40}
        borderColor={rankColor}
        borderWidth={2}
      />

      <View style={styles.requestInfo}>
        <Text style={styles.requestName} numberOfLines={1}>{from.username}</Text>
        <Text style={styles.requestMeta}>Lv.{from.level} · {from.rank}-Rank</Text>
      </View>

      <View style={styles.requestActions}>
        <Pressable style={styles.acceptBtn} onPress={onAccept}>
          <Check size={16} color="#FFFFFF" />
        </Pressable>
        <Pressable style={styles.declineBtn} onPress={onDecline}>
          <X size={16} color="rgba(255,255,255,0.5)" />
        </Pressable>
      </View>
    </View>
  );
}

// ── Main Component ──────────────────────────────────────────────
export default function FriendsListSection({
  requests,
  onAcceptRequest,
  onDeclineRequest,
  onSendRequest,
}: FriendsListSectionProps) {
  const [searchText, setSearchText] = useState('');
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  const handleSendRequest = () => {
    const trimmed = searchText.trim();
    if (!trimmed) return;

    if (onSendRequest) {
      onSendRequest(trimmed);
    }
    setSentNotice(`Friend request sent to "${trimmed}"`);
    setSearchText('');
    setTimeout(() => setSentNotice(null), 3000);
  };

  return (
    <View style={styles.container}>
      {/* ── Add Friend Card Section ── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <UserPlus size={18} color="#4080E7" />
          <Text style={typography.h2}>Add Friend</Text>
        </View>

        <Text style={styles.cardSubtext}>
          Search for workout partners by username or share your invite link
        </Text>

        {/* Input & Action Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Search size={16} color="rgba(255,255,255,0.35)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter username..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSendRequest}
              returnKeyType="send"
              autoCapitalize="none"
            />
          </View>
          <Pressable
            style={[
              styles.sendBtn,
              !searchText.trim() && styles.sendBtnDisabled,
            ]}
            onPress={handleSendRequest}
            disabled={!searchText.trim()}
          >
            <Send size={16} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Notification Toast */}
        {sentNotice && (
          <View style={styles.noticeContainer}>
            <Check size={14} color="#34C759" />
            <Text style={styles.noticeText}>{sentNotice}</Text>
          </View>
        )}

        {/* Quick Action Buttons */}
        <View style={styles.quickActions}>
          <Pressable
            style={styles.quickActionBtn}
            onPress={() => Alert.alert('QR Code', 'Your QR code scanner is ready!')}
          >
            <QrCode size={18} color="#4080E7" />
            <Text style={styles.quickActionLabel}>QR Code</Text>
          </Pressable>
          <Pressable
            style={styles.quickActionBtn}
            onPress={() => Alert.alert('Invite Link', 'Invite link copied to clipboard!')}
          >
            <Share2 size={18} color="#4080E7" />
            <Text style={styles.quickActionLabel}>Share Invite</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Friend Requests Section ── */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeader}>
            <Inbox size={18} color="#4080E7" />
            <Text style={typography.h2}>Friend Requests</Text>
          </View>
          {pendingRequests.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{pendingRequests.length}</Text>
            </View>
          )}
        </View>

        {pendingRequests.length > 0 ? (
          <View style={styles.requestsList}>
            {pendingRequests.map((req) => (
              <RequestRow
                key={req.id}
                request={req}
                onAccept={() => onAcceptRequest(req.id)}
                onDecline={() => onDeclineRequest(req.id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Inbox size={36} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyTitle}>No Pending Requests</Text>
            <Text style={styles.emptySubtext}>
              When someone sends you a friend request, it will appear here.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingHorizontal: 20,
  },

  // Cards
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardSubtext: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: -4,
  },

  // Search & Send Row
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#4080E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Notice
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.25)',
  },
  noticeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
  },

  // Quick Action Buttons
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(64, 128, 231, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.2)',
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4080E7',
  },

  // Request Badge
  countBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4080E7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Requests List
  requestsList: {
    gap: 10,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  requestInfo: {
    flex: 1,
    gap: 2,
  },
  requestName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  requestMeta: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4080E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptySubtext: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
