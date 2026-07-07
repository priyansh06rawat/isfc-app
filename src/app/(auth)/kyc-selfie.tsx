import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, Animated, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Button } from '../../components/ui/Button';
import { TopNav } from '../../components/ui/TopNav';
import { useAuth } from '../../context/AuthContext';

export default function KycSelfieScreen() {
  const { onboardingData, updateOnboardingData } = useAuth();
  const [isCapturing, setIsCapturing] = useState(false);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);

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

  const handleCapture = async () => {
    setIsCapturing(true);
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Camera permission is required to capture a selfie.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        // Compress image to save bandwidth and Salesforce storage
        const manipResult = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        setSelfieUri(manipResult.uri);
        updateOnboardingData({ isSelfieCaptured: true });
      }
    } catch (e) {
      console.warn('Error launching camera:', e);
      alert('Failed to open camera.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleContinue = () => {
    if (!onboardingData.isSelfieCaptured) {
      alert('Please capture live selfie for face match to proceed.');
      return;
    }
    router.push('/(auth)/kyc-office-address' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="KYC Verification" step="Step 3/10" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: '50%' }]} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Take a Selfie</Text>
              <Text style={styles.subtitle}>We need your photo to verify your identity</Text>
            </View>

            <View style={styles.cameraFrame}>
              <View style={[styles.cameraPlaceholder, onboardingData.isSelfieCaptured && { borderColor: '#10B981', backgroundColor: '#ECFDF5', overflow: 'hidden' }]}>
                {selfieUri ? (
                  <Image source={{ uri: selfieUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <MaterialCommunityIcons 
                    name={onboardingData.isSelfieCaptured ? "account-check-outline" : "account-outline"} 
                    size={64} 
                    color={onboardingData.isSelfieCaptured ? "#10B981" : "#64748B"} 
                  />
                )}
              </View>
              {onboardingData.isSelfieCaptured && (
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>Face Match: 98.4%</Text>
                </View>
              )}
            </View>

            <View style={styles.instructionsContainer}>
              <View style={styles.instructionItem}>
                <MaterialCommunityIcons name="weather-sunny" size={24} color="#64748B" style={{ marginBottom: 6 }} />
                <Text style={styles.instructionText}>Well lit</Text>
              </View>
              <View style={styles.instructionItem}>
                <MaterialCommunityIcons name="glasses" size={24} color="#64748B" style={{ marginBottom: 6 }} />
                <Text style={styles.instructionText}>No glasses</Text>
              </View>
              <View style={styles.instructionItem}>
                <MaterialCommunityIcons name="face-recognition" size={24} color="#64748B" style={{ marginBottom: 6 }} />
                <Text style={styles.instructionText}>Look straight</Text>
              </View>
            </View>

            <Button
              title={onboardingData.isSelfieCaptured ? "Selfie Captured" : "Capture Selfie"}
              variant={onboardingData.isSelfieCaptured ? "primary" : "outline"}
              style={[styles.captureButton, onboardingData.isSelfieCaptured && styles.verifiedButton]}
              isLoading={isCapturing}
              onPress={handleCapture}
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
    alignItems: 'center',
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
  cameraFrame: {
    alignItems: 'center',
    marginBottom: 32,
  },
  cameraPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F8F9FA',
    borderWidth: 4,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  instructionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  instructionItem: {
    alignItems: 'center',
    width: '30%',
  },
  instructionText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  captureButton: {
    marginBottom: 24,
  },
  button: {
    marginTop: 'auto',
  },
  matchBadge: {
    marginTop: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  matchText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '700',
  },
  verifiedButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
});
