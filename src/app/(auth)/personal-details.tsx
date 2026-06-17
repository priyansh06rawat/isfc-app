import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TopNav } from '../../components/ui/TopNav';
import { useAuth } from '../../context/AuthContext';

export default function PersonalDetailsScreen() {
  const { onboardingData, updateOnboardingData } = useAuth();
  
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

  const handleContinue = () => {
    // Basic validation: name, email, city are good to check
    if (!onboardingData.fullName || !onboardingData.email || !onboardingData.city) {
      alert('Please fill in Name, Email, and City to proceed.');
      return;
    }
    router.push('/(auth)/professional-details' as any);
  };

  const updateForm = (key: string, value: string) => {
    updateOnboardingData({ [key]: value });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="Personal Details" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.header}>
              <Text style={styles.title}>Tell us about yourself</Text>
              <Text style={styles.subtitle}>Please provide your basic details</Text>
            </View>

            <Input
              label="Full Name (As per PAN)"
              placeholder="e.g. Rahul Sharma"
              value={onboardingData.fullName}
              onChangeText={(v) => updateForm('fullName', v)}
            />

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Input
                  label="Date of Birth"
                  placeholder="DD/MM/YYYY"
                  value={onboardingData.dob}
                  onChangeText={(v) => updateForm('dob', v)}
                />
              </View>
              <View style={{ width: 16 }} />
              <View style={styles.flex1}>
                <Input
                  label="Gender"
                  placeholder="Select..."
                  value={onboardingData.gender}
                  onChangeText={(v) => updateForm('gender', v)}
                />
              </View>
            </View>

            <Input
              label="Email Address"
              placeholder="e.g. rahul@example.com"
              keyboardType="email-address"
              value={onboardingData.email}
              onChangeText={(v) => updateForm('email', v)}
            />

            <Input
              label="Permanent Address"
              placeholder="House/Flat No., Street, Area"
              value={onboardingData.address}
              onChangeText={(v) => updateForm('address', v)}
            />

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Input
                  label="City"
                  placeholder="e.g. Mumbai"
                  value={onboardingData.city}
                  onChangeText={(v) => updateForm('city', v)}
                />
              </View>
              <View style={{ width: 16 }} />
              <View style={styles.flex1}>
                <Input
                  label="PIN Code"
                  placeholder="e.g. 400001"
                  keyboardType="number-pad"
                  value={onboardingData.pin}
                  onChangeText={(v) => updateForm('pin', v)}
                />
              </View>
            </View>

            <Input
              label="State"
              placeholder="e.g. Maharashtra"
              value={onboardingData.state}
              onChangeText={(v) => updateForm('state', v)}
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
