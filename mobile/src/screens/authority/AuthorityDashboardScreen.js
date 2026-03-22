import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Colors } from '../../theme/colors';

export default function AuthorityDashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [catData, setCatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useSocket('complaint_update', () => setRefresh(p => p + 1));

  const fetchData = async () => {
    try {
      const [resSum, resCat] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/by-category'),
      ]);
      setSummary(resSum.data.data);
      setCatData(resCat.data.data.map(d => ({ name: d._id, count: d.count })));
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, [refresh]);

  if (loading) return <LoadingSpinner fullScreen />;

  const NAV_ITEMS = [
    { label: 'Complaints Queue', icon: 'warning', screen: 'ComplaintsQueue', color: Colors.warning },
    { label: 'Maintainer Approvals', icon: 'person-add', screen: 'MaintainerApprovals', color: Colors.primary },
    { label: 'Add Maintainer', icon: 'add-circle', screen: 'AddMaintainer', color: Colors.success },
    { label: 'Manage Maintainers', icon: 'people', screen: 'ManageMaintainers', color: '#7c3aed' },
    { label: 'PDF Reports', icon: 'document-text', screen: 'PDFReports', color: '#0891b2' },
    { label: 'QR Generator', icon: 'qr-code', screen: 'QRGenerator', color: '#db2777' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Authority Dashboard 🛡️</Text>
          <Text style={styles.subtitle}>Welcome, {user?.name?.split(' ')[0]}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={Colors.primary} />}
      >
        {/* Stats */}
        {summary && (
          <View style={styles.statsGrid}>
            <StatCard label="Total Complaints" value={summary.total} color="#475569" />
            <StatCard label="Pending Action" value={summary.pendingCount} color="#f59e0b" />
            <StatCard label="Resolution Rate" value={`${summary.resolvedPercentage?.toFixed(1)}%`} color={Colors.success} />
            <StatCard label="Avg Fix Time" value={`${summary.avgResolutionTime}h`} color={Colors.primary} />
          </View>
        )}

        {/* Category Breakdown */}
        {catData.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Complaints by Category</Text>
            {catData.slice(0, 8).map((item, i) => {
              const max = Math.max(...catData.map(c => c.count));
              const pct = max > 0 ? (item.count / max) * 100 : 0;
              const barColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
              return (
                <View key={item.name} style={styles.barRow}>
                  <Text style={styles.barLabel} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColors[i % barColors.length] }]} />
                  </View>
                  <Text style={styles.barCount}>{item.count}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Navigation Grid */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.navGrid}>
          {NAV_ITEMS.map(item => (
            <TouchableOpacity key={item.screen} style={styles.navCard} onPress={() => navigation.navigate(item.screen)} activeOpacity={0.75}>
              <View style={[styles.navIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={26} color={item.color} />
              </View>
              <Text style={styles.navLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const StatCard = ({ label, value, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  welcome: { fontSize: 18, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  logoutBtn: { padding: 8 },
  scroll: { padding: 16, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  statCard: { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 14, borderLeftWidth: 4, borderWidth: 1, borderColor: Colors.border },
  statLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, marginBottom: 6 },
  statValue: { fontSize: 28, fontWeight: '800' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 14 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  barLabel: { width: 90, fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  barTrack: { flex: 1, height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barCount: { width: 24, fontSize: 12, fontWeight: '700', color: Colors.text, textAlign: 'right' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 14 },
  navGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  navCard: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, alignItems: 'flex-start', gap: 10 },
  navIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  navLabel: { fontSize: 13, fontWeight: '700', color: Colors.text, lineHeight: 18 },
});
