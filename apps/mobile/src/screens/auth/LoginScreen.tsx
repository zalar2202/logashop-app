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
import { useAuth } from '../../contexts/AuthContext';
import type { AuthStackParamList } from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login, sessionExpired, clearSessionExpired } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    clearSessionExpired();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    setIsLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigation.getParent()?.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.form}>
        {sessionExpired ? (
          <Text style={styles.sessionExpired}>Session expired. Please log in again.</Text>
        ) : null}
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
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
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
            <Text style={styles.buttonText}>Log in</Text>
          )}
        </Pressable>
        <Pressable
          style={styles.link}
          onPress={() => navigation.navigate('ForgotPassword')}
          disabled={isLoading}
        >
          <Text style={styles.linkText}>Forgot password?</Text>
        </Pressable>
        <Pressable
          style={styles.link}
          onPress={() => navigation.navigate('Signup')}
          disabled={isLoading}
        >
          <Text style={styles.linkText}>Don't have an account? Sign up</Text>
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
  sessionExpired: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
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
});
