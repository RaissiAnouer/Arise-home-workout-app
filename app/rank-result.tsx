import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAudioPlayer } from 'expo-audio';
import { useQuestionnaire } from '../src/context/QuestionnaireContext';
import { SystemNotification } from '../src/components/SystemNotification';

type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

const { height } = Dimensions.get('window');

const notificationSound = require('../src/sound effects/solo_leveling_notifcation_sound.mp3');

export default function RankResultScreen() {
  const { answers } = useQuestionnaire();
  const router = useRouter();
  const [rank, setRank] = useState<Rank>('E');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);

  // expo-audio hook — manages player lifecycle automatically
  const player = useAudioPlayer(notificationSound);

  // Animation values
  const scaleY = useRef(new Animated.Value(1)).current;
  const scaleX = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let score = 0;
    switch (answers.pushups) {
      case '0 - 5': score += 1; break;
      case '6 - 15': score += 2; break;
      case '16 - 30': score += 3; break;
      case '31+': score += 5; break;
      default: score += 1;
    }
    switch (answers.weeklyGoal) {
      case '2 DAYS': score += 1; break;
      case '3 DAYS': score += 2; break;
      case '4 DAYS': score += 3; break;
      case '5 DAYS': score += 4; break;
      case '6+ DAYS': score += 5; break;
      default: score += 1;
    }
    if (score >= 10) setRank('S');
    else if (score >= 9) setRank('A');
    else if (score >= 8) setRank('B');
    else if (score >= 6) setRank('C');
    else if (score >= 4) setRank('D');
    else setRank('E');
  }, [answers]);

  const getRankColor = (r: Rank) => {
    switch (r) {
      case 'S': return '#FFD700';
      case 'A': return '#FF4500';
      case 'B': return '#1b45d7';
      case 'C': return '#32CD32';
      case 'D': return '#A9A9A9';
      case 'E': return '#8B4513';
      default: return '#fff';
    }
  };

  const handleArise = () => {
    // TV Screen shut off animation
    Animated.sequence([
      Animated.timing(scaleY, {
        toValue: 0.005,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleX, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowSystemPrompt(true);
      // Play notification sound
      try {
        player.seekTo(0);
        player.play();
      } catch (e) {
        console.warn('Failed to play notification sound:', e);
      }
    });
  };

  const handleReject = () => {
    // Shake the notification left-right rapidly
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      {/* Original Content */}
      <Animated.View style={[
        styles.content,
        {
          opacity,
          transform: [
            { scaleY },
            { scaleX },
          ],
          display: showSystemPrompt ? 'none' : 'flex',
        }
      ]}>
        <Text style={styles.subtitle}>EVALUATION COMPLETE</Text>
        <Text style={styles.title}>YOUR HUNTER RANK IS</Text>
        
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, { color: getRankColor(rank) }]}>{rank}</Text>
        </View>

        <Text style={styles.description}>
          {rank === 'S' && "An absolute anomaly. Your power level is immeasurable."}
          {rank === 'A' && "Elite tier. You stand far above the average hunter."}
          {rank === 'B' && "High-tier combatant. You have solid potential."}
          {rank === 'C' && "Average hunter. Capable, but room to grow."}
          {rank === 'D' && "Below average. You must train harder to survive."}
          {rank === 'E' && "The Weakest Hunter. But this is just the beginning."}
        </Text>

        <Pressable style={styles.button} onPress={handleArise}>
          <Text style={styles.buttonText}>ARISE</Text>
        </Pressable>
      </Animated.View>

      {/* System Prompt Overlay */}
      {showSystemPrompt && (
        <View style={styles.systemOverlay}>
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <SystemNotification title="NOTIFICATION" visible={showSystemPrompt}>
              <Text style={styles.systemText}>
                You have met all the necessary conditions.
              </Text>
              <Text style={[styles.systemText, styles.systemTextHighlight]}>
                Will you accept your role as a Player?
              </Text>

              <View style={styles.systemActions}>
                <Pressable
                  style={[styles.systemBtn, styles.systemBtnReject]}
                  onPress={handleReject}
                >
                  <Text style={[styles.systemBtnText, { color: 'rgba(255, 69, 0, 0.5)' }]}>REJECT</Text>
                </Pressable>

                <Pressable
                  style={[styles.systemBtn, styles.systemBtnAccept]}
                  // Temporary bypass for testing. To restore loader: '/loading-plan'
                  onPress={() => router.push({ pathname: '/plan', params: { rank } })}
                >
                  <Text style={styles.systemBtnText}>ACCEPT</Text>
                </Pressable>
              </View>
            </SystemNotification>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  subtitle: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 4,
    marginBottom: 10,
  },
  title: {
    fontFamily: 'LatoRegular',
    fontSize: 20,
    color: '#fff',
    letterSpacing: 3,
    marginBottom: 40,
    textAlign: 'center',
  },
  rankContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    backgroundColor: '#0a0a0a',
  },
  rankText: {
    fontFamily: 'Eternal',
    fontSize: 120,
    lineHeight: 140,
  },
  description: {
    fontFamily: 'LatoRegular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 60,
  },
  button: {
    backgroundColor: '#1b45d7',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 12,
  },
  buttonText: {
    fontFamily: 'LatoRegular',
    fontSize: 16,
    color: '#fff',
    letterSpacing: 4,
    fontWeight: '700',
  },
  // System Prompt Styles
  systemOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemText: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#E6F7FF',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  systemTextHighlight: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  systemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 6,
  },
  systemBtn: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
  },
  systemBtnReject: {
    borderColor: 'rgba(255, 69, 0, 0.3)',
    backgroundColor: 'transparent',
  },
  systemBtnAccept: {
    borderColor: '#38B6FF',
    backgroundColor: 'rgba(56, 182, 255, 0.12)',
  },
  systemBtnText: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#fff',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
});
