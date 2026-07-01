import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TopNav } from '../../components/ui/TopNav';
import { useAuth } from '../../context/AuthContext';
import { sendStatusEmail } from '../../services/notifications';

export default function KycEnrollmentLetterScreen() {
  const { onboardingData, updateOnboardingData } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const skipPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    // Pulse the "Skip" option softly
    Animated.loop(
      Animated.sequence([
        Animated.timing(skipPulse, { toValue: 1.04, duration: 900, useNativeDriver: true }),
        Animated.timing(skipPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleUpload = () => {
    updateOnboardingData({ enrollmentLetterUploaded: true, enrollmentSkipped: false });
    if (onboardingData.email) {
      sendStatusEmail({
        to: onboardingData.email,
        dsaName: onboardingData.fullName || 'Partner',
        stage: 'Enrollment Letter Uploaded',
      });
    }
  };

  const handleSkip = () => {
    updateOnboardingData({ enrollmentSkipped: true, enrollmentLetterUploaded: false });
    router.push('/(auth)/kyc-business' as any);
  };

  const handleContinue = () => {
    if (!onboardingData.enrollmentSkipped && !onboardingData.enrollmentLetterUploaded) {
      alert('Please upload your enrollment letter or tap "Skip" if you are not associated with any other DSA company.');
      return;
    }
    if (!onboardingData.enrollmentSkipped && (!onboardingData.enrollmentCompany)) {
      alert('Please enter the company name for which you have an enrollment letter.');
      return;
    }
    router.push('/(auth)/kyc-business' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="KYC Verification" step="Step 7/10" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: '70%' }]} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Enrollment Letter</Text>
              <Text style={styles.subtitle}>
                If you are already a DSA with another financial institution, please upload your enrollment letter.
                This helps us verify your existing partnerships.
              </Text>
            </View>

            {/* What is this? */}
            <View style={styles.whatIsThis}>
              <View style={styles.whatIsRow}>
                <MaterialCommunityIcons name="help-circle-outline" size={16} color="#6D28D9" style={{ marginRight: 8 }} />
                <Text style={styles.whatIsTitle}>What is an Enrollment Letter?</Text>
              </View>
              <Text style={styles.whatIsText}>
                A letter issued by your current DSA company confirming your association with them.
                This helps ensure compliance and prevents conflicts of interest.
              </Text>
            </View>

            {/* Form fields — shown only when not skipped */}
            {!onboardingData.enrollmentSkipped && (
              <>
                <Input
                  label="Company / Institution Name"
                  placeholder="e.g. ABC Home Finance Ltd."
                  value={onboardingData.enrollmentCompany}
                  onChangeText={(v) => updateOnboardingData({ enrollmentCompany: v })}
                />
                <Input
                  label="Your DSA Code at that Company"
                  placeholder="e.g. DSA-12345 (Optional)"
                  value={onboardingData.enrollmentDsaCode}
                  onChangeText={(v) => updateOnboardingData({ enrollmentDsaCode: v })}
                />

                {/* Upload Area */}
                <Text style={styles.uploadLabel}>
                  Upload Enrollment Letter
                </Text>
                <TouchableOpacity
                  style={[styles.uploadBox, onboardingData.enrollmentLetterUploaded && styles.uploadBoxSuccess]}
                  onPress={handleUpload}
                  id="upload-enrollment-letter"
                >
                  {onboardingData.enrollmentLetterUploaded ? (
                    <>
                      <MaterialCommunityIcons name="check-circle" size={36} color="#10B981" style={{ marginBottom: 10 }} />
                      <Text style={[styles.uploadText, { color: '#065F46' }]}>enrollment_letter.pdf</Text>
                      <Text style={styles.uploadSubtext}>Uploaded · Tap to replace</Text>
                    </>
                  ) : (
                    <>
                      <MaterialCommunityIcons name="file-account-outline" size={36} color="#94A3B8" style={{ marginBottom: 10 }} />
                      <Text style={styles.uploadText}>Tap to upload Enrollment Letter</Text>
                      <Text style={styles.uploadSubtext}>PDF, JPG or PNG · Max 5MB</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Skipped state */}
            {onboardingData.enrollmentSkipped && (
              <View style={styles.skippedBanner}>
                <MaterialCommunityIcons name="check-circle-outline" size={20} color="#059669" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.skippedTitle}>Skipped</Text>
                  <Text style={styles.skippedText}>
                    You've indicated that you are not currently associated with any other DSA company.
                  </Text>
                </View>
                <TouchableOpacity onPress={() => updateOnboardingData({ enrollmentSkipped: false })}>
                  <Text style={styles.undoText}>Undo</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Skip option */}
            {!onboardingData.enrollmentSkipped && (
              <Animated.View style={{ transform: [{ scale: skipPulse }] }}>
                <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} id="skip-enrollment-letter">
                  <MaterialCommunityIcons name="skip-next-circle-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
                  <Text style={styles.skipText}>Skip — I'm not associated with any other DSA</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

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
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#2D3134', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#64748B', lineHeight: 20 },
  whatIsThis: {
    backgroundColor: '#F5F3FF', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#DDD6FE', marginBottom: 24,
  },
  whatIsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  whatIsTitle: { fontSize: 13, fontWeight: '800', color: '#5B21B6' },
  whatIsText: { fontSize: 12, color: '#4C1D95', lineHeight: 18 },
  uploadLabel: { fontSize: 13, fontWeight: '700', color: '#2D3134', marginBottom: 8 },
  uploadBox: {
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#CBD5E1',
    borderRadius: 14, padding: 28, alignItems: 'center', backgroundColor: '#F8F9FA', marginBottom: 20,
  },
  uploadBoxSuccess: { borderColor: '#10B981', backgroundColor: '#ECFDF5', borderStyle: 'solid' },
  uploadText: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 4, textAlign: 'center' },
  uploadSubtext: { fontSize: 11, color: '#94A3B8' },
  skippedBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0',
    borderRadius: 12, padding: 14, marginBottom: 20,
  },
  skippedTitle: { fontSize: 13, fontWeight: '800', color: '#065F46', marginBottom: 2 },
  skippedText: { fontSize: 11, color: '#047857', lineHeight: 16 },
  undoText: { fontSize: 12, color: '#DE1F26', fontWeight: '700', marginLeft: 8 },
  skipBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 12, backgroundColor: '#F8F9FA', marginBottom: 20,
  },
  skipText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  button: { marginTop: 'auto' },
});
