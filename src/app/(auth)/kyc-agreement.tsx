import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { TopNav } from '../../components/ui/TopNav';
import { useAuth } from '../../context/AuthContext';

export default function KycAgreementScreen() {
  const { onboardingData, updateOnboardingData } = useAuth();
  
  // Three separate agreement checklists
  const [agreed1, setAgreed1] = useState(false);
  const [agreed2, setAgreed2] = useState(false);
  const [agreed3, setAgreed3] = useState(false);

  // Digital Signature coordinates
  const [sigPoints, setSigPoints] = useState<{ x: number; y: number }[]>([]);

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

  const handleTouch = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    if (locationX && locationY) {
      setSigPoints((prev) => [...prev, { x: locationX, y: locationY }]);
    }
  };

  const clearSignature = () => {
    setSigPoints([]);
  };

  const handleUploadCert = () => {
    updateOnboardingData({ dsaCertificateUploaded: true });
  };

  const handleSubmit = () => {
    const isSigned = sigPoints.length >= 10;
    if (!agreed1 || !agreed2 || !agreed3) {
      Alert.alert('Agreement Required', 'Please accept all terms and conditions.');
      return;
    }
    if (!onboardingData.dsaCertificateUploaded) {
      Alert.alert('Upload Required', 'Please upload your DSA Certificate (Other Party) to proceed.');
      return;
    }
    if (!isSigned) {
      Alert.alert('Signature Required', 'Please sign in the box before submitting.');
      return;
    }

    // Save state and route to Review page
    updateOnboardingData({ isAgreementSigned: true });
    router.push('/(auth)/review' as any);
  };

  const isFormValid = agreed1 && agreed2 && agreed3 && onboardingData.dsaCertificateUploaded && sigPoints.length >= 10;

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="KYC Verification" step="Step 6/6" />

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: '100%' }]} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>DSA Agreement</Text>
            <Text style={styles.subtitle}>Review and sign the partnership agreement</Text>
          </View>

          {/* DSA Certificate Upload Section */}
          <Text style={styles.sectionTitle}>DSA Certificate (Other Party) *</Text>
          <TouchableOpacity 
            style={[styles.uploadBox, onboardingData.dsaCertificateUploaded && { borderColor: '#10B981', backgroundColor: '#ECFDF5' }]} 
            onPress={handleUploadCert}
          >
            {onboardingData.dsaCertificateUploaded ? (
              <>
                <MaterialCommunityIcons name="check-circle" size={32} color="#10B981" style={{ marginBottom: 8 }} />
                <Text style={[styles.uploadText, { color: '#065F46' }]}>dsa_certificate.pdf Uploaded</Text>
                <Text style={styles.uploadSubtext}>Tap to change file</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="file-document-outline" size={32} color="#64748B" style={{ marginBottom: 8 }} />
                <Text style={styles.uploadText}>Upload DSA Certificate</Text>
                <Text style={styles.uploadSubtext}>JPG, PNG or PDF · Max 5MB</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Agreement Text Preview */}
          <View style={styles.agreementPreview}>
            <Text style={styles.agreementTitle}>DSA EMPANELMENT AGREEMENT</Text>
            <Text style={styles.agreementBody}>
              This DSA Empanelment Agreement ("Agreement") is entered into between India Shelter Finance Corporation Limited, a company incorporated under the Companies Act, 2013, having its registered office at Gurugram, Haryana ("NHB/NBFC") and the applicant ("DSA/Partner").{"\n\n"}
              1. Appointment: The NBFC hereby appoints the DSA as a non-exclusive Direct Selling Agent for sourcing loan applications and financial products offered by the NBFC.{"\n\n"}
              2. Scope of Work: The DSA shall source loan applications from prospective customers, assist in documentation, and coordinate with the NBFC's credit team for processing.{"\n\n"}
              3. Commission Structure: Commission rates shall be as per the commission schedule annexed hereto, payable on disbursement subject to first EMI clearance.{"\n\n"}
              4. Compliance: The DSA shall comply with all applicable laws, RBI guidelines, and the NBFC's internal policies including KYC/AML norms.{"\n\n"}
              5. Term: This agreement is valid for 1 year from the date of execution, auto-renewable on mutually agreed terms.
            </Text>
          </View>

          {/* Checkbox 1 */}
          <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={() => setAgreed1(!agreed1)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreed1 && styles.checkboxChecked]}>
              {agreed1 && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              I have read, understood, and agree to the DSA Empanelment Agreement and all its terms & conditions *
            </Text>
          </TouchableOpacity>

          {/* Checkbox 2 */}
          <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={() => setAgreed2(!agreed2)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreed2 && styles.checkboxChecked]}>
              {agreed2 && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              I confirm that all documents uploaded are genuine and I consent to CIBIL/KYC verification *
            </Text>
          </TouchableOpacity>

          {/* Checkbox 3 */}
          <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={() => setAgreed3(!agreed3)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreed3 && styles.checkboxChecked]}>
              {agreed3 && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              I agree to comply with RBI guidelines, PMLA 2002, and DPDP Act 2023 in all my activities as DSA *
            </Text>
          </TouchableOpacity>

          {/* E-Signature Box */}
          <Text style={styles.sectionTitle}>E-Signature (Draw in box below) *</Text>
          <View 
            style={styles.sigPad}
            onTouchStart={handleTouch}
            onTouchMove={handleTouch}
          >
            {sigPoints.length === 0 ? (
              <View style={styles.sigPlaceholder}>
                <MaterialCommunityIcons name="gesture-swipe" size={32} color="#94A3B8" style={{ marginBottom: 6 }} />
                <Text style={styles.sigPlaceholderText}>Draw your signature here</Text>
              </View>
            ) : (
              sigPoints.map((p, i) => (
                <View
                  key={i}
                  style={{
                    position: 'absolute',
                    left: p.x,
                    top: p.y,
                    width: 3,
                    height: 3,
                    borderRadius: 1.5,
                    backgroundColor: '#DE1F26',
                  }}
                />
              ))
            )}
          </View>

          <TouchableOpacity onPress={clearSignature} style={styles.clearBtn} activeOpacity={0.6}>
            <Text style={styles.clearBtnText}>Clear Signature</Text>
          </TouchableOpacity>

          <Button
            title="Submit & Review Application"
            onPress={handleSubmit}
            disabled={!isFormValid}
            style={styles.button}
          />
        </Animated.View>
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3134',
    marginBottom: 8,
    marginTop: 16,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 2,
  },
  uploadSubtext: {
    fontSize: 11,
    color: '#94A3B8',
  },
  agreementPreview: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    height: 180,
    marginBottom: 20,
  },
  agreementTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2D3134',
    marginBottom: 8,
  },
  agreementBody: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
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
  sigPad: {
    height: 150,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    position: 'relative',
    overflow: 'hidden',
  },
  sigPlaceholder: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sigPlaceholderText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  clearBtn: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 24,
  },
  clearBtnText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
    marginBottom: 32,
  },
});
