import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Colors } from '../../theme/colors';

const getBadge = (count) => {
  if (count > 60) return 'Master';
  if (count > 30) return 'Expert';
  if (count > 10) return 'Skilled';
  return 'Rookie';
};

export default function MaintainerDashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useSocket('complaint_update', () => setRefresh(p => p + 1));

  const fetchTasks = async () => {
    try {
      const res = await api.get('/complaints');
      if (res.data.success) setTasks(res.data.data);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchTasks(); }, [refresh]);

  const active = tasks.filter(t => t.status === 'Assigned' || t.status === 'In Progress');
  const resolved = tasks.filter(t => t.status === 'Resolved');
  const badge = getBadge(user?.totalTasksCompleted || 0);

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
          <Text style={styles.welcome}>Welcome, {user?.name?.split(' ')[0]}! 🔧</Text>
          <Text style={styles.subtitle}>{user?.jobType || 'Maintainer'} • {user?.block || 'MSI'}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTasks(); }} tintColor={Colors.primary} />}
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: Colors.primary }]}>
            <Ionicons name="construct" size={22} color={Colors.primary} />
            <Text style={styles.statValue}>{active.length}</Text>
            <Text style={styles.statLabel}>Active Tasks</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: Colors.success }]}>
            <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
            <Text style={styles.statValue}>{resolved.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={[styles.badgeCard]}>
            <Ionicons name="star" size={22} color="#f59e0b" />
            <Text style={styles.score}>{user?.performanceScore?.toFixed(1) || 'NA'}</Text>
            <Text style={styles.badgeLabel}>{badge}</Text>
          </View>
        </View>

        {/* Assigned Floors */}
        {user?.floors && user.floors.length > 0 && (
          <View style={styles.floorsCard}>
            <Text style={styles.floorsTitle}>📍 Assigned Floors</Text>
            <View style={styles.floorsGrid}>
              {user.floors.map(f => (
                <View key={f} style={styles.floorChip}>
                  <Text style={styles.floorChipText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Active Tasks */}
        <Text style={styles.sectionTitle}>My Task Queue</Text>
        {active.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-done" size={32} color={Colors.border} />
            <Text style={styles.emptyText}>No active tasks assigned</Text>
          </View>
        ) : (
          active.map(t => (
            <TouchableOpacity key={t._id} style={styles.taskCard} onPress={() => navigation.navigate('TaskDetail', { id: t._id })} activeOpacity={0.75}>
              <View style={styles.taskRow}>
                <StatusBadge status={t.status} />
                {t.priority && (
                  <View style={[styles.priorityChip, { backgroundColor: t.priority === 'Urgent' ? '#fef2f2' : '#fff7ed' }]}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: t.priority === 'Urgent' ? Colors.danger : Colors.orange }}>⚡ {t.priority}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.taskTitle}>{t.title}</Text>
              <Text style={styles.taskLocation}>📍 {[t.block, t.floor && `Floor ${t.floor}`, t.roomNumber].filter(Boolean).join(' · ')}</Text>
              {t.deadline && (
                <View style={styles.deadlineRow}>
                  <Ionicons name="time" size={14} color={Colors.danger} />
                  <Text style={styles.deadline}>Due: {new Date(t.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}

        {/* Completed */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Completed History</Text>
        {resolved.length === 0 ? (
          <View style={[styles.emptyCard, { borderStyle: 'dashed' }]}>
            <Text style={styles.emptyText}>No completed tasks yet. Keep it up!</Text>
          </View>
        ) : (
          resolved.map(t => (
            <TouchableOpacity key={t._id} style={[styles.taskCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}
              onPress={() => navigation.navigate('TaskDetail', { id: t._id })} activeOpacity={0.75}>
              <View style={styles.taskRow}>
                <StatusBadge status="Resolved" />
              </View>
              <Text style={styles.taskTitle}>{t.title}</Text>
              <Text style={styles.taskLocation}>📍 {[t.block, t.floor && `Floor ${t.floor}`, t.roomNumber].filter(Boolean).join(' · ')}</Text>
            </TouchableOpacity>
          ))
        )}

        {/* Branding */}
        <View style={styles.branding}>
          <Text style={styles.brandingText}>Managed by Maharaja Surajmal Institute</Text>
          <Text style={styles.versionText}>v2.1.0 • Field Op Edition</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  logo: { width: 40, height: 40, borderRadius: 8 },
  headerBottom: {},
  welcome: { fontSize: 22, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2, fontWeight: '600' },
  logoutBtn: { padding: 8 },
  scroll: { padding: 16, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderLeftWidth: 4, borderWidth: 1, borderColor: Colors.border, alignItems: 'flex-start', gap: 4 },
  statValue: { fontSize: 26, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  badgeCard: { flex: 1, backgroundColor: '#fffbeb', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#fde68a', alignItems: 'center', justifyContent: 'center', gap: 4 },
  score: { fontSize: 22, fontWeight: '800', color: '#92400e' },
  badgeLabel: { fontSize: 11, color: '#b45309', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 14 },
  taskCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  taskRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  priorityChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  taskTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 6, lineHeight: 22 },
  taskLocation: { fontSize: 12, color: Colors.textMuted, marginBottom: 8 },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  deadline: { fontSize: 12, color: Colors.danger, fontWeight: '600' },
  emptyCard: { backgroundColor: '#fff', borderRadius: 14, padding: 30, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: Colors.border },
  emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center' },
  floorsCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: Colors.border },
  floorsTitle: { fontSize: 14, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  floorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  floorChip: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  floorChipText: { fontSize: 12, fontWeight: '700', color: Colors.text },
  branding: { marginTop: 40, alignItems: 'center', opacity: 0.5, paddingBottom: 20 },
  brandingText: { fontSize: 11, fontWeight: '700', color: Colors.text, textTransform: 'uppercase', letterSpacing: 1 },
  versionText: { fontSize: 10, color: Colors.textMuted, marginTop: 4 },
});
