import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { Address } from '../../api/addresses';

interface AddressFormProps {
  address: Partial<Address>;
  onChange: (address: Partial<Address>) => void;
  errors: Record<string, string>;
  saveAddress?: boolean;
  onSaveAddressChange?: (value: boolean) => void;
  showSaveCheckbox?: boolean;
  /** Prefix for error keys (e.g. 'bil' for billing -> bilfirstName) */
  errorPrefix?: string;
}

const INITIAL: Partial<Address> = {
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

export function AddressForm({
  address,
  onChange,
  errors,
  saveAddress = false,
  onSaveAddressChange,
  showSaveCheckbox = false,
  errorPrefix = '',
}: AddressFormProps) {
  const err = (field: string) => errors[errorPrefix + field];
  const update = (field: keyof Address, value: string) => {
    onChange({ ...address, [field]: value });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.row}>
          <View style={[styles.field, styles.half]}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={[styles.input, err('firstName') && styles.inputError]}
              value={address.firstName ?? ''}
              onChangeText={(v) => update('firstName', v)}
              placeholder="First name"
              autoCapitalize="words"
            />
            {err('firstName') ? (
              <Text style={styles.errorText}>{err('firstName')}</Text>
            ) : null}
          </View>
          <View style={[styles.field, styles.half]}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={[styles.input, err('lastName') && styles.inputError]}
              value={address.lastName ?? ''}
              onChangeText={(v) => update('lastName', v)}
              placeholder="Last name"
              autoCapitalize="words"
            />
            {err('lastName') ? (
              <Text style={styles.errorText}>{err('lastName')}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Company</Text>
          <TextInput
            style={styles.input}
            value={address.company ?? ''}
            onChangeText={(v) => update('company', v)}
            placeholder="Optional"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Address Line 1 *</Text>
          <TextInput
            style={[styles.input, err('address1') && styles.inputError]}
            value={address.address1 ?? ''}
            onChangeText={(v) => update('address1', v)}
            placeholder="Street address"
          />
          {err('address1') ? (
            <Text style={styles.errorText}>{err('address1')}</Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Address Line 2</Text>
          <TextInput
            style={styles.input}
            value={address.address2 ?? ''}
            onChangeText={(v) => update('address2', v)}
            placeholder="Apt, suite, etc."
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.half]}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={[styles.input, err('city') && styles.inputError]}
              value={address.city ?? ''}
              onChangeText={(v) => update('city', v)}
              placeholder="City"
            />
            {err('city') ? (
              <Text style={styles.errorText}>{err('city')}</Text>
            ) : null}
          </View>
          <View style={[styles.field, styles.half]}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={[styles.input, err('state') && styles.inputError]}
              value={address.state ?? ''}
              onChangeText={(v) => update('state', v)}
              placeholder="State"
            />
            {err('state') ? (
              <Text style={styles.errorText}>{err('state')}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.half]}>
            <Text style={styles.label}>ZIP Code *</Text>
            <TextInput
              style={[styles.input, err('zipCode') && styles.inputError]}
              value={address.zipCode ?? ''}
              onChangeText={(v) => update('zipCode', v)}
              placeholder="ZIP"
              keyboardType="number-pad"
            />
            {err('zipCode') ? (
              <Text style={styles.errorText}>{err('zipCode')}</Text>
            ) : null}
          </View>
          <View style={[styles.field, styles.half]}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={address.phone ?? ''}
              onChangeText={(v) => update('phone', v)}
              placeholder="Optional"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {showSaveCheckbox && onSaveAddressChange ? (
          <Pressable
            style={styles.checkboxRow}
            onPress={() => onSaveAddressChange(!saveAddress)}
          >
            <View style={[styles.checkbox, saveAddress && styles.checkboxChecked]}>
              {saveAddress ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
            <Text style={styles.checkboxLabel}>
              Save this address for future orders
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    marginBottom: 16,
  },
  half: {
    flex: 1,
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
  inputError: {
    borderColor: '#c00',
  },
  errorText: {
    fontSize: 12,
    color: '#c00',
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
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
});
