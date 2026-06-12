import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { TopNav } from '../../components/ui/TopNav';
import { useAuth } from '../../context/AuthContext';

export default function KycAgreementScreen() {
  const { verifyOtp } = useAuth();
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = () => {
    if (agreed) {
      // Complete onboarding and authenticate
      verifyOtp();
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="KYC Verification" step="Step 6/6" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: '100%' }]} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>DSA Agreement</Text>
          <Text style={styles.subtitle}>Review and sign the partnership agreement</Text>
        </View>

        <View style={styles.documentBox}>
          <Text style={styles.docIcon}>📄</Text>
          <View style={styles.docInfo}>
            <Text style={styles.docTitle}>India_Shelter_DSA_Agreement.pdf</Text>
            <Text style={styles.docSize}>2.4 MB</Text>
          </View>
          <TouchableOpacity style={styles.downloadButton}>
            <Text style={styles.downloadIcon}>⬇️</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.uploadLabel}>Upload Signed Agreement</Text>
        <TouchableOpacity style={styles.uploadBox}>
          <Text style={styles.uploadIcon}>✍️</Text>
          <Text style={styles.uploadText}>Tap to upload signed copy</Text>
          <Text style={styles.uploadSubtext}>Or sign digitally via Aadhaar eSign</Text>
        </TouchableOpacity>

        <Button
          title="🔐 E-Sign with Aadhaar"
          variant="outline"
          style={styles.esignButton}
        />

        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxText}>
            I have read and agree to all the terms & conditions mentioned in the agreement. I confirm that the information provided is correct.
          </Text>
        </TouchableOpacity>

        <Button
          title="Submit Application 🎉"
          onPress={handleSubmit}
          disabled={!agreed}
          style={styles.button}
        />
      </ScrollView>
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
  documentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginBottom: 32,
  },
  docIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3134',
    marginBottom: 2,
  },
  docSize: {
    fontSize: 12,
    color: '#64748B',
  },
  downloadButton: {
    padding: 8,
  },
  downloadIcon: {
    fontSize: 20,
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
    marginBottom: 16,
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
  esignButton: {
    marginBottom: 32,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#DE1F26',
    borderColor: '#DE1F26',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  button: {
    marginTop: 'auto',
  },
});
