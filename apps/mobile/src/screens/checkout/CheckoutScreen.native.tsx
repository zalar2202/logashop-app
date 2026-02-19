import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { usePaymentSheet } from '@stripe/stripe-react-native';
import * as authStorage from '../../lib/authStorage';
import * as addressesApi from '../../api/addresses';
import * as shippingZonesApi from '../../api/shippingZones';
import * as checkoutApi from '../../api/checkout';
import * as couponsApi from '../../api/coupons';
import * as paymentsApi from '../../api/payments';
import { AddressForm } from '../../components/checkout/AddressForm';
import { PriceDisplay } from '../../components/PriceDisplay';
import { FALLBACK_SHIPPING_METHODS } from '../../lib/constants';
import type { CartStackParamList } from '../../navigation/CartStack';
import type { Address } from '../../api/addresses';
import type { ShippingMethod } from '../../api/shippingZones';

type NavProp = NativeStackNavigationProp<CartStackParamList, 'Checkout'>;

const INITIAL_ADDRESS: Partial<Address> = {
  firstName: '',
  lastName: '',
  company: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US',
  phone: '',
};

export function CheckoutScreen() {
  const navigation = useNavigation<NavProp>();
  const { isAuthenticated } = useAuth();
  const {
    items,
    subtotal,
    itemCount,
    cartSessionId,
    refetchCart,
  } = useCart();
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>(INITIAL_ADDRESS);
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>(INITIAL_ADDRESS);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [saveAddress, setSaveAddress] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [availableMethods, setAvailableMethods] = useState<ShippingMethod[]>(FALLBACK_SHIPPING_METHODS);
  const [loadingMethods, setLoadingMethods] = useState(false);

  const [customerNote, setCustomerNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    if (itemCount === 0 && !loading) {
      navigation.goBack();
    }
  }, [itemCount, loading, navigation]);

  useEffect(() => {
    if (isAuthenticated) {
      (async () => {
        try {
          const token = (await authStorage.getTokens())?.accessToken;
          if (token) {
            const addrs = await addressesApi.fetchAddresses(token);
            setSavedAddresses(addrs);
            const defaultAddr = addrs.find((a) => a.isDefault);
            if (defaultAddr) {
              setShippingAddress({
                firstName: defaultAddr.firstName,
                lastName: defaultAddr.lastName,
                company: defaultAddr.company ?? '',
                address1: defaultAddr.address1,
                address2: defaultAddr.address2 ?? '',
                city: defaultAddr.city,
                state: defaultAddr.state,
                zipCode: defaultAddr.zipCode,
                country: defaultAddr.country ?? 'US',
                phone: defaultAddr.phone ?? '',
              });
            }
          }
        } catch {
          // ignore
        }
      })();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const country = shippingAddress.country || 'US';
    const state = shippingAddress.state;
    if (!country) return;
    let cancelled = false;
    setLoadingMethods(true);
    shippingZonesApi
      .fetchShippingMethods(country, state)
      .then((data) => {
        if (cancelled) return;
        if (data?.methods && data.methods.length > 0) {
          setAvailableMethods(data.methods);
          if (!data.methods.some((m) => m.methodId === shippingMethod)) {
            setShippingMethod(data.methods[0].methodId);
          }
        } else {
          setAvailableMethods(FALLBACK_SHIPPING_METHODS);
        }
      })
      .catch(() => {
        if (!cancelled) setAvailableMethods(FALLBACK_SHIPPING_METHODS);
      })
      .finally(() => {
        if (!cancelled) setLoadingMethods(false);
      });
    return () => { cancelled = true; };
  }, [shippingAddress.country, shippingAddress.state]);

  const getShippingCost = useCallback(() => {
    const method = availableMethods.find((m) => m.methodId === shippingMethod);
    if (!method) return availableMethods[0]?.price ?? 499;
    if (method.freeThreshold && subtotal >= method.freeThreshold) return 0;
    return method.price;
  }, [shippingMethod, subtotal, availableMethods]);

  const taxAmount = Math.round(subtotal * 0.085);
  const shippingCost = getShippingCost();
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal + shippingCost + taxAmount - discountAmount);

  const validateAddress = (addr: Partial<Address>, prefix = ''): boolean => {
    const required = ['firstName', 'lastName', 'address1', 'city', 'state', 'zipCode'] as const;
    const newErrors: Record<string, string> = {};
    for (const field of required) {
      const key = prefix + field;
      if (!addr[field]?.trim()) {
        newErrors[key] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required`;
      }
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (step === 0) {
      if (!validateAddress(shippingAddress)) return;
      if (!billingSameAsShipping && !validateAddress(billingAddress, 'bil')) return;
    }
    setStep((s) => Math.min(s + 1, 2));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    const token = (await authStorage.getTokens())?.accessToken;
    if (!token) return;
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const data = await couponsApi.validateCoupon(couponCode.trim(), subtotal, token);
      setAppliedCoupon({ code: data.code, discountAmount: data.discountAmount });
      setCouponCode('');
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err instanceof Error ? err.message : 'Invalid coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const selectSavedAddress = (addr: Address) => {
    setShippingAddress({
      firstName: addr.firstName,
      lastName: addr.lastName,
      company: addr.company ?? '',
      address1: addr.address1,
      address2: addr.address2 ?? '',
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country ?? 'US',
      phone: addr.phone ?? '',
    });
  };

  const handlePlaceOrder = async () => {
    const token = (await authStorage.getTokens())?.accessToken;
    if (!token) {
      Alert.alert('Login required', 'Please log in to complete checkout.');
      return;
    }

    setPlacingOrder(true);
    setErrors({});

    try {
      if (isAuthenticated && saveAddress) {
        try {
          await addressesApi.createAddress(
            {
              ...shippingAddress,
              firstName: shippingAddress.firstName!,
              lastName: shippingAddress.lastName!,
              address1: shippingAddress.address1!,
              city: shippingAddress.city!,
              state: shippingAddress.state!,
              zipCode: shippingAddress.zipCode!,
              country: shippingAddress.country ?? 'US',
              label: 'Shipping',
            },
            token
          );
        } catch {
          // ignore save failure
        }
      }

      const shippingAddr = {
        firstName: shippingAddress.firstName!,
        lastName: shippingAddress.lastName!,
        company: shippingAddress.company ?? '',
        address1: shippingAddress.address1!,
        address2: shippingAddress.address2 ?? '',
        city: shippingAddress.city!,
        state: shippingAddress.state!,
        zipCode: shippingAddress.zipCode!,
        country: shippingAddress.country ?? 'US',
        phone: shippingAddress.phone ?? '',
      };

      const result = await checkoutApi.createOrder(
        {
          shippingAddress: shippingAddr,
          billingAddress: billingSameAsShipping
            ? undefined
            : {
                firstName: billingAddress.firstName!,
                lastName: billingAddress.lastName!,
                company: billingAddress.company ?? '',
                address1: billingAddress.address1!,
                address2: billingAddress.address2 ?? '',
                city: billingAddress.city!,
                state: billingAddress.state!,
                zipCode: billingAddress.zipCode!,
                country: billingAddress.country ?? 'US',
                phone: billingAddress.phone ?? '',
              },
          billingSameAsShipping,
          shippingMethod,
          customerNote: customerNote.trim(),
          sessionId: cartSessionId ?? undefined,
          couponCode: appliedCoupon?.code ?? undefined,
        },
        token,
        cartSessionId
      );

      const intent = await paymentsApi.createPaymentIntent(result.orderId, token);

      await initPaymentSheet({
        merchantDisplayName: 'LogaShop',
        paymentIntentClientSecret: intent.clientSecret,
      });

      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert('Payment failed', error.message ?? 'Please try again.');
        return;
      }

      await refetchCart();
      navigation.replace('OrderConfirmation', {
        orderId: result.orderId,
        orderNumber: result.orderNumber,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Checkout failed';
      Alert.alert('Error', msg);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.loginRequired}>
        <Text style={styles.loginRequiredTitle}>Login required</Text>
        <Text style={styles.loginRequiredText}>
          Please log in to complete checkout. Your cart will be saved.
        </Text>
        <Pressable
          style={styles.loginBtn}
          onPress={() => {
            const root = navigation.getParent()?.getParent();
            if (root && 'navigate' in root) {
              (root as { navigate: (n: string) => void }).navigate('Auth');
            }
          }}
        >
          <Text style={styles.loginBtnText}>Log in</Text>
        </Pressable>
      </View>
    );
  }

  if (itemCount === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {step === 0 && (
        <>
          {savedAddresses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Saved addresses</Text>
              {savedAddresses.map((addr) => (
                <Pressable
                  key={addr._id}
                  style={styles.addressCard}
                  onPress={() => selectSavedAddress(addr)}
                >
                  <Text style={styles.addressName}>
                    {addr.firstName} {addr.lastName}
                    {addr.isDefault ? ' (Default)' : ''}
                  </Text>
                  <Text style={styles.addressLine}>
                    {addr.address1}, {addr.city}, {addr.state} {addr.zipCode}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping address</Text>
            <AddressForm
              address={shippingAddress}
              onChange={setShippingAddress}
              errors={errors}
              saveAddress={saveAddress}
              onSaveAddressChange={setSaveAddress}
              showSaveCheckbox={true}
            />
          </View>

          <View style={styles.section}>
            <Pressable
              style={styles.checkboxRow}
              onPress={() => setBillingSameAsShipping(!billingSameAsShipping)}
            >
              <View
                style={[
                  styles.checkbox,
                  billingSameAsShipping && styles.checkboxChecked,
                ]}
              >
                {billingSameAsShipping ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : null}
              </View>
              <Text style={styles.checkboxLabel}>Billing same as shipping</Text>
            </Pressable>
            {!billingSameAsShipping && (
              <View style={styles.billingForm}>
                <Text style={styles.sectionTitle}>Billing address</Text>
                <AddressForm
                  address={billingAddress}
                  onChange={setBillingAddress}
                  errors={errors}
                  errorPrefix="bil"
                />
              </View>
            )}
          </View>
        </>
      )}

      {step === 1 && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping method</Text>
            {loadingMethods ? (
              <ActivityIndicator style={styles.loader} />
            ) : (
              availableMethods.map((method) => {
                const isFree =
                  method.freeThreshold && subtotal >= method.freeThreshold;
                const isSelected = shippingMethod === method.methodId;
                return (
                  <Pressable
                    key={method.methodId}
                    style={[
                      styles.methodCard,
                      isSelected && styles.methodCardSelected,
                    ]}
                    onPress={() => setShippingMethod(method.methodId)}
                  >
                    <View>
                      <Text style={styles.methodLabel}>{method.label}</Text>
                      <Text style={styles.methodDesc}>
                        {method.estimatedDays ?? method.description}
                      </Text>
                    </View>
                    <Text style={styles.methodPrice}>
                      {isFree || method.price === 0 ? 'FREE' : `$${(method.price / 100).toFixed(2)}`}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order note</Text>
            <TextInput
              style={styles.textArea}
              value={customerNote}
              onChangeText={setCustomerNote}
              placeholder="Optional instructions"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ship to</Text>
            <Text style={styles.shipToText}>
              {shippingAddress.firstName} {shippingAddress.lastName}
              {'\n'}
              {shippingAddress.address1}
              {shippingAddress.address2 ? `, ${shippingAddress.address2}` : ''}
              {'\n'}
              {shippingAddress.city}, {shippingAddress.state}{' '}
              {shippingAddress.zipCode}
            </Text>
            <Pressable onPress={() => setStep(0)}>
              <Text style={styles.editLink}>Edit address</Text>
            </Pressable>
          </View>
        </>
      )}

      {step === 2 && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order summary</Text>
            {items.map((item) => (
              <View key={item._id} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name} × {item.quantity}
                </Text>
                <PriceDisplay price={item.lineTotal} size="small" />
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <PriceDisplay price={subtotal} size="small" />
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping</Text>
              <Text style={shippingCost === 0 ? styles.freeText : undefined}>
                {shippingCost === 0 ? 'FREE' : `$${(shippingCost / 100).toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <PriceDisplay price={taxAmount} size="small" />
            </View>
            {discountAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.discountLabel}>
                  Discount ({appliedCoupon?.code ?? ''})
                </Text>
                <Text style={styles.discountAmount}>
                  -${(discountAmount / 100).toFixed(2)}
                </Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.totalRowBold]}>
              <Text style={styles.totalLabel}>Total</Text>
              <PriceDisplay price={total} size="large" />
            </View>
          </View>

          {!appliedCoupon ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Coupon code</Text>
              <View style={styles.couponRow}>
                <TextInput
                  style={styles.couponInput}
                  value={couponCode}
                  onChangeText={setCouponCode}
                  placeholder="Enter code"
                  placeholderTextColor="#999"
                  autoCapitalize="characters"
                  editable={!validatingCoupon}
                />
                <Pressable
                  style={[
                    styles.couponApplyBtn,
                    (validatingCoupon || !couponCode.trim()) && styles.couponApplyBtnDisabled,
                  ]}
                  onPress={handleApplyCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                >
                  {validatingCoupon ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.couponApplyText}>Apply</Text>
                  )}
                </Pressable>
              </View>
              {couponError ? (
                <Text style={styles.couponError}>{couponError}</Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.section}>
              <View style={styles.appliedCouponRow}>
                <Text style={styles.appliedCouponLabel}>
                  Coupon ({appliedCoupon.code})
                </Text>
                <View style={styles.appliedCouponRight}>
                  <Text style={styles.appliedCouponDiscount}>
                    -${(discountAmount / 100).toFixed(2)}
                  </Text>
                  <Pressable onPress={removeCoupon} hitSlop={8}>
                    <Text style={styles.removeCouponText}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping</Text>
            <Text style={styles.summaryText}>
              {availableMethods.find((m) => m.methodId === shippingMethod)
                ?.label ?? shippingMethod}
            </Text>
            <Pressable onPress={() => setStep(1)}>
              <Text style={styles.editLink}>Edit</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.placeOrderBtn, placingOrder && styles.placeOrderBtnDisabled]}
            onPress={handlePlaceOrder}
            disabled={placingOrder}
          >
            {placingOrder ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.placeOrderBtnText}>
                Pay ${(total / 100).toFixed(2)} — Place order
              </Text>
            )}
          </Pressable>
        </>
      )}

      {step < 2 && (
        <View style={styles.navRow}>
          {step > 0 ? (
            <Pressable style={styles.backBtn} onPress={goBack}>
              <Text style={styles.backBtnText}>Back</Text>
            </Pressable>
          ) : (
            <View style={styles.backBtn} />
          )}
          <Pressable style={styles.nextBtn} onPress={goNext}>
            <Text style={styles.nextBtnText}>
              {step === 1 ? 'Review & pay' : 'Continue'}
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginRequired: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loginRequiredTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  loginRequiredText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: '#333',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  addressCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  addressLine: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#333',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#555',
  },
  billingForm: {
    marginTop: 12,
  },
  loader: {
    marginVertical: 16,
  },
  methodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  methodCardSelected: {
    borderColor: '#333',
    backgroundColor: '#f9f9f9',
  },
  methodLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  methodDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  methodPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  shipToText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  editLink: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  totalRowBold: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: '#555',
  },
  freeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0',
  },
  discountLabel: {
    fontSize: 14,
    color: '#555',
  },
  discountAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0',
  },
  couponRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  couponApplyBtn: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  couponApplyBtnDisabled: {
    opacity: 0.6,
  },
  couponApplyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  couponError: {
    fontSize: 13,
    color: '#c00',
    marginTop: 8,
  },
  appliedCouponRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  appliedCouponLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  appliedCouponRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appliedCouponDiscount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  removeCouponText: {
    fontSize: 14,
    color: '#007AFF',
  },
  summaryText: {
    fontSize: 14,
    color: '#555',
  },
  placeOrderBtn: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  placeOrderBtnDisabled: {
    opacity: 0.7,
  },
  placeOrderBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backBtnText: {
    fontSize: 16,
    color: '#007AFF',
  },
  nextBtn: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
