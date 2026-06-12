import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TopNav } from '../../components/ui/TopNav';

export default function KycPanScreen() {
  const [pan, setPan] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = () => {
    if (pan.length !== 10) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
    }, 1500);
  };

  const handleContinue = () => {
    router.push('/(auth)/kyc-aadhaar' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="KYC Verification" step="Step 1/6" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
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
            value={pan}
            onChangeText={(text) => {
              setPan(text);
              setIsVerified(false);
            }}
            required
          />

          <Button
            title={isVerified ? "✅ Verified" : "Verify via NSDL"}
            variant={isVerified ? "primary" : "outline"}
            style={[styles.verifyButton, isVerified && styles.verifiedButton]}
            isLoading={isVerifying}
            onPress={handleVerify}
            disabled={pan.length !== 10 || isVerified}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <Button
            title="🏛️ Fetch from DigiLocker"
            variant="primary"
            style={styles.digiButton}
          />

          <Text style={styles.uploadLabel}>Upload PAN Image (Optional)</Text>
          <TouchableOpacity style={styles.uploadBox}>
            <Text style={styles.uploadIcon}>📷</Text>
            <Text style={styles.uploadText}>Tap to upload or take a photo</Text>
            <Text style={styles.uploadSubtext}>Max size 5MB (JPG, PNG, PDF)</Text>
          </TouchableOpacity>

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
  uploadIcon: {
    fontSize: 32,
    marginBottom: 12,
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
