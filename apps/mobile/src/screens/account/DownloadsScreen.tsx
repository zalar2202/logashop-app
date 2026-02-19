import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as authStorage from '../../lib/authStorage';
import * as downloadsApi from '../../api/downloads';
import type { DownloadItem } from '../../api/downloads';
import { getApiBaseUrl } from '../../api';
import type { AccountStackParamList } from '../../navigation/AccountStack';

type NavProp = NativeStackNavigationProp<AccountStackParamList, 'Downloads'>;

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Unlimited';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'download';
}

export function DownloadsScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadDownloads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = (await authStorage.getTokens())?.accessToken;
      if (!token) throw new Error('Not authenticated');
      const data = await downloadsApi.fetchDownloads(token);
      setDownloads(data);
    } catch {
      setDownloads([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDownloads();
    } else {
      setLoading(false);
      setDownloads([]);
    }
  }, [user, loadDownloads]);

  const handleDownload = async (item: DownloadItem) => {
    if (!item.isValid || item.status !== 'active') return;
    setDownloadingId(item._id);
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      Alert.alert('Error', 'API URL not configured');
      setDownloadingId(null);
      return;
    }
    const url = `${baseUrl}/api/download/${item.downloadToken}`;
    const fileName = safeFileName(item.fileName || 'download');

    try {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare && Platform.OS !== 'web') {
        const dir = `${FileSystem.cacheDirectory}digital_downloads/`;
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        const fileUri = `${dir}${fileName}`;
        const result = await FileSystem.downloadAsync(url, fileUri);
        await Sharing.shareAsync(result.uri, { dialogTitle: 'Save file' });
      } else {
        await Linking.openURL(url);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Download failed';
      Alert.alert('Download failed', msg);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleBrowseShop = () => {
    navigation.navigate('Main', { screen: 'Shop' });
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loginTitle}>Sign in to view downloads</Text>
        <Text style={styles.loginSubtitle}>
          Your digital purchases will appear here after you sign in.
        </Text>
        <Pressable
          style={styles.loginBtn}
          onPress={() =>
            (navigation as unknown as { navigate: (n: string, p?: { screen: string }) => void }).navigate(
              'Auth',
              { screen: 'Login' }
            )
          }
        >
          <Text style={styles.loginBtnText}>Sign in</Text>
        </Pressable>
      </View>
    );
  }

  if (loading && downloads.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (downloads.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Ionicons name="download-outline" size={48} color="#999" />
        </View>
        <Text style={styles.emptyTitle}>No downloads yet</Text>
        <Text style={styles.emptySubtitle}>
          You haven't purchased any digital products.
        </Text>
        <Pressable style={styles.browseBtn} onPress={handleBrowseShop}>
          <Text style={styles.browseBtnText}>Browse Digital Store</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={downloads}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadDownloads} />
      }
      renderItem={({ item }) => {
        const isActive = item.isValid && item.status === 'active';
        const isDownloading = downloadingId === item._id;
        const countText =
          item.maxDownloads != null
            ? `${item.downloadCount} / ${item.maxDownloads}`
            : `${item.downloadCount} / ∞`;

        return (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name="document-text-outline" size={24} color="#333" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.productId?.name ?? 'Digital Product'}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{countText} downloads</Text>
                  {item.expiresAt && (
                    <Text style={styles.expiryText}>
                      Expires: {formatDate(item.expiresAt)}
                    </Text>
                  )}
                  {item.orderId?.orderNumber && (
                    <Text style={styles.metaText}>
                      Order #{item.orderId.orderNumber}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.cardRight}>
              {isActive ? (
                <Pressable
                  style={[
                    styles.downloadBtn,
                    isDownloading && styles.downloadBtnDisabled,
                  ]}
                  onPress={() => handleDownload(item)}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="download-outline" size={18} color="#fff" />
                      <Text style={styles.downloadBtnText}>Download</Text>
                    </>
                  )}
                </Pressable>
              ) : (
                <View style={styles.disabledBtn}>
                  <Ionicons name="alert-circle-outline" size={18} color="#999" />
                  <Text style={styles.disabledBtnText}>
                    {item.status === 'revoked' ? 'Revoked' : 'Expired'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseBtn: {
    backgroundColor: '#333',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 48,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  expiryText: {
    fontSize: 12,
    color: '#c60',
  },
  cardRight: {
    marginLeft: 12,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  downloadBtnDisabled: {
    opacity: 0.7,
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  disabledBtnText: {
    fontSize: 14,
    color: '#999',
  },
});
