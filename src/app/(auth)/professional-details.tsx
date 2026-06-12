import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TopNav } from '../../components/ui/TopNav';

export default function ProfessionalDetailsScreen() {
  const [form, setForm] = useState({
    occupation: '',
    experience: '',
    product: '',
    volume: '',
  });

  const handleContinue = () => {
    router.push('/(auth)/kyc-pan' as any);
  };

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="Professional Details" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Professional Details</Text>
            <Text style={styles.subtitle}>Tell us about your business profile</Text>
          </View>

          <Input
            label="Occupation Type"
            placeholder="e.g. Self Employed / Salaried"
            value={form.occupation}
            onChangeText={(v) => updateForm('occupation', v)}
          />

          <Input
            label="Years of Experience in Loans/Finance"
            placeholder="e.g. 5 Years"
            keyboardType="number-pad"
            value={form.experience}
            onChangeText={(v) => updateForm('experience', v)}
          />

          <Input
            label="Primary Product Interest"
            placeholder="e.g. Home Loan, LAP"
            value={form.product}
            onChangeText={(v) => updateForm('product', v)}
          />

          <Input
            label="Expected Monthly Sourcing Volume"
            placeholder="e.g. ₹50 Lakhs"
            value={form.volume}
            onChangeText={(v) => updateForm('volume', v)}
          />

          <Button
            title="Proceed to KYC →"
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
  button: {
    marginTop: 16,
    marginBottom: 24,
  },
});
