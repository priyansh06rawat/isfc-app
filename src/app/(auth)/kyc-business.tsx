import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TopNav } from '../../components/ui/TopNav';

export default function KycBusinessScreen() {
  const [form, setForm] = useState({
    docType: '',
    gstin: '',
    businessName: '',
  });

  const handleContinue = () => {
    router.push('/(auth)/kyc-bank' as any);
  };

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="KYC Verification" step="Step 4/6" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: '66%' }]} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Business Proof</Text>
            <Text style={styles.subtitle}>Provide your firm or business registration details</Text>
          </View>

          <Input
            label="Document Type"
            placeholder="e.g. GST Certificate / Shop Act"
            value={form.docType}
            onChangeText={(v) => updateForm('docType', v)}
            required
          />

          <TouchableOpacity style={styles.uploadBox}>
            <Text style={styles.uploadIcon}>📄</Text>
            <Text style={styles.uploadText}>Upload Business Document <Text style={styles.asterisk}>*</Text></Text>
            <Text style={styles.uploadSubtext}>Max size 5MB (PDF, JPG, PNG)</Text>
          </TouchableOpacity>

          <Input
            label="GSTIN (Optional)"
            placeholder="22AAAAA0000A1Z5"
            autoCapitalize="characters"
            maxLength={15}
            value={form.gstin}
            onChangeText={(v) => updateForm('gstin', v)}
          />

          <Input
            label="Business Name"
            placeholder="e.g. Sharma Finance Associates"
            value={form.businessName}
            onChangeText={(v) => updateForm('businessName', v)}
          />

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
  asterisk: {
    color: '#DE1F26',
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#94A3B8',
  },
  button: {
    marginTop: 'auto',
  },
});
