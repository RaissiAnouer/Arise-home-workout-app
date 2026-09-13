import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, X, UserPlus, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { typography } from '../../styles/typography';
import Avatar from '../Avatar';

const ACCENT_BLUE = '#4080E7';

interface MockHunter {
  id: string;
  name: string;
  avatar?: string | null;
  rank: 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
  level: number;
  workouts: number;
}

const MOCK_HUNTERS: MockHunter[] = [
  { id: 'h1', name: 'SungJinWoo_99', rank: 'S', level: 85, workouts: 142 },
  { id: 'h2', name: 'ChaHaeIn', rank: 'S', level: 78, workouts: 115 },
  { id: 'h3', name: 'IronClad_Alex', rank: 'A', level: 45, workouts: 68 },
  { id: 'h4', name: 'ShadowMonarch', rank: 'A', level: 52, workouts: 80 },
  { id: 'h5', name: 'TitanHunter', rank: 'B', level: 34, workouts: 42 },
  { id: 'h6', name: 'Valkyrie_Nova', rank: 'B', level: 29, workouts: 35 },
  { id: 'h7', name: 'Rookie_Jin', rank: 'C', level: 18, workouts: 22 },
  { id: 'h8', name: 'IronBeast', rank: 'D', level: 12, workouts: 14 },
];

interface SearchFriendsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SearchFriendsModal({ visible, onClose }: SearchFriendsModalProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (visible) {
      setQuery('');
    }
  }, [visible]);

  const hasQuery = query.trim().length > 0;

  const filteredHunters = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return MOCK_HUNTERS.filter((h) => h.name.toLowerCase().includes(q));
  }, [query]);

  const handleSendRequest = (hunterId: string) => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSentRequests((prev) => new Set(prev).add(hunterId));
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'S':
        return '#F59E0B';
      case 'A':
        return '#EC4899';
      case 'B':
        return '#3B82F6';
      case 'C':
        return '#10B981';
      case 'D':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.dialogCard, { marginBottom: insets.bottom + 20 }]}>
          {/* Header */}
          <View style={styles.dialogHeader}>
            <View style={styles.headerTitleWrap}>
              <Search size={18} color={ACCENT_BLUE} strokeWidth={2.4} />
              <Text style={styles.dialogTitle}>FIND HUNTERS</Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <X size={18} color="rgba(255, 255, 255, 0.7)" />
            </Pressable>
          </View>

          {/* Search Input Bar */}
          <View style={styles.searchBar}>
            <Search size={16} color="rgba(255, 255, 255, 0.4)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by hunter name..."
              placeholderTextColor="rgba(255, 255, 255, 0.35)"
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              autoCapitalize="none"
              autoFocus={true}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={6}>
                <X size={15} color="rgba(255, 255, 255, 0.4)" />
              </Pressable>
            )}
          </View>

          {/* Hunter Results List or Empty State */}
          {hasQuery && filteredHunters.length === 0 ? (
            <View style={styles.emptyResultsContainer}>
              <Text style={styles.emptyResultsTitle}>NO HUNTER FOUND</Text>
              <Text style={styles.emptyResultsSub}>
                No hunter matching "{query.trim()}" was found in the System database.
              </Text>
            </View>
          ) : hasQuery ? (
            <FlatList
              data={filteredHunters}
              keyExtractor={(item) => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSent = sentRequests.has(item.id);
                const rankColor = getRankColor(item.rank);

                return (
                  <View style={styles.hunterRow}>
                    <Avatar
                      source={item.avatar}
                      size={34}
                      borderColor={rankColor}
                      borderWidth={1.5}
                    />

                    {/* Info */}
                    <View style={styles.hunterInfo}>
                      <Text style={styles.hunterName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.hunterMeta}>
                        LV.{item.level} • {item.workouts} Workouts
                      </Text>
                    </View>

                    {/* Action */}
                    <Pressable
                      style={[styles.addBtn, isSent && styles.addBtnSent]}
                      onPress={() => !isSent && handleSendRequest(item.id)}
                      disabled={isSent}
                    >
                      {isSent ? (
                        <>
                          <Check size={13} color="#10B981" strokeWidth={2.5} />
                          <Text style={styles.addBtnTextSent}>SENT</Text>
                        </>
                      ) : (
                        <>
                          <UserPlus size={13} color="#000000" strokeWidth={2.4} />
                          <Text style={styles.addBtnText}>ADD</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                );
              }}
            />
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: '#12141A',
    borderColor: 'rgba(64, 128, 231, 0.35)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dialogTitle: {
    ...typography.h2,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  list: {
    maxHeight: 280,
  },
  listContent: {
    gap: 10,
  },
  hunterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  rankAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankLetter: {
    fontSize: 14,
    fontWeight: '800',
  },
  hunterInfo: {
    flex: 1,
  },
  hunterName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hunterMeta: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnSent: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderWidth: 1,
  },
  addBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  addBtnTextSent: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  emptyResultsContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyResultsTitle: {
    ...typography.h2,
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  emptyResultsSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
});
