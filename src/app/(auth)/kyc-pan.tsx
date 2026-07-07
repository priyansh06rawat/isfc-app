import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TopNav } from '../../components/ui/TopNav';
import { useAuth } from '../../context/AuthContext';
import * as DocumentPicker from 'expo-document-picker';

export default function KycPanScreen() {
  const { onboardingData, updateOnboardingData } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);

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

  const handleVerify = () => {
    if (onboardingData.pan.length !== 10) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      updateOnboardingData({ isPanVerified: true });
    }, 1500);
  };

  const handleDigiLocker = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      updateOnboardingData({
        isPanVerified: true,
        pan: 'ABCDE1234F',
      });
    }, 1500);
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateOnboardingData({ panUploaded: true });
      }
    } catch (e) {
      console.warn('Document upload error:', e);
      alert('Failed to pick document.');
    }
  };

  const handleContinue = () => {
    if (!onboardingData.isPanVerified && !onboardingData.panUploaded) {
      alert('Please verify PAN or upload PAN card to proceed.');
      return;
    }
    router.push('/(auth)/kyc-aadhaar' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="KYC Verification" step="Step 1/6" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: '16%' }]} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Verify PAN Details</Text>
              <Text style={styles.subtitle}>Your PAN is required to check your bureau and credit history</Text>
            </View>

            <Input
              label="PAN Number"
              placeholder="ABCDE1234F"
              autoCapitalize="characters"
              maxLength={10}
              value={onboardingData.pan}
              onChangeText={(text) => {
                updateOnboardingData({ pan: text, isPanVerified: false });
              }}
              required
            />

            <Button
              title={onboardingData.isPanVerified ? "Verified" : "Verify via NSDL"}
              variant={onboardingData.isPanVerified ? "primary" : "outline"}
              style={[styles.verifyButton, onboardingData.isPanVerified && styles.verifiedButton]}
              isLoading={isVerifying && !onboardingData.pan}
              onPress={handleVerify}
              disabled={onboardingData.pan.length !== 10 || onboardingData.isPanVerified}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <Button
              title={onboardingData.isPanVerified && onboardingData.pan === 'ABCDE1234F' ? "Fetched via DigiLocker" : "Fetch from DigiLocker"}
              variant="primary"
              style={[styles.digiButton, onboardingData.isPanVerified && onboardingData.pan === 'ABCDE1234F' && styles.verifiedButton]}
              isLoading={isVerifying && !onboardingData.isPanVerified}
              onPress={handleDigiLocker}
              disabled={onboardingData.isPanVerified}
            />

            <Text style={styles.uploadLabel}>Upload PAN Image * (Optional if verified)</Text>
            <TouchableOpacity style={[styles.uploadBox, onboardingData.panUploaded && { borderColor: '#10B981', backgroundColor: '#ECFDF5' }]} onPress={handleUpload}>
              {onboardingData.panUploaded ? (
                <>
                  <MaterialCommunityIcons name="check-circle" size={32} color="#10B981" style={{ marginBottom: 12 }} />
                  <Text style={[styles.uploadText, { color: '#065F46' }]}>pan_card.jpg Uploaded</Text>
                  <Text style={styles.uploadSubtext}>Tap to change photo</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="camera" size={32} color="#64748B" style={{ marginBottom: 12 }} />
                  <Text style={styles.uploadText}>Tap to upload or take a photo</Text>
                  <Text style={styles.uploadSubtext}>Max size 5MB (JPG, PNG, PDF)</Text>
                </>
              )}
            </TouchableOpacity>

            <Button
              title="Continue"
              onPress={handleContinue}
              style={styles.button}
            />
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
  content: {
    padding: 24,
    flexGrow: 1,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#DE1F26',
    borderRadius: 3,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3134',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },
  verifyButton: {
    marginTop: -8,
    marginBottom: 24,
  },
  verifiedButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
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
  digiButton: {
    backgroundColor: '#0284C7',
    shadowColor: '#0284C7',
    marginBottom: 24,
  },
  uploadLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3134',
    marginBottom: 8,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    marginBottom: 32,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#94A3B8',
  },
  button: {
    marginTop: 'auto',
  },
});
