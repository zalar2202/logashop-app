import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { getApiBaseUrl } from './src/api';

export default function App() {
  const apiBase = getApiBaseUrl();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>LogaShop Mobile</Text>
      <Text style={styles.subtitle}>
        API: {apiBase || '(set EXPO_PUBLIC_API_BASE_URL in .env)'}
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
