import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';
import { useSocket } from '../../hooks/useSocket';
import ComplaintCard from '../../components/ComplaintCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Colors } from '../../theme/colors';

const STATUS_FILTERS = ['All', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

export default function ComplaintHistoryScreen({ navigation }) {
  const [complaints, setComplaints] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [refresh, setRefresh] = useState(0);

  useSocket('complaint_update', () => setRefresh(p => p + 1));

  const fetchData = async () => {
    try {
      const res = await api.get('/complaints');
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, [refresh]);

  useEffect(() => {
    let f = [...complaints];
    if (status !== 'All') f = f.filter(c => c.status === status);
    if (search) f = f.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(f);
  }, [complaints, status, search]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>My Complaints</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search complaints..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close" size={18} color={Colors.textMuted} /></TouchableOpacity> : null}
      </View>

      {/* Status Filters */}
      <View style={{ height: 42, marginBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {STATUS_FILTERS.map(s => (
            <TouchableOpacity key={s} style={[styles.filterChip, status === s && styles.filterChipActive]} onPress={() => setStatus(s)}>
              <Text style={[styles.filterText, status === s && styles.filterTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={Colors.primary} />}
      >
        <Text style={styles.count}>{filtered.length} complaints</Text>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No complaints found</Text>
          </View>
        ) : (
          filtered.map(c => (
            <ComplaintCard key={c._id} complaint={c} onPress={() => navigation.navigate('ComplaintDetail', { id: c._id })} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: 18, fontWeight: '800', color: Colors.text },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 12, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, borderColor: Colors.border, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text },
  filters: { paddingHorizontal: 12, alignItems: 'center', gap: 8 },
  filterChip: { paddingHorizontal: 16, height: 32, justifyContent: 'center', borderRadius: 16, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff' },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 12, fontWeight: '700', color: Colors.textMuted },
  filterTextActive: { color: '#fff' },
  list: { padding: 12, paddingBottom: 40 },
  count: { fontSize: 12, color: Colors.textMuted, fontWeight: '600', marginBottom: 10 },
  empty: { alignItems: 'center', padding: 48, gap: 10 },
  emptyText: { color: Colors.textMuted, fontSize: 15 },
});
