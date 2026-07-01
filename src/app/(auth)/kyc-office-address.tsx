import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TopNav } from '../../components/ui/TopNav';
import { useAuth } from '../../context/AuthContext';
import { sendStatusEmail } from '../../services/notifications';

export default function KycOfficeAddressScreen() {
  const { onboardingData, updateOnboardingData } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleUdhyamVerify = () => {
    if (!onboardingData.udhyamNumber || onboardingData.udhyamNumber.length < 12) {
      alert('Please enter a valid Udhyam Registration Number (e.g. UDYAM-XX-00-0000000).');
      return;
    }
    setIsVerifying(true);
    // Mock Udhyam portal verification
    setTimeout(() => {
      setIsVerifying(false);
      updateOnboardingData({ isUdhyamVerified: true });
      // Notify DSA via email
      if (onboardingData.email) {
        sendStatusEmail({
          to: onboardingData.email,
          dsaName: onboardingData.fullName || 'Partner',
          stage: 'Office Address & MSME Verified',
        });
      }
    }, 2000);
  };

  const handleUploadMsmeCert = () => {
    updateOnboardingData({ msmeCertUploaded: true });
  };

  const handleContinue = () => {
    if (!onboardingData.officeAddress || !onboardingData.officeCity || !onboardingData.officePin) {
      alert('Please fill in your complete office address.');
      return;
    }
    if (!onboardingData.isUdhyamVerified && !onboardingData.msmeCertUploaded) {
      alert('Please verify via Udhyam Portal or upload your MSME Certificate.');
      return;
    }
    router.push('/(auth)/kyc-banking-statement' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="KYC Verification" step="Step 4/10" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: '40%' }]} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Office Address</Text>
              <Text style={styles.subtitle}>Verify your business office address and MSME registration</Text>
            </View>

            {/* Office Address Fields */}
            <Input
              label="Office Address"
              placeholder="Building, Street, Area"
              value={onboardingData.officeAddress}
              onChangeText={(v) => updateOnboardingData({ officeAddress: v })}
              required
            />
            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Input
                  label="City"
                  placeholder="City"
                  value={onboardingData.officeCity}
                  onChangeText={(v) => updateOnboardingData({ officeCity: v })}
                  required
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Input
                  label="PIN Code"
                  placeholder="6-digit PIN"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={onboardingData.officePin}
                  onChangeText={(v) => updateOnboardingData({ officePin: v })}
                  required
                />
              </View>
            </View>
            <Input
              label="State"
              placeholder="State"
              value={onboardingData.officeState}
              onChangeText={(v) => updateOnboardingData({ officeState: v })}
            />

            {/* Udhyam Verification */}
            <View style={styles.sectionDivider}>
              <Text style={styles.sectionTitle}>Udhyam / MSME Verification</Text>
            </View>

            <Input
              label="Udhyam Registration Number"
              placeholder="UDYAM-XX-00-0000000"
              autoCapitalize="characters"
              value={onboardingData.udhyamNumber}
              onChangeText={(v) => updateOnboardingData({ udhyamNumber: v, isUdhyamVerified: false })}
            />

            <Button
              title={onboardingData.isUdhyamVerified ? '✓ Udhyam Verified (MSME Portal)' : 'Verify via Udhyam Portal'}
              variant={onboardingData.isUdhyamVerified ? 'primary' : 'outline'}
              style={[styles.verifyBtn, onboardingData.isUdhyamVerified && styles.verifiedBtn]}
              isLoading={isVerifying}
              onPress={handleUdhyamVerify}
              disabled={onboardingData.isUdhyamVerified}
            />

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or upload MSME certificate</Text>
              <View style={styles.divider} />
            </View>

            {/* MSME Certificate Upload */}
            <TouchableOpacity
              style={[styles.uploadBox, onboardingData.msmeCertUploaded && styles.uploadBoxSuccess]}
              onPress={handleUploadMsmeCert}
            >
              <MaterialCommunityIcons
                name={onboardingData.msmeCertUploaded ? 'check-circle' : 'file-certificate-outline'}
                size={32}
                color={onboardingData.msmeCertUploaded ? '#10B981' : '#64748B'}
                style={{ marginBottom: 8 }}
              />
              <Text style={[styles.uploadText, onboardingData.msmeCertUploaded && { color: '#065F46' }]}>
                {onboardingData.msmeCertUploaded ? 'msme_certificate.pdf' : 'MSME Certificate'}{' '}
                <Text style={styles.asterisk}>*</Text>
              </Text>
              <Text style={styles.uploadSubtext}>
                {onboardingData.msmeCertUploaded ? 'Uploaded' : 'Upload PDF / Image'}
              </Text>
            </TouchableOpacity>

            {/* Notice */}
            <View style={styles.notice}>
              <MaterialCommunityIcons name="information-outline" size={14} color="#1D4ED8" style={{ marginRight: 6 }} />
              <Text style={styles.noticeText}>
                Udhyam verification confirms your business is registered under the MSME Development Act.
              </Text>
            </View>

            <Button title="Continue" onPress={handleContinue} style={styles.button} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 24, flexGrow: 1 },
  progressContainer: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, marginBottom: 24, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#DE1F26', borderRadius: 3 },
  header: { marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '800', color: '#2D3134', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#64748B', lineHeight: 20 },
  rowInputs: { flexDirection: 'row' },
  sectionDivider: { marginBottom: 16, marginTop: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#2D3134', borderBottomWidth: 2, borderBottomColor: '#DE1F26', paddingBottom: 6 },
  verifyBtn: { marginBottom: 20 },
  verifiedBtn: { backgroundColor: '#10B981', borderColor: '#10B981' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  divider: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { fontSize: 12, color: '#94A3B8', paddingHorizontal: 12 },
  uploadBox: {
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#CBD5E1',
    borderRadius: 12, padding: 24, alignItems: 'center', backgroundColor: '#F8F9FA', marginBottom: 16,
  },
  uploadBoxSuccess: { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
  uploadText: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 4 },
  asterisk: { color: '#DE1F26' },
  uploadSubtext: { fontSize: 11, color: '#0284C7', fontWeight: '600' },
  notice: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#EFF6FF', borderRadius: 8, padding: 10, marginBottom: 32, borderWidth: 1, borderColor: '#BFDBFE',
  },
  noticeText: { fontSize: 11, color: '#1E40AF', lineHeight: 16, flex: 1 },
  button: { marginTop: 'auto' },
});
