import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TopNav } from '../../components/ui/TopNav';

export default function KycAadhaarScreen() {
  const [aadhaar, setAadhaar] = useState('');

  const handleContinue = () => {
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
            value={aadhaar}
            onChangeText={setAadhaar}
            required
          />

          <View style={styles.uploadRow}>
            <TouchableOpacity style={styles.uploadBoxHalf}>
              <Text style={styles.uploadIcon}>📄</Text>
              <Text style={styles.uploadText}>Aadhaar Front <Text style={styles.asterisk}>*</Text></Text>
              <Text style={styles.uploadSubtext}>Upload</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadBoxHalf}>
              <Text style={styles.uploadIcon}>📄</Text>
              <Text style={styles.uploadText}>Aadhaar Back <Text style={styles.asterisk}>*</Text></Text>
              <Text style={styles.uploadSubtext}>Upload</Text>
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
});
