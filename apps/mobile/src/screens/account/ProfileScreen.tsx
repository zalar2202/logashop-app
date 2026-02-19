import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import * as authApi from '../../api/auth';
import * as authStorage from '../../lib/authStorage';

const PASSWORD_RULES =
  'At least 8 characters, with uppercase, lowercase, number, and special character (@$!%*?&#).';

function validateName(name: string): string | null {
  if (!name || name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  return null;
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain uppercase';
  if (!/[a-z]/.test(password)) return 'Password must contain lowercase';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  if (!/[@$!%*?&#]/.test(password)) return 'Password must contain a special character (@$!%*?&#)';
  return null;
}

export function ProfileScreen() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = useCallback(async () => {
    setProfileError('');
    const nameErr = validateName(name);
    if (nameErr) {
      setProfileError(nameErr);
      return;
    }
    setSavingProfile(true);
    try {
      const token = (await authStorage.getTokens())?.accessToken;
      if (!token) throw new Error('Not authenticated');
      await authApi.updateProfile(token, { name: name.trim(), phone: phone.trim() });
      await refreshUser();
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  }, [name, phone, refreshUser]);

  const handleChangePassword = useCallback(async () => {
    setPasswordError('');
    if (!currentPassword || !newPassword) {
      setPasswordError('Current password and new password are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    const pwdErr = validatePassword(newPassword);
    if (pwdErr) {
      setPasswordError(pwdErr);
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    setSavingPassword(true);
    try {
      const token = (await authStorage.getTokens())?.accessToken;
      if (!token) throw new Error('Not authenticated');
      await authApi.changePassword(token, {
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      Alert.alert('Success', 'Password changed successfully');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Please sign in to view your profile.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            autoCapitalize="words"
          />
          <Text style={styles.label}>Email (read-only)</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={user.email}
            editable={false}
          />
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Optional"
            keyboardType="phone-pad"
          />
          {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={handleSaveProfile}
            disabled={savingProfile}
          >
            {savingProfile ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.btnText}>Save profile</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change password</Text>
          {!showPasswordForm ? (
            <Pressable
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
              onPress={() => setShowPasswordForm(true)}
            >
              <Text style={styles.secondaryBtnText}>Change password</Text>
            </Pressable>
          ) : (
            <>
              <Text style={styles.hint}>{PASSWORD_RULES}</Text>
              <Text style={styles.label}>Current password</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current password"
                secureTextEntry
              />
              <Text style={styles.label}>New password</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password"
                secureTextEntry
              />
              <Text style={styles.label}>Confirm new password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry
              />
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              <View style={styles.passwordRow}>
                <Pressable
                  style={({ pressed }) => [styles.secondaryBtn, styles.passwordBtn, pressed && styles.btnPressed]}
                  onPress={() => {
                    setShowPasswordForm(false);
                    setPasswordError('');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={savingPassword}
                >
                  <Text style={styles.secondaryBtnText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.btn, styles.passwordBtn, pressed && styles.btnPressed]}
                  onPress={handleChangePassword}
                  disabled={savingPassword}
                >
                  {savingPassword ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.btnText}>Update password</Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#c00',
    marginBottom: 12,
  },
  btn: {
    backgroundColor: '#333',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryBtnText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  btnPressed: {
    opacity: 0.7,
  },
  passwordRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  passwordBtn: {
    flex: 1,
    marginHorizontal: 6,
  },
});
