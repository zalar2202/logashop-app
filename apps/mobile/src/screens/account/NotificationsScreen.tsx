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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as authStorage from '../../lib/authStorage';
import * as notificationsApi from '../../api/notifications';
import type { Notification } from '../../api/notifications';
import type { AccountStackParamList } from '../../navigation/AccountStack';

type NavProp = NativeStackNavigationProp<AccountStackParamList, 'Notifications'>;

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getIconForType(type: string): 'checkmark-circle' | 'alert-circle' | 'megaphone' | 'information-circle' {
  switch (type) {
    case 'success':
      return 'checkmark-circle';
    case 'error':
    case 'warning':
      return 'alert-circle';
    case 'marketing':
      return 'megaphone';
    default:
      return 'information-circle';
  }
}

function parseActionUrl(actionUrl: string): { screen: string; params?: { orderId: string } } | null {
  if (!actionUrl) return null;
  const match = actionUrl.match(/\/account\/orders\/([a-f0-9]+)/i);
  if (match) return { screen: 'OrderDetail' as const, params: { orderId: match[1] } };
  if (actionUrl.includes('/account/orders')) return { screen: 'Orders' as const };
  if (actionUrl.includes('/account/downloads')) return { screen: 'Downloads' as const };
  return null;
}

export function NotificationsScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [markingId, setMarkingId] = useState<string | null>(null);

  const readFilter = activeTab === 'all' ? undefined : activeTab === 'unread' ? false : true;

  const loadNotifications = useCallback(async (page = 1, refresh = false) => {
    if (!user) return;
    if (refresh) setRefreshing(true);
    else if (page === 1) setLoading(true);

    try {
      const token = (await authStorage.getTokens())?.accessToken;
      if (!token) throw new Error('Not authenticated');

      const { notifications: list, pagination: pag } = await notificationsApi.fetchNotifications(
        token,
        page,
        15,
        readFilter ?? undefined
      );
      const countResult = await notificationsApi.fetchUnreadCount(token);

      setNotifications(page === 1 ? list : (prev) => [...prev, ...list]);
      setPagination({ page: pag.page, pages: pag.pages });
      setUnreadCount(countResult);
    } catch {
      if (page === 1) setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, readFilter]);

  useEffect(() => {
    if (user) {
      loadNotifications(1);
    } else {
      setLoading(false);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, loadNotifications]);

  const handleRefresh = () => loadNotifications(1, true);

  const handleMarkAsRead = async (n: Notification) => {
    if (n.read) return;
    setMarkingId(n._id);
    try {
      const token = (await authStorage.getTokens())?.accessToken;
      if (!token) return;
      await notificationsApi.markAsRead(n._id, token);
      setNotifications((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, read: true, readAt: new Date().toISOString() } : x))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      Alert.alert('Error', 'Failed to mark as read');
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = (await authStorage.getTokens())?.accessToken;
      if (!token) return;
      await notificationsApi.markAllAsRead(token);
      setNotifications((prev) =>
        prev.map((x) => (x.read ? x : { ...x, read: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  const handleAction = (n: Notification) => {
    if (!n.actionUrl) return;
    const parsed = parseActionUrl(n.actionUrl);
    if (parsed) {
      if (!n.read) handleMarkAsRead(n);
      if (parsed.screen === 'OrderDetail' && parsed.params) {
        navigation.navigate('OrderDetail', parsed.params);
      } else if (parsed.screen === 'Orders') {
        navigation.navigate('Orders');
      } else if (parsed.screen === 'Downloads') {
        navigation.navigate('Downloads');
      }
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const icon = getIconForType(item.type);
    const hasAction = !!item.actionUrl;

    return (
      <Pressable
        style={[styles.item, !item.read && styles.itemUnread]}
        onPress={() => hasAction ? handleAction(item) : handleMarkAsRead(item)}
      >
        <View style={styles.itemLeft}>
          <Ionicons
            name={icon}
            size={22}
            color={item.type === 'success' ? '#059669' : item.type === 'error' || item.type === 'warning' ? '#d97706' : '#333'}
          />
        </View>
        <View style={styles.itemBody}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemTitle, !item.read && styles.itemTitleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.itemDate}>{formatRelative(item.createdAt)}</Text>
          </View>
          <Text style={styles.itemMessage} numberOfLines={2}>
            {item.message}
          </Text>
          {hasAction && (
            <Pressable
              style={styles.actionBtn}
              onPress={() => handleAction(item)}
            >
              <Text style={styles.actionBtnText}>{item.actionLabel || 'View'}</Text>
              <Ionicons name="chevron-forward" size={14} color="#333" />
            </Pressable>
          )}
        </View>
        {!item.read && (
          <Pressable
            style={styles.markReadBtn}
            onPress={() => handleMarkAsRead(item)}
            disabled={markingId === item._id}
          >
            {markingId === item._id ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Ionicons name="checkmark" size={20} color="#666" />
            )}
          </Pressable>
        )}
      </Pressable>
    );
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Sign in to view notifications</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <Pressable onPress={handleMarkAllAsRead} style={styles.markAllBtn}>
            <Ionicons name="checkmark-done" size={18} color="#333" />
            <Text style={styles.markAllText}>Mark all as read</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.tabs}>
        {(['all', 'unread', 'read'] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading && notifications.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#333" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="notifications-outline" size={56} color="#999" />
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptyText}>
            You don't have any {activeTab !== 'all' ? activeTab : ''} notifications yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  markAllText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#333',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
  },
  item: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemUnread: {
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
  },
  itemLeft: {
    marginRight: 12,
  },
  itemBody: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  itemTitleUnread: {
    color: '#333',
  },
  itemDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  itemMessage: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  markReadBtn: {
    padding: 4,
    marginLeft: 8,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
