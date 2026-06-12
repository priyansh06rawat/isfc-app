import { View, Text, StyleSheet, ScrollView, TextInput, Platform, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LeadsScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Leads</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by name, ID or mobile..."
          placeholderTextColor="#94A3B8"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Lead Card 1 */}
        <View style={styles.leadCard}>
          <View style={styles.leadHeader}>
            <Text style={styles.leadName}>Ramesh Kumar</Text>
            <Text style={[styles.leadStatus, { color: '#B45309', backgroundColor: '#FEF3C7' }]}>Login Done</Text>
          </View>
          <View style={styles.leadDetails}>
            <Text style={styles.leadText}>ID: L-4829</Text>
            <Text style={styles.leadText}>Home Loan • ₹15L</Text>
            <Text style={styles.leadText}>Mobile: +91 9876543210</Text>
          </View>
        </View>

        {/* Lead Card 2 */}
        <View style={styles.leadCard}>
          <View style={styles.leadHeader}>
            <Text style={styles.leadName}>Suresh Verma</Text>
            <Text style={[styles.leadStatus, { color: '#047857', backgroundColor: '#D1FAE5' }]}>Disbursed</Text>
          </View>
          <View style={styles.leadDetails}>
            <Text style={styles.leadText}>ID: L-4830</Text>
            <Text style={styles.leadText}>LAP • ₹8.5L</Text>
            <Text style={styles.leadText}>Mobile: +91 9876543211</Text>
          </View>
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  leadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leadName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  leadStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  leadDetails: {
    flexDirection: 'column',
    gap: 4,
  },
  leadText: {
    fontSize: 14,
    color: '#64748B',
  },
});
