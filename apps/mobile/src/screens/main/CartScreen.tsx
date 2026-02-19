import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '../../contexts/CartContext';
import { PriceDisplay } from '../../components/PriceDisplay';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorView } from '../../components/ErrorView';
import { getApiBaseUrl } from '../../api';
import { resolveImageUrl } from '../../lib/utils';
import type { CartStackParamList } from '../../navigation/CartStack';

type NavProp = NativeStackNavigationProp<CartStackParamList, 'CartMain'>;

export function CartScreen() {
  const navigation = useNavigation<NavProp>();
  const {
    items,
    subtotal,
    loading,
    error,
    updateQuantity,
    removeItem,
    refetchCart,
  } = useCart();

  const handleBrowseProducts = () => {
    const tabNav = navigation.getParent();
    if (tabNav && 'navigate' in tabNav) {
      (tabNav as { navigate: (n: string) => void }).navigate('Home');
    }
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout');
  };

  if (loading && items.length === 0) {
    return <LoadingSpinner />;
  }

  if (error && items.length === 0) {
    return (
      <ErrorView message={error} onRetry={refetchCart} />
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>
          Add items from the catalog to get started
        </Text>
        <Pressable style={styles.browseBtn} onPress={handleBrowseProducts}>
          <Text style={styles.browseBtnText}>Browse Products</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {items.map((item) => (
          <CartItemRow
            key={item._id}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
          <PriceDisplay price={subtotal} size="large" />
        </View>
        <Pressable style={styles.checkoutBtn} onPress={handleCheckout}>
          <Text style={styles.checkoutBtnText}>Checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}

interface CartItemRowProps {
  item: {
    _id: string;
    name: string;
    image: string | null;
    price: number;
    originalPrice?: number;
    quantity: number;
    maxQuantity: number;
    allowBackorder: boolean;
    variantInfo: Record<string, string> | null;
    lineTotal: number;
  };
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
}

function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const [updating, setUpdating] = React.useState(false);
  const baseUrl = getApiBaseUrl();
  const imageUrl = resolveImageUrl(item.image ?? undefined, baseUrl);

  const maxQty = item.allowBackorder ? 99 : item.maxQuantity;

  const handleMinus = async () => {
    if (updating || item.quantity <= 1) return;
    setUpdating(true);
    try {
      await onUpdateQuantity(item._id, item.quantity - 1);
    } finally {
      setUpdating(false);
    }
  };

  const handlePlus = async () => {
    if (updating || item.quantity >= maxQty) return;
    setUpdating(true);
    try {
      await onUpdateQuantity(item._id, item.quantity + 1);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      await onRemove(item._id);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View style={styles.itemRow}>
      <View style={styles.itemImageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.itemImage} resizeMode="cover" />
        ) : (
          <View style={styles.itemPlaceholder}>
            <Text style={styles.itemPlaceholderText}>No Image</Text>
          </View>
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        {item.variantInfo && Object.keys(item.variantInfo).length > 0 ? (
          <Text style={styles.itemVariant} numberOfLines={1}>
            {Object.entries(item.variantInfo)
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ')}
          </Text>
        ) : null}
        <View style={styles.itemPriceRow}>
          <PriceDisplay price={item.price} originalPrice={item.originalPrice} size="small" />
          <View style={styles.itemLineTotal}>
            <Text style={styles.itemLineTotalText}>× {item.quantity} = </Text>
            <PriceDisplay price={item.lineTotal} size="small" />
          </View>
        </View>
        <View style={styles.itemActions}>
          <View style={styles.stepper}>
            <Pressable
              style={[styles.stepperBtn, item.quantity <= 1 && styles.stepperBtnDisabled]}
              onPress={handleMinus}
              disabled={updating || item.quantity <= 1}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </Pressable>
            <Text style={styles.stepperQty}>{item.quantity}</Text>
            <Pressable
              style={[styles.stepperBtn, item.quantity >= maxQty && styles.stepperBtnDisabled]}
              onPress={handlePlus}
              disabled={updating || item.quantity >= maxQty}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </Pressable>
          </View>
          <Pressable
            style={styles.removeBtn}
            onPress={handleRemove}
            disabled={updating}
          >
            <Text style={styles.removeBtnText}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
  },
  browseBtn: {
    backgroundColor: '#333',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  itemPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemPlaceholderText: {
    fontSize: 12,
    color: '#999',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  itemLineTotal: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  itemLineTotalText: {
    fontSize: 13,
    color: '#666',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.5,
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  stepperQty: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  removeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  removeBtnText: {
    fontSize: 14,
    color: '#c00',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subtotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  checkoutBtn: {
    backgroundColor: '#333',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
