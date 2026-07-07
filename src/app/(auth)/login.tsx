import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setPhoneNumber } = useAuth();
  
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

  const handleGetOtp = async () => {
    if (phone.length !== 10) return;
    setIsLoading(true);
    try {
      const { ConnectorAPI } = await import('../../services/api');
      await ConnectorAPI.requestOtp(phone);
      setPhoneNumber(phone);
      router.push('/(auth)/otp' as any);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="bank" size={24} color="#DE1F26" />
              </View>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>Enter your registered mobile number to continue</Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Mobile Number"
                placeholder="98XXXXXXXX"
                keyboardType="number-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                leftIcon={<Text style={styles.flagIcon}>+91</Text>}
              />

              <Button
                title={isLoading ? 'Sending OTP...' : 'Get OTP'}
                onPress={handleGetOtp}
                disabled={phone.length !== 10 || isLoading}
                style={styles.button}
              />

              <View style={styles.footerText}>
                <Text style={styles.newPartnerText}>New partner? </Text>
                <Text
                  style={styles.registerText}
                  onPress={() => {
                    if (phone.length !== 10) {
                      alert('Please enter your 10-digit mobile number first to register.');
                      return;
                    }
                    setPhoneNumber(phone);
                    router.push('/(auth)/partner-type' as any);
                  }}
                >
                  Register Here
                </Text>
              </View>

              <View style={{ height: 24 }} />

              <View style={styles.secureNotice}>
                <View style={styles.secureTitleRow}>
                  <MaterialCommunityIcons name="shield-check" size={16} color="#059669" style={{ marginRight: 6 }} />
                  <Text style={styles.secureTitle}>Secure & Compliant</Text>
                </View>
                <Text style={styles.secureText}>
                  Your data is protected under RBI guidelines and DPDP Act 2023. We never share your information without consent.
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 32,
    marginBottom: 32,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#FFF5F5',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2D3134',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  form: {
    flex: 1,
  },
  flagIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3134',
  },
  button: {
    marginTop: 8,
    marginBottom: 24,
  },
  footerText: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  newPartnerText: {
    fontSize: 13,
    color: '#64748B',
  },
  registerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DE1F26',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    color: '#94A3B8',
    paddingHorizontal: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
  },
  secureNotice: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 12,
  },
  secureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  secureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  secureText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
});
