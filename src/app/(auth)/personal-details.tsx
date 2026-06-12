import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TopNav } from '../../components/ui/TopNav';

export default function PersonalDetailsScreen() {
  const [form, setForm] = useState({
    fullName: '',
    dob: '',
    gender: '',
    email: '',
    address: '',
    city: '',
    pin: '',
    state: '',
  });

  const handleContinue = () => {
    router.push('/(auth)/professional-details' as any);
  };

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="Personal Details" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Tell us about yourself</Text>
            <Text style={styles.subtitle}>Please provide your basic details</Text>
          </View>

          <Input
            label="Full Name (As per PAN)"
            placeholder="e.g. Rahul Sharma"
            value={form.fullName}
            onChangeText={(v) => updateForm('fullName', v)}
          />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Input
                label="Date of Birth"
                placeholder="DD/MM/YYYY"
                value={form.dob}
                onChangeText={(v) => updateForm('dob', v)}
              />
            </View>
            <View style={{ width: 16 }} />
            <View style={styles.flex1}>
              <Input
                label="Gender"
                placeholder="Select..."
                value={form.gender}
                onChangeText={(v) => updateForm('gender', v)}
              />
            </View>
          </View>

          <Input
            label="Email Address"
            placeholder="e.g. rahul@example.com"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(v) => updateForm('email', v)}
          />

          <Input
            label="Permanent Address"
            placeholder="House/Flat No., Street, Area"
            value={form.address}
            onChangeText={(v) => updateForm('address', v)}
          />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Input
                label="City"
                placeholder="e.g. Mumbai"
                value={form.city}
                onChangeText={(v) => updateForm('city', v)}
              />
            </View>
            <View style={{ width: 16 }} />
            <View style={styles.flex1}>
              <Input
                label="PIN Code"
                placeholder="e.g. 400001"
                keyboardType="number-pad"
                value={form.pin}
                onChangeText={(v) => updateForm('pin', v)}
              />
            </View>
          </View>

          <Input
            label="State"
            placeholder="e.g. Maharashtra"
            value={form.state}
            onChangeText={(v) => updateForm('state', v)}
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
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  button: {
    marginTop: 16,
    marginBottom: 24,
  },
});
