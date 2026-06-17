import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { TopNav } from '../../components/ui/TopNav';
import { useAuth } from '../../context/AuthContext';

export default function KycSelfieScreen() {
  const { onboardingData, updateOnboardingData } = useAuth();
  const [isCapturing, setIsCapturing] = React.useState(false);

  const handleCapture = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      updateOnboardingData({ isSelfieCaptured: true });
    }, 1500);
  };

  const handleContinue = () => {
    if (!onboardingData.isSelfieCaptured) {
      alert('Please capture live selfie for face match to proceed.');
      return;
    }
    router.push('/(auth)/kyc-business' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="KYC Verification" step="Step 3/6" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: '50%' }]} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Take a Selfie</Text>
            <Text style={styles.subtitle}>We need your photo to verify your identity</Text>
          </View>

          <View style={styles.cameraFrame}>
            <View style={[styles.cameraPlaceholder, onboardingData.isSelfieCaptured && { borderColor: '#10B981', backgroundColor: '#ECFDF5' }]}>
              <Text style={styles.cameraIcon}>
                {onboardingData.isSelfieCaptured ? '😊' : '👤'}
              </Text>
            </View>
            {onboardingData.isSelfieCaptured && (
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>✅ Face Match: 98.4%</Text>
              </View>
            )}
          </View>

          <View style={styles.instructionsContainer}>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionIcon}>☀️</Text>
              <Text style={styles.instructionText}>Well lit</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionIcon}>👓</Text>
              <Text style={styles.instructionText}>No glasses</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionIcon}>😐</Text>
              <Text style={styles.instructionText}>Look straight</Text>
            </View>
          </View>

          <Button
            title={onboardingData.isSelfieCaptured ? "✅ Selfie Captured" : "📸 Capture Selfie"}
            variant={onboardingData.isSelfieCaptured ? "primary" : "outline"}
            style={[styles.captureButton, onboardingData.isSelfieCaptured && styles.verifiedButton]}
            isLoading={isCapturing}
            onPress={handleCapture}
            disabled={onboardingData.isSelfieCaptured}
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
    backgroundColor: '#F1F5F9',
    borderWidth: 4,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cameraIcon: {
    fontSize: 64,
  },
  instructionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  instructionItem: {
    alignItems: 'center',
  },
  instructionIcon: {
    fontSize: 24,
    marginBottom: 8,
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
