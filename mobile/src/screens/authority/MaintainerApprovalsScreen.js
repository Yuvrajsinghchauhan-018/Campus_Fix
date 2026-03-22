import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';
import { useSocket } from '../../hooks/useSocket';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Colors } from '../../theme/colors';

export default function MaintainerApprovalsScreen({ navigation }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [processing, setProcessing] = useState(null);

  useSocket('maintainer_update', () => setRefresh(p => p + 1));

  const fetchPending = async () => {
    try {
      const res = await api.get('/maintainers/pending');
      setPending(res.data.data || []);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchPending(); }, [refresh]);

  const handleAction = async (id, action) => {
    setProcessing(id + action);
    try {
      await api.patch(`/maintainers/${id}/${action}`);
      fetchPending();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Action failed');
    } finally { setProcessing(null); }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Maintainer Approvals</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPending(); }} tintColor={Colors.primary} />}
      >
        {pending.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-circle" size={56} color={Colors.border} />
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptyText}>No pending maintainer approvals.</Text>
          </View>
        ) : (
          pending.map(m => (
            <View key={m._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{m.name?.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{m.name}</Text>
                  <Text style={styles.sub}>{m.email}</Text>
                </View>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>Pending</Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <InfoRow icon="call" label="Phone" value={m.phone} />
                <InfoRow icon="construct" label="Job Type" value={m.jobType} />
                {m.address && <InfoRow icon="location" label="Address" value={m.address} />}
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: Colors.success }]}
                  onPress={() => handleAction(m._id, 'approve')}
                  disabled={!!processing}
                >
                  {processing === m._id + 'approve' ? <ActivityIndicator color="#fff" size="small" /> : (
                    <><Ionicons name="checkmark" size={16} color="#fff" /><Text style={styles.actionText}>Approve</Text></>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: Colors.danger }]}
                  onPress={() => handleAction(m._id, 'reject')}
                  disabled={!!processing}
                >
                  {processing === m._id + 'reject' ? <ActivityIndicator color="#fff" size="small" /> : (
                    <><Ionicons name="close" size={16} color="#fff" /><Text style={styles.actionText}>Reject</Text></>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, label, value }) => (
  <View style={infoStyles.row}>
    <Ionicons name={icon} size={14} color={Colors.textMuted} />
    <Text style={infoStyles.label}>{label}:</Text>
    <Text style={infoStyles.value}>{value}</Text>
  </View>
);

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  label: { fontSize: 12, color: Colors.textMuted, fontWeight: '700' },
  value: { fontSize: 12, color: Colors.text, flex: 1 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  name: { fontSize: 16, fontWeight: '800', color: Colors.text },
  sub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  pendingBadge: { backgroundColor: '#fffbeb', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  pendingText: { fontSize: 11, fontWeight: '700', color: '#b45309' },
  infoGrid: { backgroundColor: Colors.bg, borderRadius: 12, padding: 12, marginBottom: 14 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14, borderRadius: 12 },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
});
