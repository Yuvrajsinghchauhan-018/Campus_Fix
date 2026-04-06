import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import ComplaintCard from '../../components/ComplaintCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Colors } from '../../theme/colors';

export default function StudentDashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, resolved: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useSocket('complaint_update', () => setRefresh(p => p + 1));

  const fetchData = async () => {
    try {
      const res = await api.get('/complaints');
      if (res.data.success) {
        const data = res.data.data;
        let p = 0, ip = 0, r = 0;
        data.forEach(c => {
          if (c.status === 'Pending' || c.status === 'Assigned') p++;
          else if (c.status === 'In Progress' || c.status === 'Accepted') ip++;
          else if (c.status === 'Resolved') r++;
        });
        setStats({ pending: p, inProgress: ip, resolved: r });
        setRecent(data.slice(0, 10));
      }
    } catch (err) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [refresh]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={require('../../../assets/msi_logo.png')} style={styles.logo} />
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerBottom}>
          <Text style={styles.welcome}>Welcome, {user?.name?.split(' ')[0]}! 👋</Text>
          <Text style={styles.subtitle}>Track your maintenance requests</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Pending" value={stats.pending} color="#f59e0b" icon="time" />
          <StatCard label="In Progress" value={stats.inProgress} color="#f97316" icon="reload" />
          <StatCard label="Resolved" value={stats.resolved} color="#22c55e" icon="checkmark-circle" />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primary }]} onPress={() => navigation.navigate('NewComplaint')}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>New Issue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => navigation.navigate('ComplaintHistory')}>
            <Text style={styles.actionBtnSecondaryText}>View All History</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Complaints */}
        <Text style={styles.sectionTitle}>Recent Complaints</Text>
        {recent.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="alert-circle-outline" size={40} color={Colors.border} />
            <Text style={styles.emptyText}>No complaints yet. Create one to get started.</Text>
          </View>
        ) : (
          recent.map(c => (
            <ComplaintCard key={c._id} complaint={c} onPress={() => navigation.navigate('ComplaintDetail', { id: c._id })} />
          ))
        )}
        {/* Branding */}
        <View style={styles.branding}>
          <Text style={styles.brandingText}>Managed by Maharaja Surajmal Institute</Text>
          <Text style={styles.versionText}>v2.1.0 • Stable</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const StatCard = ({ label, value, color, icon }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Ionicons name={icon} size={20} color={color} style={{ marginBottom: 6 }} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  logo: { width: 40, height: 40, borderRadius: 8 },
  headerBottom: {},
  welcome: { fontSize: 22, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2, fontWeight: '500' },
  logoutBtn: { padding: 8 },
  scroll: { padding: 16, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderLeftWidth: 4, borderWidth: 1, borderColor: Colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  statValue: { fontSize: 28, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  actionBtnSecondary: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 14, backgroundColor: '#f1f5f9' },
  actionBtnSecondaryText: { color: Colors.text, fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 14 },
  empty: { alignItems: 'center', padding: 40, gap: 10 },
  emptyText: { color: Colors.textMuted, textAlign: 'center', fontSize: 14 },
  branding: { marginTop: 40, alignItems: 'center', opacity: 0.5, paddingBottom: 20 },
  brandingText: { fontSize: 11, fontWeight: '700', color: Colors.text, textTransform: 'uppercase', letterSpacing: 1 },
  versionText: { fontSize: 10, color: Colors.textMuted, marginTop: 4 },
});
