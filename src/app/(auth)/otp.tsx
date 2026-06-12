import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function OtpScreen() {
  const { phoneNumber, verifyOtp } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);

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

  const handleVerify = () => {
    const otpValue = otp.join('');
    if (otpValue.length === 6) {
      // In a real app, verify the OTP via API here.
      // If the user was just logging in, verifyOtp() and route to Dashboard.
      // If it's a new user, route to partner-type. We'll simulate by checking if phone starts with a 9 or something,
      // but for this flow, let's just route to partner-type for the demo.
      router.push('/(auth)/partner-type' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>OTP Verification</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📱</Text>
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
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          <Button
            title="Verify OTP ✓"
            onPress={handleVerify}
            disabled={otp.join('').length !== 6}
            style={styles.button}
          />

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive? </Text>
            <Text style={styles.resendLink}>Resend OTP</Text>
          </View>

          <View style={styles.demoNotice}>
            <Text style={styles.demoText}>
              ⚡ Demo mode: Any 6 digit OTP will work to proceed.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 24,
    color: '#2D3134',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3134',
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
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3134',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
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
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 45,
    height: 52,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2D3134',
    backgroundColor: '#F8F9FA',
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
    padding: 16,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 12,
  },
  demoText: {
    fontSize: 12,
    color: '#DE1F26',
    textAlign: 'center',
  },
});
