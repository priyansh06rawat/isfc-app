import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TopNav } from '../../components/ui/TopNav';

const PRESETS = ['10L', '25L', '50L', '75L', '1Cr'];

export default function NewLeadScreen() {
  const { addLead } = useAuth();
  
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    altMobile: '',
    email: '',
    dob: '',
    employment: 'Salaried',
    product: 'Home Loan',
    amount: '2500000', // Default 25L
    tenure: '180 months',
    location: '',
    income: '',
    cibil: '750+ (Excellent)',
    isDocUploaded: false,
  });

  // Animation hooks
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const updateForm = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePreset = (preset: string) => {
    let numeric = '2500000';
    if (preset === '10L') numeric = '1000000';
    if (preset === '25L') numeric = '2500000';
    if (preset === '50L') numeric = '5000000';
    if (preset === '75L') numeric = '7500000';
    if (preset === '1Cr') numeric = '10000000';
    updateForm('amount', numeric);
  };

  const formatAmount = (val: string) => {
    const num = parseInt(val) || 0;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(0)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const handleUploadDocs = () => {
    updateForm('isDocUploaded', true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.mobile || !form.employment || !form.product || !form.amount) {
      Alert.alert('Required Fields', 'Please fill in Name, Mobile, Employment, Product, and Loan Amount.');
      return;
    }
    if (form.mobile.length !== 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    // Add lead dynamically to central context list
    addLead({
      name: form.name,
      product: form.product,
      amount: formatAmount(form.amount),
      status: 'Processing',
      city: form.location || 'Mumbai',
    });

    Alert.alert('Lead Created', 'Lead has been successfully submitted and listed.', [
      { text: 'OK', onPress: () => router.replace('/(tabs)/leads' as any) }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="Submit New Lead" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="account-outline" size={18} color="#DE1F26" style={styles.sectionIcon} />
              <Text style={styles.sectionHeader}>Customer Details</Text>
            </View>
            
            <Input
              label="Customer Name *"
              placeholder="Full Name"
              value={form.name}
              onChangeText={(v) => updateForm('name', v)}
              required
            />

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Input
                  label="Mobile *"
                  placeholder="98XXXXXXXX"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={form.mobile}
                  onChangeText={(v) => updateForm('mobile', v)}
                  required
                />
              </View>
              <View style={{ width: 16 }} />
              <View style={styles.flex1}>
                <Input
                  label="Alt Mobile"
                  placeholder="Optional"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={form.altMobile}
                  onChangeText={(v) => updateForm('altMobile', v)}
                />
              </View>
            </View>

            <Input
              label="Email"
              placeholder="customer@example.com"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(v) => updateForm('email', v)}
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
                  label="Employment Type *"
                  placeholder="Salaried / Self-Employed"
                  value={form.employment}
                  onChangeText={(v) => updateForm('employment', v)}
                  required
                />
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="bank-outline" size={18} color="#DE1F26" style={styles.sectionIcon} />
              <Text style={styles.sectionHeader}>Loan Details</Text>
            </View>

            <Input
              label="Product Interest *"
              placeholder="e.g. Home Loan / LAP"
              value={form.product}
              onChangeText={(v) => updateForm('product', v)}
              required
            />

            {/* Amount field with formatting presets */}
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Loan Amount Required *</Text>
              <Text style={styles.amountDisplay}>{formatAmount(form.amount)}</Text>
              
              <Input
                placeholder="Enter amount in Rupees"
                keyboardType="number-pad"
                value={form.amount}
                onChangeText={(v) => updateForm('amount', v)}
                style={styles.amountInput}
              />

              <View style={styles.presetRow}>
                {PRESETS.map((p) => (
                  <TouchableOpacity 
                    key={p} 
                    style={styles.presetChip} 
                    onPress={() => handlePreset(p)}
                  >
                    <Text style={styles.presetChipText}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Tenure Interest"
              placeholder="e.g. 180 months"
              value={form.tenure}
              onChangeText={(v) => updateForm('tenure', v)}
            />

            <Input
              label="Property Location (if known)"
              placeholder="City, State"
              value={form.location}
              onChangeText={(v) => updateForm('location', v)}
            />

            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="currency-inr" size={18} color="#DE1F26" style={styles.sectionIcon} />
              <Text style={styles.sectionHeader}>Income & Financials</Text>
            </View>

            <Input
              label="Monthly Income"
              placeholder="₹ Gross Monthly Income"
              keyboardType="number-pad"
              value={form.income}
              onChangeText={(v) => updateForm('income', v)}
            />

            <Input
              label="Estimated CIBIL Score"
              placeholder="e.g. 750+ (Excellent)"
              value={form.cibil}
              onChangeText={(v) => updateForm('cibil', v)}
            />

            {/* Document Attachment Box */}
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="file-document-outline" size={18} color="#DE1F26" style={styles.sectionIcon} />
              <Text style={styles.sectionHeader}>Attach Documents</Text>
            </View>
            <TouchableOpacity 
              style={[styles.uploadBox, form.isDocUploaded && { borderColor: '#10B981', backgroundColor: '#ECFDF5' }]} 
              onPress={handleUploadDocs}
            >
              {form.isDocUploaded ? (
                <>
                  <MaterialCommunityIcons name="check-circle" size={32} color="#10B981" style={{ marginBottom: 8 }} />
                  <Text style={[styles.uploadText, { color: '#065F46' }]}>Documents Attached Successfully</Text>
                  <Text style={styles.uploadSubtext}>Tap to add more files</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="paperclip" size={32} color="#64748B" style={{ marginBottom: 8 }} />
                  <Text style={styles.uploadText}>Attach KYC + Income Documents</Text>
                  <Text style={styles.uploadSubtext}>Select multiple files (PDF, JPG, PNG)</Text>
                </>
              )}
            </TouchableOpacity>

            <Button
              title="Submit Lead"
              onPress={handleSubmit}
              style={styles.submitBtn}
            />

            <View style={{ height: 40 }} />
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2D3134',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  amountContainer: {
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3134',
    marginBottom: 4,
  },
  amountDisplay: {
    fontSize: 28,
    fontWeight: '900',
    color: '#DE1F26',
    marginBottom: 12,
  },
  amountInput: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  presetChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
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
    marginBottom: 2,
  },
  uploadSubtext: {
    fontSize: 11,
    color: '#94A3B8',
  },
  submitBtn: {
    marginTop: 16,
    marginBottom: 32,
  },
});
