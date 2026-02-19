import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as authApi from '../../api/auth';
import type { AuthStackParamList } from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    setIsLoading(true);
    try {
      const result = await authApi.forgotPassword(email.trim().toLowerCase());
      setSuccessMessage(result.message ?? 'If that email is in our system, we have sent a reset link.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  if (successMessage) {
    return (
      <View style={styles.container}>
        <View style={styles.successBox}>
          <Text style={styles.successTitle}>Check your inbox</Text>
          <Text style={styles.successText}>{successMessage}</Text>
          <Pressable
            style={styles.link}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>Back to log in</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.form}>
        <Text style={styles.hint}>
          Enter your email and we'll send you a link to reset your password.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          editable={!isLoading}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send reset link</Text>
          )}
        </Pressable>
        <Pressable
          style={styles.link}
          onPress={() => navigation.navigate('Login')}
          disabled={isLoading}
        >
          <Text style={styles.linkText}>Back to log in</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  form: {
    flexDirection: 'column',
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  error: {
    color: '#c00',
    fontSize: 14,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#333',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
  successBox: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
});
