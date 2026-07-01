import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TopNav } from '../../components/ui/TopNav';
import { useAuth } from '../../context/AuthContext';

export default function KycBusinessScreen() {
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

  const handleUdhyam = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      updateOnboardingData({
        isBusinessVerified: true,
        businessName: 'Sharma Finance Associates',
        gstin: '27AAAAA0000A1Z5',
      });
    }, 1500);
  };

  const handleUpload = () => {
    updateOnboardingData({ businessDocUploaded: true });
  };

  const handleContinue = () => {
    if (!onboardingData.isBusinessVerified && !onboardingData.businessDocUploaded) {
      alert('Please fetch Udhyam details or upload a valid business proof to proceed.');
      return;
    }
    router.push('/(auth)/kyc-agreement' as any);
  };

  const updateForm = (key: string, value: string) => {
    updateOnboardingData({ [key]: value });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="KYC Verification" step="Step 9/10" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: '90%' }]} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Business Proof</Text>
              <Text style={styles.subtitle}>Provide your firm or business registration details</Text>
            </View>

            <Input
              label="Document Type"
              placeholder="e.g. GST Certificate / Shop Act"
              value={onboardingData.businessDocType}
              onChangeText={(v) => updateForm('businessDocType', v)}
              required
            />

            <Button
              title={onboardingData.isBusinessVerified ? "Business Details Verified" : "Fetch Udhyam Details via API"}
              variant="primary"
              style={[styles.udhyamButton, onboardingData.isBusinessVerified && styles.verifiedButton]}
              isLoading={isVerifying}
              onPress={handleUdhyam}
              disabled={onboardingData.isBusinessVerified}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or upload document</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity 
              style={[styles.uploadBox, onboardingData.businessDocUploaded && { borderColor: '#10B981', backgroundColor: '#ECFDF5' }]} 
              onPress={handleUpload}
            >
              {onboardingData.businessDocUploaded ? (
                <>
                  <MaterialCommunityIcons name="check-circle" size={32} color="#10B981" style={{ marginBottom: 12 }} />
                  <Text style={[styles.uploadText, { color: '#065F46' }]}>business_proof.pdf Uploaded</Text>
                  <Text style={styles.uploadSubtext}>Tap to change file</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="file-document-outline" size={32} color="#64748B" style={{ marginBottom: 12 }} />
                  <Text style={styles.uploadText}>Upload Business Document <Text style={styles.asterisk}>*</Text></Text>
                  <Text style={styles.uploadSubtext}>Max size 5MB (PDF, JPG, PNG)</Text>
                </>
              )}
            </TouchableOpacity>

            <Input
              label="GSTIN (Optional)"
              placeholder="22AAAAA0000A1Z5"
              autoCapitalize="characters"
              maxLength={15}
              value={onboardingData.gstin}
              onChangeText={(v) => updateForm('gstin', v)}
            />

            <Input
              label="Business Name"
              placeholder="e.g. Sharma Finance Associates"
              value={onboardingData.businessName}
              onChangeText={(v) => updateForm('businessName', v)}
            />

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
    marginBottom: 24,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  asterisk: {
    color: '#DE1F26',
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#94A3B8',
  },
  button: {
    marginTop: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
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
  udhyamButton: {
    backgroundColor: '#0284C7',
    shadowColor: '#0284C7',
    marginBottom: 8,
  },
  verifiedButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
});
