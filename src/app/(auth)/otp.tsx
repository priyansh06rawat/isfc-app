import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Animated, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { TopNav } from '../../components/ui/TopNav';
import { useAuth } from '../../context/AuthContext';

export default function OtpScreen() {
  const { phoneNumber, verifyOtp, isApiLoading } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputs = useRef<Array<TextInput | null>>([]);

  // Animation hooks
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOtp(['1', '2', '3', '4', '5', '6']);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus next
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) return;

    try {
      const result = await verifyOtp(otpValue);
      if (result.isNewPartner) {
        // New user — go through onboarding
        router.push('/(auth)/partner-type' as any);
      } else {
        // Existing partner — go to dashboard
        router.replace('/(tabs)' as any);
      }
    } catch (e: any) {
      Alert.alert('Verification Failed', e.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!phoneNumber) return;
    try {
      const { AuthAPI } = await import('../../services/api');
      await AuthAPI.requestOtp(phoneNumber);
      Alert.alert('OTP Sent', `A new OTP has been sent to +91 ${phoneNumber}`);
    } catch (e) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TopNav title="OTP Verification" />

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.iconContainer}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons name="cellphone-check" size={32} color="#DE1F26" />
            </View>
            <Text style={styles.title}>Verify Your Number</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit OTP to{'\n'}
              <Text style={styles.phoneText}>+91 {phoneNumber || '98XXXXXXXX'}</Text>
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputs.current[index] = ref; }}
                style={[
                  styles.otpInput,
                  focusedIndex === index && styles.otpInputFocused
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
              />
            ))}
          </View>

          <Button
            title={isApiLoading ? 'Verifying...' : 'Verify OTP'}
            onPress={handleVerify}
            disabled={otp.join('').length !== 6 || isApiLoading}
            style={styles.button}
          />

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive? </Text>
            <TouchableOpacity onPress={handleResend} disabled={isApiLoading}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.demoNotice}>
            <Text style={styles.demoText}>
              Demo mode: OTP is pre-filled as <Text style={styles.demoTextBold}>123456</Text>
            </Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    backgroundColor: '#FFF5F5',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3134',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  phoneText: {
    color: '#2D3134',
    fontWeight: '700',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 32,
  },
  otpInput: {
    width: 52,
    height: 58,
    borderWidth: 1.5,
    borderColor: '#D2D6DC',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2D3134',
    backgroundColor: '#FFFFFF',
  },
  otpInputFocused: {
    borderColor: '#DE1F26',
    backgroundColor: 'rgba(222,31,38,0.04)',
    shadowColor: '#DE1F26',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 1,
  },
  button: {
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resendText: {
    fontSize: 13,
    color: '#64748B',
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3134',
  },
  demoNotice: {
    marginTop: 'auto',
    padding: 14,
    backgroundColor: 'rgba(222,31,38,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(222,31,38,0.15)',
    borderRadius: 8,
  },
  demoText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  demoTextBold: {
    color: '#DE1F26',
    fontWeight: '600',
  },
});
