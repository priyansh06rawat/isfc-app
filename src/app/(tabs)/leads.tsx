import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

const FILTERS = ['All', 'Processing', 'Approved', 'Pending', 'Disbursed', 'Rejected'];

export default function LeadsScreen() {
  const insets = useSafeAreaInsets();
  const { leads } = useAuth();
  
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const handleLeadPress = (id: string) => {
    router.push({
      pathname: '/(tabs)/lead/[id]',
      params: { id }
    } as any);
  };

  // Filter & Search Logic
  const filteredLeads = leads.filter((lead) => {
    const matchesFilter = activeFilter === 'All' || lead.status.toLowerCase() === activeFilter.toLowerCase();
    
    const query = search.toLowerCase();
    const matchesSearch = 
      lead.name.toLowerCase().includes(query) ||
      lead.id.toLowerCase().includes(query) ||
      lead.product.toLowerCase().includes(query) ||
      lead.city.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'sanctioned') return { color: '#059669', bg: '#ECFDF5' };
    if (s === 'disbursed') return { color: '#2563EB', bg: '#EFF6FF' };
    if (s === 'pending') return { color: '#D97706', bg: '#FFFBEB' };
    if (s === 'rejected') return { color: '#DC2626', bg: '#FEF2F2' };
    return { color: '#475569', bg: '#F8F9FA' }; // processing
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Leads</Text>
        <Text style={styles.leadsCount}>{filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}</Text>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by name, ID or city..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterOuter}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map((f) => {
            const isActive = activeFilter === f;
            return (
              <TouchableOpacity 
                key={f} 
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Leads List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredLeads.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No leads found</Text>
            <Text style={styles.emptySub}>Try a different search or filter option</Text>
          </View>
        ) : (
          filteredLeads.map((lead) => {
            const status = getStatusStyle(lead.status);
            const initials = lead.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

            return (
              <TouchableOpacity 
                key={lead.id} 
                style={styles.leadCard}
                onPress={() => handleLeadPress(lead.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.leadAvatar, { backgroundColor: lead.color || '#DE1F26' }]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.leadInfo}>
                  <Text style={styles.leadName}>{lead.name}</Text>
                  <Text style={styles.leadDetail}>
                    {lead.product} • {lead.id} • {lead.city}
                  </Text>
                  {lead.date && <Text style={styles.leadDate}>{lead.date}</Text>}
                </View>
                <View style={styles.leadMeta}>
                  <Text style={styles.leadAmount}>{lead.amount}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: status.color }]}>{lead.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/(tabs)/new-lead' as any)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  leadsCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  filterOuter: {
    marginBottom: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  filterChipActive: {
    backgroundColor: '#DE1F26',
    borderColor: '#DE1F26',
  },
  filterChipText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
  },
  leadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  leadAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  leadInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  leadName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  leadDetail: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  leadDate: {
    fontSize: 10,
    color: '#94A3B8',
  },
  leadMeta: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  leadAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 105 : 85,
    right: 20,
    backgroundColor: '#DE1F26',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DE1F26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 99,
  },
});
