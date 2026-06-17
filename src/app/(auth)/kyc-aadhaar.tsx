import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TopNav } from '../../components/ui/TopNav';
import { useAuth } from '../../context/AuthContext';

export default function KycAadhaarScreen() {
  const { onboardingData, updateOnboardingData } = useAuth();
  const [isVerifying, setIsVerifying] = React.useState(false);

  const handleDigiLocker = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      updateOnboardingData({
        isAadhaarVerified: true,
        aadhaarLast4: '4321',
      });
    }, 1500);
  };

  const handleUploadFront = () => {
    updateOnboardingData({ aadhaarFrontUploaded: true });
  };

  const handleUploadBack = () => {
    updateOnboardingData({ aadhaarBackUploaded: true });
  };

  const handleContinue = () => {
    if (onboardingData.aadhaarLast4.length !== 4) {
      alert('Please enter the last 4 digits of your Aadhaar card.');
      return;
    }
    if (!onboardingData.isAadhaarVerified && (!onboardingData.aadhaarFrontUploaded || !onboardingData.aadhaarBackUploaded)) {
      alert('Please fetch Aadhaar via API or upload both Front and Back sides to proceed.');
      return;
    }
    router.push('/(auth)/kyc-selfie' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="KYC Verification" step="Step 2/6" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: '33%' }]} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Verify Aadhaar Details</Text>
            <Text style={styles.subtitle}>Upload your Aadhaar card for address verification</Text>
          </View>

          <Input
            label="Last 4 Digits of Aadhaar"
            placeholder="XXXX XXXX 1234"
            keyboardType="number-pad"
            maxLength={4}
            value={onboardingData.aadhaarLast4}
            onChangeText={(text) => {
              updateOnboardingData({ aadhaarLast4: text, isAadhaarVerified: false });
            }}
            required
          />

          <Button
            title={onboardingData.isAadhaarVerified ? "✅ Aadhaar Verified (DigiLocker)" : "🏛️ Fetch from DigiLocker API"}
            variant="primary"
            style={[styles.digiButton, onboardingData.isAadhaarVerified && styles.verifiedButton]}
            isLoading={isVerifying}
            onPress={handleDigiLocker}
            disabled={onboardingData.isAadhaarVerified}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or upload documents</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.uploadRow}>
            <TouchableOpacity 
              style={[styles.uploadBoxHalf, onboardingData.aadhaarFrontUploaded && { borderColor: '#10B981', backgroundColor: '#ECFDF5' }]} 
              onPress={handleUploadFront}
            >
              <Text style={[styles.uploadIcon, onboardingData.aadhaarFrontUploaded && { color: '#10B981' }]}>
                {onboardingData.aadhaarFrontUploaded ? '✅' : '📄'}
              </Text>
              <Text style={[styles.uploadText, onboardingData.aadhaarFrontUploaded && { color: '#065F46' }]}>
                {onboardingData.aadhaarFrontUploaded ? 'aadhaar_front.jpg' : 'Aadhaar Front'} <Text style={styles.asterisk}>*</Text>
              </Text>
              <Text style={styles.uploadSubtext}>{onboardingData.aadhaarFrontUploaded ? 'Uploaded' : 'Upload'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.uploadBoxHalf, onboardingData.aadhaarBackUploaded && { borderColor: '#10B981', backgroundColor: '#ECFDF5' }]} 
              onPress={handleUploadBack}
            >
              <Text style={[styles.uploadIcon, onboardingData.aadhaarBackUploaded && { color: '#10B981' }]}>
                {onboardingData.aadhaarBackUploaded ? '✅' : '📄'}
              </Text>
              <Text style={[styles.uploadText, onboardingData.aadhaarBackUploaded && { color: '#065F46' }]}>
                {onboardingData.aadhaarBackUploaded ? 'aadhaar_back.jpg' : 'Aadhaar Back'} <Text style={styles.asterisk}>*</Text>
              </Text>
              <Text style={styles.uploadSubtext}>{onboardingData.aadhaarBackUploaded ? 'Uploaded' : 'Upload'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.privacyNotice}>
            <Text style={styles.privacyText}>
              <Text style={styles.privacyBold}>⚠️ Privacy Notice: </Text>
              Aadhaar data is masked and stored securely per UIDAI guidelines. Only last 4 digits are stored; full number is used only for OTP verification.
            </Text>
          </View>

          <Button
            title="Continue →"
            onPress={handleContinue}
            style={styles.button}
          />
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
  uploadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  uploadBoxHalf: {
    width: '48%',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  uploadIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
    textAlign: 'center',
  },
  asterisk: {
    color: '#DE1F26',
  },
  uploadSubtext: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
  },
  privacyNotice: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 32,
  },
  privacyText: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  privacyBold: {
    fontWeight: '700',
  },
  button: {
    marginTop: 'auto',
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
  verifiedButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
});
