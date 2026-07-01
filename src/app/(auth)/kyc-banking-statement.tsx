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

export default function KycBankingStatementScreen() {
  const { onboardingData, updateOnboardingData } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleMonthToggle = (months: '3' | '6') => {
    updateOnboardingData({ bankStatementMonths: months, bankingStatementUploaded: false });
    // Animate the toggle
    scaleAnim.setValue(0.95);
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }).start();
  };

  const handleUpload = () => {
    updateOnboardingData({ bankingStatementUploaded: true });
    if (onboardingData.email) {
      sendStatusEmail({
        to: onboardingData.email,
        dsaName: onboardingData.fullName || 'Partner',
        stage: `Banking Statement (${onboardingData.bankStatementMonths} Months) Uploaded`,
      });
    }
  };

  const handleContinue = () => {
    if (!onboardingData.bankingStatementUploaded) {
      alert(`Please upload your ${onboardingData.bankStatementMonths}-month banking statement to proceed.`);
      return;
    }
    router.push('/(auth)/kyc-bank' as any);
  };

  const selected = onboardingData.bankStatementMonths;

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="KYC Verification" step="Step 5/10" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: '50%' }]} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Banking Statement</Text>
              <Text style={styles.subtitle}>
                Upload your bank statement to verify financial activity. Select the period that applies to you.
              </Text>
            </View>

            {/* Month Toggle */}
            <Text style={styles.toggleLabel}>Select Statement Period</Text>
            <Animated.View style={[styles.toggleContainer, { transform: [{ scale: scaleAnim }] }]}>
              <TouchableOpacity
                style={[styles.toggleOption, selected === '6' && styles.toggleOptionSelected]}
                onPress={() => handleMonthToggle('6')}
                id="statement-6months"
              >
                <MaterialCommunityIcons
                  name="calendar-month"
                  size={22}
                  color={selected === '6' ? '#FFFFFF' : '#64748B'}
                  style={{ marginBottom: 6 }}
                />
                <Text style={[styles.toggleText, selected === '6' && styles.toggleTextSelected]}>6 Months</Text>
                <Text style={[styles.toggleSub, selected === '6' && { color: '#FFD9DA' }]}>Recommended</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleOption, selected === '3' && styles.toggleOptionSelected]}
                onPress={() => handleMonthToggle('3')}
                id="statement-3months"
              >
                <MaterialCommunityIcons
                  name="calendar-today"
                  size={22}
                  color={selected === '3' ? '#FFFFFF' : '#64748B'}
                  style={{ marginBottom: 6 }}
                />
                <Text style={[styles.toggleText, selected === '3' && styles.toggleTextSelected]}>3 Months</Text>
                <Text style={[styles.toggleSub, selected === '3' && { color: '#FFD9DA' }]}>If applicable</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Info about selected period */}
            <View style={styles.infoChip}>
              <MaterialCommunityIcons name="information" size={14} color="#DE1F26" style={{ marginRight: 6 }} />
              <Text style={styles.infoChipText}>
                {selected === '6'
                  ? 'Please upload last 6 months statement from your primary business bank account.'
                  : 'A 3-month statement may be requested for review. 6 months is preferred for faster processing.'}
              </Text>
            </View>

            {/* Upload Area */}
            <Text style={styles.uploadLabel}>
              Upload {selected}-Month Statement <Text style={styles.asterisk}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.uploadBox, onboardingData.bankingStatementUploaded && styles.uploadBoxSuccess]}
              onPress={handleUpload}
              id="upload-bank-statement"
            >
              {onboardingData.bankingStatementUploaded ? (
                <>
                  <MaterialCommunityIcons name="check-circle" size={40} color="#10B981" style={{ marginBottom: 12 }} />
                  <Text style={[styles.uploadText, { color: '#065F46' }]}>
                    bank_statement_{selected}m.pdf
                  </Text>
                  <Text style={styles.uploadSubtext}>Uploaded · Tap to replace</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="file-chart-outline" size={40} color="#94A3B8" style={{ marginBottom: 12 }} />
                  <Text style={styles.uploadText}>Tap to upload your bank statement</Text>
                  <Text style={styles.uploadSubtext}>PDF, JPG or PNG · Max 10MB</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Privacy notice */}
            <View style={styles.privacyNotice}>
              <MaterialCommunityIcons name="shield-lock-outline" size={14} color="#92400E" style={{ marginRight: 6 }} />
              <Text style={styles.privacyText}>
                Your bank statement is encrypted and used only for income & creditworthiness assessment as per RBI guidelines.
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
  toggleLabel: { fontSize: 13, fontWeight: '700', color: '#2D3134', marginBottom: 12 },
  toggleContainer: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  toggleOption: {
    flex: 1, alignItems: 'center', paddingVertical: 20,
    borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 16,
    backgroundColor: '#F8F9FA',
  },
  toggleOptionSelected: { backgroundColor: '#DE1F26', borderColor: '#DE1F26' },
  toggleText: { fontSize: 16, fontWeight: '800', color: '#2D3134' },
  toggleTextSelected: { color: '#FFFFFF' },
  toggleSub: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  infoChip: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#FFF5F5', borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: '#FED7D7', marginBottom: 24,
  },
  infoChipText: { fontSize: 11, color: '#7B2C2C', flex: 1, lineHeight: 16 },
  uploadLabel: { fontSize: 13, fontWeight: '700', color: '#2D3134', marginBottom: 8 },
  asterisk: { color: '#DE1F26' },
  uploadBox: {
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#CBD5E1',
    borderRadius: 16, padding: 32, alignItems: 'center', backgroundColor: '#F8F9FA', marginBottom: 16,
  },
  uploadBoxSuccess: { borderColor: '#10B981', backgroundColor: '#ECFDF5', borderStyle: 'solid' },
  uploadText: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 4, textAlign: 'center' },
  uploadSubtext: { fontSize: 12, color: '#94A3B8' },
  privacyNotice: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FEF3C7',
    borderRadius: 8, padding: 10, marginBottom: 32,
  },
  privacyText: { fontSize: 11, color: '#92400E', lineHeight: 16, flex: 1 },
  button: { marginTop: 'auto' },
});
