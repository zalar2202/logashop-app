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
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as authStorage from '../../lib/authStorage';
import * as addressesApi from '../../api/addresses';
import type { Address, AddressInput } from '../../api/addresses';
import { AddressForm } from '../../components/checkout/AddressForm';
import type { AccountStackParamList } from '../../navigation/AccountStack';

type Props = NativeStackScreenProps<AccountStackParamList, 'AddressForm'>;

const INITIAL: Partial<Address> = {
  label: '',
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
  isDefault: false,
};

function validate(address: Partial<Address>): Record<string, string> {
  const err: Record<string, string> = {};
  if (!address.firstName?.trim()) err.firstName = 'Required';
  if (!address.lastName?.trim()) err.lastName = 'Required';
  if (!address.address1?.trim()) err.address1 = 'Required';
  if (!address.city?.trim()) err.city = 'Required';
  if (!address.state?.trim()) err.state = 'Required';
  if (!address.zipCode?.trim()) err.zipCode = 'Required';
  return err;
}

export function AddressFormScreen({ route, navigation }: Props) {
  const addressParam = route.params?.address;
  const isEdit = !!addressParam;

  const [address, setAddress] = useState<Partial<Address>>(
    addressParam
      ? {
          ...INITIAL,
          ...addressParam,
          label: addressParam.label ?? '',
          company: addressParam.company ?? '',
          address2: addressParam.address2 ?? '',
          phone: addressParam.phone ?? '',
        }
      : { ...INITIAL }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    const err = validate(address);
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const token = (await authStorage.getTokens())?.accessToken;
      if (!token) throw new Error('Not authenticated');

      const input: AddressInput = {
        firstName: address.firstName!.trim(),
        lastName: address.lastName!.trim(),
        address1: address.address1!.trim(),
        city: address.city!.trim(),
        state: address.state!.trim(),
        zipCode: address.zipCode!.trim(),
        country: address.country ?? 'US',
      };
      if (address.company) input.company = address.company.trim();
      if (address.address2) input.address2 = address.address2.trim();
      if (address.phone) input.phone = address.phone.trim();
      if (address.label) input.label = address.label.trim();
      if (address.isDefault !== undefined) input.isDefault = address.isDefault;

      if (isEdit && addressParam) {
        await addressesApi.updateAddress(addressParam._id, input, token);
        Alert.alert('Success', 'Address updated');
      } else {
        await addressesApi.createAddress(input, token);
        Alert.alert('Success', 'Address added');
      }
      navigation.goBack();
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Failed to save address' });
    } finally {
      setSaving(false);
    }
  }, [address, addressParam, isEdit, navigation]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Label (optional)</Text>
          <TextInput
            style={styles.input}
            value={address.label ?? ''}
            onChangeText={(v) => setAddress({ ...address, label: v })}
            placeholder="e.g. Home, Office"
          />
        </View>

        <AddressForm
          address={address}
          onChange={(next) => setAddress({ ...address, ...next })}
          errors={errors}
          showSaveCheckbox={true}
          onSaveAddressChange={(v) => setAddress({ ...address, isDefault: v })}
          saveAddress={!!address.isDefault}
        />

        {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.btnPressed]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>{isEdit ? 'Update address' : 'Add address'}</Text>
          )}
        </Pressable>
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
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  formError: {
    fontSize: 14,
    color: '#c00',
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: '#333',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  btnPressed: {
    opacity: 0.7,
  },
});
