import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, Animated, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { TouchableScale } from '../../components/ui/TouchableScale';

const FILTERS = ['All', 'Processing', 'Approved', 'Pending', 'Disbursed', 'Rejected'];

export default function LeadsScreen() {
  const insets = useSafeAreaInsets();
  const { leads, fetchLeads } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

  const handleRefresh = async () => {
    setRefreshing(true);
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    try {
      await fetchLeads();
    } catch (e) {
      console.warn('Leads refresh failed:', e);
    } finally {
      spinValue.setValue(0);
      setRefreshing(false);
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  // Animation hooks
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;
  const listOpacity = useRef(new Animated.Value(1)).current;

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

  const getFilterCount = (filter: string) => {
    if (filter === 'All') return leads.length;
    return leads.filter(l => l.status.toLowerCase() === filter.toLowerCase()).length;
  };

  const handleFilterChange = (filter: string) => {
    if (filter === activeFilter) return;
    Animated.timing(listOpacity, {
      toValue: 0.15,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setActiveFilter(filter);
      Animated.timing(listOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

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
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Leads</Text>
            <Text style={styles.leadsCount}>{filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity 
            style={styles.refreshBtn} 
            onPress={handleRefresh}
            disabled={refreshing}
            id="refresh-leads-btn"
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <MaterialCommunityIcons name="refresh" size={24} color="#DE1F26" />
            </Animated.View>
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={[
          styles.searchContainer,
          searchFocused && { borderColor: '#DE1F26', shadowColor: '#DE1F26', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }
        ]}>
          <MaterialCommunityIcons name="magnify" size={20} color={searchFocused ? '#DE1F26' : '#64748B'} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by name, ID or city..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
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
              const count = getFilterCount(f);
              return (
                <TouchableScale 
                  key={f} 
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => handleFilterChange(f)}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {f} ({count})
                  </Text>
                </TouchableScale>
              );
            })}
          </ScrollView>
        </View>

        {/* Leads List with Fade Transition */}
        <Animated.View style={{ flex: 1, opacity: listOpacity }}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#DE1F26']} />
            }
          >
            {filteredLeads.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="database-search-outline" size={48} color="#94A3B8" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>No leads found</Text>
                <Text style={styles.emptySub}>Try a different search or filter option</Text>
              </View>
            ) : (
              filteredLeads.map((lead) => {
                const status = getStatusStyle(lead.status);
                const initials = lead.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

                return (
                  <TouchableScale 
                    key={lead.id} 
                    style={styles.leadCard}
                    onPress={() => handleLeadPress(lead.id)}
                  >
                    {/* Status vertical stripe on the left edge */}
                    <View style={[styles.statusStripe, { backgroundColor: status.color }]} />

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
                  </TouchableScale>
                );
              })
            )}
            <View style={{ height: 100 }} />
          </ScrollView>
        </Animated.View>

        {/* Floating Action Button (FAB) wrapped in TouchableScale */}
        <TouchableScale 
          style={styles.fab} 
          onPress={() => router.push('/(tabs)/new-lead' as any)}
        >
          <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
        </TouchableScale>
      </Animated.View>
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
    shadowColor: '#DE1F26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  filterChipText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    paddingLeft: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  statusStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
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
  refreshBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
  },
});
