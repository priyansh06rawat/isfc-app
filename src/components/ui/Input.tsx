import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { useAuth } from '../../context/AuthContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  required?: boolean;
}

export function Input({ label, error, leftIcon, required, style, ...props }: InputProps) {
  const auth = useAuth();
  const darkModeEnabled = auth ? auth.darkModeEnabled : false;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, darkModeEnabled && styles.textDark]}>
          {label}
          {required && <Text style={styles.requiredAsterisk}> *</Text>}
        </Text>
      )}
      <View style={[
        styles.inputContainer, 
        error ? styles.inputError : null,
        darkModeEnabled && styles.inputDark
      ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input, 
            leftIcon ? styles.inputWithLeftIcon : null, 
            darkModeEnabled && styles.textDark,
            style
          ]}
          placeholderTextColor={darkModeEnabled ? '#64748B' : '#94A3B8'}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3134',
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: '#DE1F26',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
  },
  inputError: {
    borderColor: '#DE1F26',
    backgroundColor: '#FFF5F5',
  },
  inputDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  leftIcon: {
    paddingLeft: 16,
    paddingRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2D3134',
    fontWeight: '600',
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  textDark: {
    color: '#F8FAFC',
  },
  errorText: {
    color: '#DE1F26',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
});
