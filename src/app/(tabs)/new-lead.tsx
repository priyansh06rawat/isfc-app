import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Animated, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TopNav } from '../../components/ui/TopNav';

const PRESETS = ['10L', '25L', '50L', '75L', '1Cr'];

const EMPLOYMENT_OPTIONS = ['Salaried', 'Self-Employed', 'Business Owner', 'Financial Advisor'];
const PRODUCT_OPTIONS = ['Home Loan', 'LAP', 'MSME Loan', 'Business Loan'];
const CIBIL_OPTIONS = ['750+ (Excellent)', '700-749 (Good)', '650-699 (Fair)', 'Below 650 (Poor)'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - 18 - i); // Minimum 18 years old

export default function NewLeadScreen() {
  const { addLead, isApiLoading, darkModeEnabled } = useAuth();
  
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

  // Dropdown Picker Modal states
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTitle, setPickerTitle] = useState('');
  const [pickerOptions, setPickerOptions] = useState<string[]>([]);
  const [pickerField, setPickerField] = useState<'employment' | 'product' | 'cibil' | null>(null);

  // Calendar Modal states
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear() - 25);
  const [calendarMonth, setCalendarMonth] = useState(0);

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

  // DOB Keyboard formatting (DD/MM/YYYY)
  const handleDobChange = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length > 4) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }
    updateForm('dob', formatted);
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

  const handleSubmit = async () => {
    if (!form.name || !form.mobile || !form.employment || !form.product || !form.amount) {
      Alert.alert('Required Fields', 'Please fill in Name, Mobile, Employment, Product, and Loan Amount.');
      return;
    }
    if (form.mobile.length !== 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    await addLead({
      name: form.name,
      product: form.product,
      amount: formatAmount(form.amount),
      status: 'Processing',
      city: form.location || 'Mumbai',
      mobile: form.mobile,
      employment: form.employment,
      cibil: form.cibil,
    });

    Alert.alert('Lead Created', 'Lead has been successfully submitted and listed.', [
      { text: 'OK', onPress: () => router.replace('/(tabs)/leads' as any) }
    ]);
  };

  // Open Dropdown Modal helper
  const openDropdown = (type: 'employment' | 'product' | 'cibil') => {
    setPickerField(type);
    if (type === 'employment') {
      setPickerTitle('Select Employment Type');
      setPickerOptions(EMPLOYMENT_OPTIONS);
    } else if (type === 'product') {
      setPickerTitle('Select Product Interest');
      setPickerOptions(PRODUCT_OPTIONS);
    } else {
      setPickerTitle('Select Estimated CIBIL Score');
      setPickerOptions(CIBIL_OPTIONS);
    }
    setPickerVisible(true);
  };

  const handleOptionSelect = (option: string) => {
    if (pickerField) {
      updateForm(pickerField, option);
    }
    setPickerVisible(false);
  };

  // Calendar Day generation logic
  const getDaysArray = () => {
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const firstDayOffset = new Date(calendarYear, calendarMonth, 1).getDay();
    const arr: (number | null)[] = [];
    for (let i = 0; i < firstDayOffset; i++) {
      arr.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push(i);
    }
    return arr;
  };

  const handleSelectDay = (day: number) => {
    const d = String(day).padStart(2, '0');
    const m = String(calendarMonth + 1).padStart(2, '0');
    const dobStr = `${d}/${m}/${calendarYear}`;
    updateForm('dob', dobStr);
    setCalendarVisible(false);
  };

  // Render standard select input box
  const renderSelectField = (label: string, value: string, placeholder: string, onPress: () => void, required = false) => {
    return (
      <View style={styles.selectFieldContainer}>
        <Text style={[styles.selectLabel, darkModeEnabled && styles.textDark]}>
          {label}
          {required && <Text style={styles.requiredAsterisk}> *</Text>}
        </Text>
        <TouchableOpacity 
          style={[styles.selectBox, darkModeEnabled && styles.cardDark]} 
          onPress={onPress}
          activeOpacity={0.75}
        >
          <Text style={[
            styles.selectValue, 
            !value && styles.selectPlaceholder, 
            darkModeEnabled && value && styles.textDark
          ]}>
            {value || placeholder}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={22} color={darkModeEnabled ? '#94A3B8' : '#64748B'} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, darkModeEnabled && styles.containerDark]}>
      <TopNav title="Submit New Lead" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="account-outline" size={18} color="#DE1F26" style={styles.sectionIcon} />
              <Text style={[styles.sectionHeader, darkModeEnabled && styles.textDark]}>Customer Details</Text>
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
                <Text style={[styles.selectLabel, darkModeEnabled && styles.textDark]}>Date of Birth</Text>
                <View style={styles.dobContainer}>
                  <TextInputWithCalendar
                    value={form.dob}
                    placeholder="DD/MM/YYYY"
                    onChangeText={handleDobChange}
                    maxLength={10}
                    keyboardType="number-pad"
                    darkModeEnabled={darkModeEnabled}
                    onCalendarPress={() => setCalendarVisible(true)}
                  />
                </View>
              </View>
              <View style={{ width: 16 }} />
              <View style={styles.flex1}>
                {renderSelectField(
                  'Employment Type *',
                  form.employment,
                  'Select employment',
                  () => openDropdown('employment'),
                  true
                )}
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="bank-outline" size={18} color="#DE1F26" style={styles.sectionIcon} />
              <Text style={[styles.sectionHeader, darkModeEnabled && styles.textDark]}>Loan Details</Text>
            </View>

            {renderSelectField(
              'Product Interest *',
              form.product,
              'Select Product',
              () => openDropdown('product'),
              true
            )}

            {/* Amount field with formatting presets */}
            <View style={[styles.amountContainer, darkModeEnabled && styles.cardDark]}>
              <Text style={[styles.amountLabel, darkModeEnabled && styles.textDark]}>Loan Amount Required *</Text>
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
                    style={[styles.presetChip, darkModeEnabled && { backgroundColor: '#1E293B', borderColor: '#334155' }]} 
                    onPress={() => handlePreset(p)}
                  >
                    <Text style={[styles.presetChipText, darkModeEnabled && styles.textDark]}>{p}</Text>
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
              <Text style={[styles.sectionHeader, darkModeEnabled && styles.textDark]}>Income & Financials</Text>
            </View>

            <Input
              label="Monthly Income"
              placeholder="₹ Gross Monthly Income"
              keyboardType="number-pad"
              value={form.income}
              onChangeText={(v) => updateForm('income', v)}
            />

            {renderSelectField(
              'Estimated CIBIL Score',
              form.cibil,
              'Select score status',
              () => openDropdown('cibil')
            )}

            {/* Document Attachment Box */}
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="file-document-outline" size={18} color="#DE1F26" style={styles.sectionIcon} />
              <Text style={[styles.sectionHeader, darkModeEnabled && styles.textDark]}>Attach Documents</Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.uploadBox, 
                form.isDocUploaded && { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
                darkModeEnabled && !form.isDocUploaded && styles.cardDark
              ]} 
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
                  <MaterialCommunityIcons name="paperclip" size={32} color={darkModeEnabled ? '#94A3B8' : '#64748B'} style={{ marginBottom: 8 }} />
                  <Text style={[styles.uploadText, darkModeEnabled && styles.textDark]}>Attach KYC + Income Documents</Text>
                  <Text style={styles.uploadSubtext}>Select multiple files (PDF, JPG, PNG)</Text>
                </>
              )}
            </TouchableOpacity>

            <Button
              title={isApiLoading ? 'Submitting...' : 'Submit Lead'}
              onPress={handleSubmit}
              disabled={isApiLoading}
              style={styles.submitBtn}
            />

            <View style={{ height: 40 }} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- Generic Dropdown Picker Modal --- */}
      <Modal visible={pickerVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, darkModeEnabled && styles.cardDark]}>
            <Text style={[styles.modalTitle, darkModeEnabled && styles.textDark]}>{pickerTitle}</Text>
            <FlatList
              data={pickerOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.optionItem, darkModeEnabled && { borderBottomColor: '#334155' }]} 
                  onPress={() => handleOptionSelect(item)}
                >
                  <Text style={[styles.optionText, darkModeEnabled && styles.textDark]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setPickerVisible(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- Elegant Custom Calendar Modal --- */}
      <Modal visible={calendarVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, darkModeEnabled && styles.cardDark, { width: '90%' }]}>
            <Text style={[styles.modalTitle, darkModeEnabled && styles.textDark]}>Select Date of Birth</Text>

            {/* Year navigation row */}
            <View style={styles.yearPickerRow}>
              <TouchableOpacity 
                style={[styles.yearNavBtn, darkModeEnabled && { backgroundColor: '#334155' }]} 
                onPress={() => setCalendarYear(prev => prev - 1)}
              >
                <MaterialCommunityIcons name="chevron-left" size={24} color={darkModeEnabled ? '#F8FAFC' : '#0F172A'} />
              </TouchableOpacity>
              <Text style={[styles.yearText, darkModeEnabled && styles.textDark]}>{calendarYear}</Text>
              <TouchableOpacity 
                style={[styles.yearNavBtn, darkModeEnabled && { backgroundColor: '#334155' }]} 
                onPress={() => setCalendarYear(prev => prev + 1)}
              >
                <MaterialCommunityIcons name="chevron-right" size={24} color={darkModeEnabled ? '#F8FAFC' : '#0F172A'} />
              </TouchableOpacity>
            </View>

            {/* Month selection row */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity 
                style={[styles.yearNavBtn, darkModeEnabled && { backgroundColor: '#334155' }]} 
                onPress={() => setCalendarMonth(prev => prev === 0 ? 11 : prev - 1)}
              >
                <MaterialCommunityIcons name="chevron-left" size={20} color={darkModeEnabled ? '#F8FAFC' : '#0F172A'} />
              </TouchableOpacity>
              <Text style={[styles.calendarMonthText, darkModeEnabled && styles.textDark]}>{MONTHS[calendarMonth]}</Text>
              <TouchableOpacity 
                style={[styles.yearNavBtn, darkModeEnabled && { backgroundColor: '#334155' }]} 
                onPress={() => setCalendarMonth(prev => prev === 11 ? 0 : prev + 1)}
              >
                <MaterialCommunityIcons name="chevron-right" size={20} color={darkModeEnabled ? '#F8FAFC' : '#0F172A'} />
              </TouchableOpacity>
            </View>

            {/* Calendar Days name row */}
            <View style={styles.weekDaysRow}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <Text key={d} style={styles.weekDayName}>{d}</Text>
              ))}
            </View>

            {/* Calendar Days Grid */}
            <View style={styles.daysGrid}>
              {getDaysArray().map((day, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.dayCell,
                    day === null && { opacity: 0 },
                    day !== null && styles.dayCellInteractive
                  ]}
                  disabled={day === null}
                  onPress={() => day !== null && handleSelectDay(day)}
                >
                  <Text style={[styles.dayText, darkModeEnabled && styles.textDark]}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={() => setCalendarVisible(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Custom input suffix calendar icon component
function TextInputWithCalendar({ value, placeholder, onChangeText, maxLength, keyboardType, darkModeEnabled, onCalendarPress }: any) {
  return (
    <View style={[styles.inputContainer, darkModeEnabled && styles.inputDark]}>
      <TextInput
        style={[styles.inputField, darkModeEnabled && styles.textDark]}
        placeholder={placeholder}
        placeholderTextColor={darkModeEnabled ? '#64748B' : '#94A3B8'}
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        keyboardType={keyboardType}
      />
      <TouchableOpacity style={styles.calendarIconBtn} onPress={onCalendarPress}>
        <MaterialCommunityIcons name="calendar" size={24} color="#DE1F26" />
      </TouchableOpacity>
    </View>
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
  // Custom Select Box styles
  selectFieldContainer: {
    marginBottom: 16,
  },
  selectLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3134',
    marginBottom: 8,
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  selectValue: {
    fontSize: 16,
    color: '#2D3134',
    fontWeight: '600',
  },
  selectPlaceholder: {
    color: '#94A3B8',
  },
  requiredAsterisk: {
    color: '#DE1F26',
  },
  // Modals overlays & option elements
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    maxHeight: '75%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 18,
    backgroundColor: '#DE1F26',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  // Calendar component structures
  dobContainer: {
    height: 52,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
  },
  inputDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  inputField: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2D3134',
    fontWeight: '600',
  },
  calendarIconBtn: {
    paddingHorizontal: 16,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 6,
  },
  calendarMonthText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  weekDayName: {
    width: '13%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 4,
    paddingHorizontal: 2,
  },
  dayCell: {
    width: '13.3%',
    aspectRatio: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayCellInteractive: {
    backgroundColor: '#F8F9FA',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  yearPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  yearNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearText: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
  },
  // Dark theme definitions
  containerDark: {
    backgroundColor: '#0F172A',
  },
  cardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  textDark: {
    color: '#F8FAFC',
  },
  textMutedDark: {
    color: '#94A3B8',
  },
});
