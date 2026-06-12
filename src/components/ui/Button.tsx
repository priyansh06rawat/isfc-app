import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'outline' | 'secondary';
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  title,
  variant = 'primary',
  isLoading = false,
  style,
  textStyle,
  disabled,
  ...props
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary && styles.primaryButton,
        isOutline && styles.outlineButton,
        disabled && styles.disabledButton,
        style,
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? '#FFF' : '#DE1F26'} />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary && styles.primaryText,
            isOutline && styles.outlineText,
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 24,
  },
  primaryButton: {
    backgroundColor: '#DE1F26',
    shadowColor: '#DE1F26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  disabledButton: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#2D3134',
  },
  disabledText: {
    color: '#94A3B8',
  },
});
