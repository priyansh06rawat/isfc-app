import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TouchableOpacity, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TopNav } from '../../components/ui/TopNav';
import { useAuth } from '../../context/AuthContext';
import { sendStatusEmail } from '../../services/notifications';
import * as DocumentPicker from 'expo-document-picker';

const ITR_YEARS = ['AY 2024-25', 'AY 2023-24', 'AY 2022-23'];

export default function KycItrScreen() {
  const { onboardingData, updateOnboardingData } = useAuth();

  const handleBypass = () => {
    Alert.alert(
      'Bypass Bank Verification',
      'Would you like to temporarily bypass bank verification for testing purposes?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Bypass', onPress: () => updateOnboardingData({ isBankVerified: true }) }
      ]
    );
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const lockAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    if (!onboardingData.isBankVerified) {
      // Shake animation for the lock banner
      Animated.sequence([
        Animated.timing(lockAnim, { toValue: 8, duration: 80, useNativeDriver: true }),
        Animated.timing(lockAnim, { toValue: -8, duration: 80, useNativeDriver: true }),
        Animated.timing(lockAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(lockAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(lockAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, []);

  const handleUploadItr = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateOnboardingData({ itrUploaded: true, itrUri: result.assets[0].uri });
        if (onboardingData.email) {
          sendStatusEmail({
            to: onboardingData.email,
            dsaName: onboardingData.fullName || 'Partner',
            stage: 'ITR Details Submitted',
          });
        }
      }
    } catch (e) {
      console.warn('Document upload error:', e);
      Alert.alert('Upload Failed', 'Could not pick document.');
    }
  };

  const handleContinue = () => {
    if (!onboardingData.isBankVerified) {
      alert('Please complete Penny Drop bank verification before submitting ITR details.');
      return;
    }
    if (!onboardingData.itrYear) {
      alert('Please select the ITR Assessment Year.');
      return;
    }
    if (!onboardingData.itrUploaded) {
      alert('Please upload your ITR Acknowledgement to proceed.');
      return;
    }
    router.push('/(auth)/kyc-enrollment-letter' as any);
  };

  const isPennDropDone = onboardingData.isBankVerified;

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
              <Text style={styles.title}>ITR Details</Text>
              <Text style={styles.subtitle}>
                Provide your Income Tax Return details for financial verification
              </Text>
            </View>

            {/* Penny Drop Gate Banner */}
            {!isPennDropDone ? (
              <TouchableOpacity activeOpacity={0.9} onPress={handleBypass} style={{ marginBottom: 20 }}>
                <Animated.View style={[styles.gateBanner, { transform: [{ translateX: lockAnim }], marginBottom: 0 }]}>
                  <MaterialCommunityIcons name="lock" size={22} color="#DC2626" style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.gateTitle}>Bank Verification Required (Tap to Bypass for Test)</Text>
                    <Text style={styles.gateText}>
                      ITR details are locked until your bank account is verified via Penny Drop.
                      Please go back and complete bank verification first.
                    </Text>
                  </View>
                </Animated.View>
              </TouchableOpacity>
            ) : (
              <View style={styles.unlockBanner}>
                <MaterialCommunityIcons name="lock-open-variant" size={18} color="#059669" style={{ marginRight: 8 }} />
                <Text style={styles.unlockText}>Bank verified — ITR form unlocked</Text>
              </View>
            )}

            {/* ITR Form — only active when bank is verified */}
            <View style={[styles.formSection, !isPennDropDone && styles.formSectionLocked]}>
              {/* Assessment Year Selection */}
              <Text style={styles.fieldLabel}>
                Assessment Year <Text style={styles.asterisk}>*</Text>
              </Text>
              <View style={styles.yearRow}>
                {ITR_YEARS.map((yr) => (
                  <TouchableOpacity
                    key={yr}
                    style={[
                      styles.yearChip,
                      onboardingData.itrYear === yr && styles.yearChipSelected,
                      !isPennDropDone && styles.yearChipDisabled,
                    ]}
                    onPress={() => isPennDropDone && updateOnboardingData({ itrYear: yr })}
                    disabled={!isPennDropDone}
                  >
                    <Text
                      style={[
                        styles.yearChipText,
                        onboardingData.itrYear === yr && styles.yearChipTextSelected,
                      ]}
                    >
                      {yr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Annual Income (as per ITR)"
                placeholder="e.g. 800000"
                keyboardType="number-pad"
                value={onboardingData.itrIncome}
                onChangeText={(v) => updateOnboardingData({ itrIncome: v })}
                editable={isPennDropDone}
              />

              {/* ITR Upload */}
              <Text style={styles.uploadLabel}>
                Upload ITR Acknowledgement <Text style={styles.asterisk}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.uploadBox,
                  onboardingData.itrUploaded && styles.uploadBoxSuccess,
                  !isPennDropDone && styles.uploadBoxDisabled,
                ]}
                onPress={handleUploadItr}
                disabled={!isPennDropDone}
              >
                {onboardingData.itrUploaded ? (
                  <>
                    <MaterialCommunityIcons name="check-circle" size={36} color="#10B981" style={{ marginBottom: 10 }} />
                    <Text style={[styles.uploadText, { color: '#065F46' }]}>itr_acknowledgement.pdf</Text>
                    <Text style={styles.uploadSubtext}>Uploaded · Tap to replace</Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name={isPennDropDone ? 'file-upload-outline' : 'lock-outline'}
                      size={36}
                      color={isPennDropDone ? '#94A3B8' : '#CBD5E1'}
                      style={{ marginBottom: 10 }}
                    />
                    <Text style={[styles.uploadText, !isPennDropDone && { color: '#CBD5E1' }]}>
                      {isPennDropDone ? 'Tap to upload ITR Acknowledgement' : 'Locked — Verify bank first'}
                    </Text>
                    <Text style={styles.uploadSubtext}>PDF · Max 5MB</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Income Tax note */}
              <View style={styles.notice}>
                <MaterialCommunityIcons name="information-outline" size={13} color="#1D4ED8" style={{ marginRight: 6 }} />
                <Text style={styles.noticeText}>
                  ITR acknowledgement is the PDF downloaded from the Income Tax e-filing portal after filing your return.
                </Text>
              </View>
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
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#2D3134', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#64748B', lineHeight: 20 },
  gateBanner: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#FEF2F2', borderWidth: 1.5, borderColor: '#FCA5A5',
    borderRadius: 14, padding: 16, marginBottom: 20,
  },
  gateTitle: { fontSize: 13, fontWeight: '800', color: '#DC2626', marginBottom: 4 },
  gateText: { fontSize: 12, color: '#7F1D1D', lineHeight: 18 },
  unlockBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0',
    borderRadius: 10, padding: 12, marginBottom: 20,
  },
  unlockText: { fontSize: 13, fontWeight: '700', color: '#065F46' },
  formSection: { opacity: 1 },
  formSectionLocked: { opacity: 0.4 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#2D3134', marginBottom: 10 },
  asterisk: { color: '#DE1F26' },
  yearRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  yearChip: {
    paddingVertical: 8, paddingHorizontal: 14,
    borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  yearChipSelected: { backgroundColor: '#DE1F26', borderColor: '#DE1F26' },
  yearChipDisabled: { borderColor: '#E2E8F0' },
  yearChipText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  yearChipTextSelected: { color: '#FFFFFF' },
  uploadLabel: { fontSize: 13, fontWeight: '700', color: '#2D3134', marginBottom: 8 },
  uploadBox: {
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#CBD5E1',
    borderRadius: 14, padding: 28, alignItems: 'center', backgroundColor: '#F8F9FA', marginBottom: 16,
  },
  uploadBoxSuccess: { borderColor: '#10B981', backgroundColor: '#ECFDF5', borderStyle: 'solid' },
  uploadBoxDisabled: { backgroundColor: '#F8F9FA', borderColor: '#E2E8F0' },
  uploadText: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 4, textAlign: 'center' },
  uploadSubtext: { fontSize: 11, color: '#94A3B8' },
  notice: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#EFF6FF', borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 32,
  },
  noticeText: { fontSize: 11, color: '#1E40AF', lineHeight: 16, flex: 1 },
  button: { marginTop: 'auto' },
});
