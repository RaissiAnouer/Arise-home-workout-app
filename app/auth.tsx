import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { supabase } from '../src/lib/supabase';
import { useProgression } from '../src/context/ProgressionContext';

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { rank } = useLocalSearchParams<{ rank?: string }>();
  const { updateHunterName } = useProgression();

  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [hunterNameInput, setHunterNameInput] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSkipToLocal = async () => {
    try {
      if (Haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await AsyncStorage.setItem('@arise_onboarding_completed', 'true');
      await AsyncStorage.setItem(
        '@arise_auth_user',
        JSON.stringify({
          isGuest: true,
          hunterName: 'Hunter',
          email: null,
          storage: 'local_storage',
          savedAt: new Date().toISOString(),
        })
      );
      router.replace('/(tabs)/home' as any);
    } catch (e) {
      console.error('Error skipping to local account:', e);
      router.replace('/(tabs)/home' as any);
    }
  };

  const handleAuthSubmit = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Please enter email and password.');
      return;
    }

    if (mode === 'signup') {
      if (cleanPassword.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
      if (cleanPassword !== confirmPassword.trim()) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      if (mode === 'signup') {
        await supabase.auth.signOut().catch(() => {});
        const nameToUse = hunterNameInput.trim() || 'Hunter';
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              hunter_name: nameToUse,
              initial_rank: rank || 'E',
            },
          },
        });

        if (error) {
          throw error;
        }

        if (nameToUse) {
          updateHunterName(nameToUse);
        }

        await AsyncStorage.setItem('@arise_onboarding_completed', 'true');
        await AsyncStorage.setItem(
          '@arise_auth_user',
          JSON.stringify({
            isGuest: false,
            hunterName: nameToUse,
            email: cleanEmail,
            userId: data.user?.id || 'registered',
            storage: 'supabase_cloud',
            savedAt: new Date().toISOString(),
          })
        );

        setSuccessMsg('Account created successfully.');
        if (Haptics) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        setTimeout(() => {
          router.replace('/(tabs)/home' as any);
        }, 800);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (error) {
          throw error;
        }

        const registeredName =
          data.user?.user_metadata?.hunter_name ||
          data.user?.email?.split('@')[0] ||
          'Hunter';

        updateHunterName(registeredName);

        await AsyncStorage.setItem('@arise_onboarding_completed', 'true');
        await AsyncStorage.setItem(
          '@arise_auth_user',
          JSON.stringify({
            isGuest: false,
            hunterName: registeredName,
            email: cleanEmail,
            userId: data.user?.id || 'authenticated',
            storage: 'supabase_cloud',
            savedAt: new Date().toISOString(),
          })
        );

        setSuccessMsg('Signed in successfully.');
        if (Haptics) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        setTimeout(() => {
          router.replace('/(tabs)/home' as any);
        }, 800);
      }
    } catch (err: any) {
      console.warn('Auth error:', err);
      const rawError = err?.message || 'Authentication error.';
      if (
        rawError.toLowerCase().includes('network') ||
        rawError.toLowerCase().includes('fetch') ||
        rawError.toLowerCase().includes('placeholder')
      ) {
        setErrorMsg('Network error. You can continue as guest.');
      } else {
        setErrorMsg(rawError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar with Skip */}
          <View style={styles.topBar}>
            <Text style={styles.brandTitle}>ARISE</Text>
            <Pressable
              style={styles.skipBtn}
              onPress={handleSkipToLocal}
              hitSlop={12}
            >
              <Text style={styles.skipBtnText}>SKIP</Text>
            </Pressable>
          </View>

          {/* Clean Black & White Card */}
          <View style={styles.card}>
            <Text style={styles.title}>
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </Text>

            {/* Mode Switcher */}
            <View style={styles.toggleContainer}>
              <Pressable
                style={[
                  styles.toggleBtn,
                  mode === 'signup' && styles.toggleBtnActive,
                ]}
                onPress={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    mode === 'signup' && styles.toggleBtnTextActive,
                  ]}
                >
                  SIGN UP
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.toggleBtn,
                  mode === 'login' && styles.toggleBtnActive,
                ]}
                onPress={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    mode === 'login' && styles.toggleBtnTextActive,
                  ]}
                >
                  LOG IN
                </Text>
              </Pressable>
            </View>

            {/* Alerts */}
            {errorMsg && (
              <View style={styles.alertError}>
                <AlertCircle size={15} color="#FFFFFF" />
                <Text style={styles.alertErrorText}>{errorMsg}</Text>
              </View>
            )}

            {successMsg && (
              <View style={styles.alertSuccess}>
                <CheckCircle2 size={15} color="#FFFFFF" />
                <Text style={styles.alertSuccessText}>{successMsg}</Text>
              </View>
            )}

            {/* Inputs */}
            <View style={styles.form}>
              {mode === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>NAME</Text>
                  <View style={styles.inputRow}>
                    <User size={16} color="#888888" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Your name"
                      placeholderTextColor="#555555"
                      value={hunterNameInput}
                      onChangeText={setHunterNameInput}
                      autoCapitalize="words"
                      editable={!loading}
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL</Text>
                <View style={styles.inputRow}>
                  <Mail size={16} color="#888888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="name@example.com"
                    placeholderTextColor="#555555"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <View style={styles.inputRow}>
                  <Lock size={16} color="#888888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••"
                    placeholderTextColor="#555555"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    hitSlop={8}
                  >
                    {showPassword ? (
                      <EyeOff size={16} color="#888888" />
                    ) : (
                      <Eye size={16} color="#888888" />
                    )}
                  </Pressable>
                </View>
              </View>

              {mode === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
                  <View style={styles.inputRow}>
                    <Lock size={16} color="#888888" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="••••••••"
                      placeholderTextColor="#555555"
                      secureTextEntry={!showPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>
                </View>
              )}

              {/* Primary Action Button (Solid White with Black Text) */}
              <Pressable
                style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
                onPress={handleAuthSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000000" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    {mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
                  </Text>
                )}
              </Pressable>

              {/* Minimal Skip / Local Guest Action */}
              <Pressable
                style={styles.guestBtn}
                onPress={handleSkipToLocal}
                disabled={loading}
              >
                <Text style={styles.guestBtnText}>CONTINUE AS GUEST</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: '#111111',
  },
  skipBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CCCCCC',
    letterSpacing: 1.2,
  },
  card: {
    backgroundColor: '#000000',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 3,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#777777',
    letterSpacing: 1,
  },
  toggleBtnTextActive: {
    color: '#000000',
  },
  alertError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1A1111',
    borderWidth: 1,
    borderColor: '#442222',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  alertErrorText: {
    flex: 1,
    fontSize: 12,
    color: '#FFFFFF',
  },
  alertSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111A11',
    borderWidth: 1,
    borderColor: '#224422',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  alertSuccessText: {
    flex: 1,
    fontSize: 12,
    color: '#FFFFFF',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888888',
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222222',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  eyeBtn: {
    padding: 6,
  },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  guestBtn: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222222',
    backgroundColor: 'transparent',
  },
  guestBtnText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
