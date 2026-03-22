import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';
import ConfirmModal from '../../components/ConfirmModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Colors } from '../../theme/colors';

export default function ManageMaintainersScreen({ navigation }) {
  const [maintainers, setMaintainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMaintainers = async () => {
    try {
      const res = await api.get('/maintainers');
      setMaintainers(res.data.data || []);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchMaintainers(); }, [refresh]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/maintainers/${deleteTarget._id}`);
      setDeleteTarget(null);
      setRefresh(p => p + 1);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Delete failed');
    } finally { setDeleting(false); }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Maintainers</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddMaintainer')}>
          <Ionicons name="add" size={26} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMaintainers(); }} tintColor={Colors.primary} />}
      >
        {maintainers.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={56} color={Colors.border} />
            <Text style={styles.emptyText}>No maintainers yet. Add one!</Text>
          </View>
        ) : (
          maintainers.map(m => (
            <View key={m._id} style={styles.card}>
              {/* Decorative background accent */}
              <View style={styles.accent} />
              <View style={styles.cardRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{m.name?.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{m.name}</Text>
                  <View style={styles.jobRow}>
                    <View style={styles.jobBadge}><Text style={styles.jobText}>{m.jobType}</Text></View>
                    <View style={styles.statusDot} />
                    <Text style={styles.phone}>{m.phone}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteTarget(m)}>
                  <Ionicons name="trash" size={18} color={Colors.danger} />
                </TouchableOpacity>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statVal}>{m.performanceScore?.toFixed(1) ?? 'N/A'}</Text>
                  <Text style={styles.statLabel}>Score</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statVal}>{m.totalTasksCompleted}</Text>
                  <Text style={styles.statLabel}>Tasks Done</Text>
                </View>
                <View style={[styles.stat, { borderRightWidth: 0 }]}>
                  <Text style={styles.statVal}>{m.approvalStatus}</Text>
                  <Text style={styles.statLabel}>Status</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Maintainer"
        message={`Permanently remove @${deleteTarget?.name}? This action is IRREVERSIBLE and will block their login.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', position: 'relative' },
  accent: { position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: '#3b82f620' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#bfdbfe' },
  avatarText: { fontSize: 22, fontWeight: '900', color: Colors.primary },
  name: { fontSize: 17, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  jobRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  jobBadge: { backgroundColor: Colors.primaryLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  jobText: { fontSize: 10, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  phone: { fontSize: 12, color: Colors.textMuted, fontFamily: 'monospace' },
  deleteBtn: { padding: 10, backgroundColor: Colors.dangerLight, borderRadius: 12 },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
  stat: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: Colors.border },
  statVal: { fontSize: 18, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', marginTop: 2, textTransform: 'uppercase' },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 14 },
  emptyText: { color: Colors.textMuted, fontSize: 15 },
});
