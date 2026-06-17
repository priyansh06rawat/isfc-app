import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TopNav } from '../../components/ui/TopNav';
import { useAuth } from '../../context/AuthContext';

export default function KycBankScreen() {
  const { onboardingData, updateOnboardingData } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    if (!onboardingData.accNumber || !onboardingData.ifsc) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      updateOnboardingData({ isBankVerified: true });
    }, 1500);
  };

  const handleUpload = () => {
    updateOnboardingData({ bankDocUploaded: true });
  };

  const handleContinue = () => {
    if (!onboardingData.accName || !onboardingData.accNumber || !onboardingData.ifsc) {
      alert('Please fill in Account Name, Account Number, and IFSC.');
      return;
    }
    if (!onboardingData.isBankVerified && !onboardingData.bankDocUploaded) {
      alert('Please verify bank via Penny Drop or upload Bank Statement to proceed.');
      return;
    }
    router.push('/(auth)/kyc-agreement' as any);
  };

  const updateForm = (key: string, value: string) => {
    updateOnboardingData({ [key]: value });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="KYC Verification" step="Step 5/6" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: '83%' }]} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Bank Verification</Text>
            <Text style={styles.subtitle}>Add bank details where you want to receive your commission payouts</Text>
          </View>

          <Input
            label="Account Holder Name"
            placeholder="As per bank records"
            value={onboardingData.accName}
            onChangeText={(v) => { updateForm('accName', v); updateOnboardingData({ isBankVerified: false }); }}
            required
          />

          <Input
            label="Account Number"
            placeholder="Enter account number"
            keyboardType="number-pad"
            value={onboardingData.accNumber}
            onChangeText={(v) => { updateForm('accNumber', v); updateOnboardingData({ isBankVerified: false }); }}
            required
          />

          <Input
            label="IFSC Code"
            placeholder="e.g. HDFC0001234"
            autoCapitalize="characters"
            maxLength={11}
            value={onboardingData.ifsc}
            onChangeText={(v) => { updateForm('ifsc', v); updateOnboardingData({ isBankVerified: false }); }}
            required
          />

          <Input
            label="Account Type"
            placeholder="e.g. Savings / Current"
            value={onboardingData.accType}
            onChangeText={(v) => updateForm('accType', v)}
          />

          <Button
            title={onboardingData.isBankVerified ? "✅ Bank Verified" : "₹1 Penny Drop Verification"}
            variant={onboardingData.isBankVerified ? "primary" : "outline"}
            style={[styles.verifyButton, onboardingData.isBankVerified && styles.verifiedButton]}
            isLoading={isVerifying}
            onPress={handleVerify}
            disabled={!onboardingData.accNumber || !onboardingData.ifsc || onboardingData.isBankVerified}
          />

          <Text style={styles.uploadLabel}>Upload Cancelled Cheque / Statement</Text>
          <TouchableOpacity 
            style={[styles.uploadBox, onboardingData.bankDocUploaded && { borderColor: '#10B981', backgroundColor: '#ECFDF5' }]} 
            onPress={handleUpload}
          >
            {onboardingData.bankDocUploaded ? (
              <>
                <Text style={[styles.uploadIcon, { color: '#10B981' }]}>✅</Text>
                <Text style={[styles.uploadText, { color: '#065F46' }]}>cancelled_cheque.pdf Uploaded</Text>
                <Text style={styles.uploadSubtext}>Tap to change file</Text>
              </>
            ) : (
              <>
                <Text style={styles.uploadIcon}>🏦</Text>
                <Text style={styles.uploadText}>Tap to upload</Text>
                <Text style={styles.uploadSubtext}>Must clearly show Name, A/C No and IFSC</Text>
              </>
            )}
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
    marginBottom: 24,
  },
  verifiedButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
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
    textAlign: 'center',
  },
  button: {
    marginTop: 'auto',
  },
});
