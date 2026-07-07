import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, Animated, TouchableOpacity } from 'react-native';
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

  const handleDobChange = (text: string) => {
    const isAdding = text.length > (onboardingData.dob || '').length;
    let cleaned = text.replace(/[^0-9]/g, '');
    
    if (isAdding) {
      if (cleaned.length >= 2 && cleaned.length < 4) {
        cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
      } else if (cleaned.length >= 4) {
        cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
      }
      updateOnboardingData({ dob: cleaned });
    } else {
      updateOnboardingData({ dob: text });
    }
  };

  const handlePincodeChange = async (text: string) => {
    updateForm('pin', text);
    if (text.length === 6) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${text}`);
        const data = await response.json();
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const postOffice = data[0].PostOffice[0];
          updateForm('city', postOffice.District);
          updateForm('state', postOffice.State);
        }
      } catch (error) {
        console.warn('Failed to fetch pincode details', error);
      }
    }
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
                  onChangeText={handleDobChange}
                  maxLength={10}
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ width: 16 }} />
              <View style={styles.flex1}>
                <Text style={styles.genderLabel}>Gender</Text>
                <View style={styles.genderContainer}>
                  {['Male', 'Female'].map((g) => {
                    const isSelected = onboardingData.gender === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        style={[
                          styles.genderPill,
                          isSelected && styles.genderPillActive
                        ]}
                        onPress={() => updateForm('gender', g)}
                      >
                        <Text style={[
                          styles.genderPillText,
                          isSelected && styles.genderPillTextActive
                        ]}>
                          {g}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
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
                  maxLength={6}
                  value={onboardingData.pin}
                  onChangeText={handlePincodeChange}
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
  genderLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  genderContainer: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 3,
  },
  genderPill: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderPillActive: {
    backgroundColor: '#DE1F26',
    shadowColor: '#DE1F26',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  genderPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  genderPillTextActive: {
    color: '#FFFFFF',
  },
});
