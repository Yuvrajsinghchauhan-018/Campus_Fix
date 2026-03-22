import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api, { API_BASE_URL } from '../../api/axios';
import { Colors } from '../../theme/colors';

export default function PDFReportsScreen({ navigation }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.get('/complaints').then(res => {
      if (res.data.success) setComplaints(res.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const resolved = complaints.filter(c => c.status === 'Resolved');
  const pending = complaints.filter(c => c.status === 'Pending');
  const inProgress = complaints.filter(c => ['Assigned', 'Accepted', 'In Progress'].includes(c.status));
  const avgRating = resolved.filter(c => c.rating).length
    ? resolved.filter(c => c.rating).reduce((sum, c, _, arr) => sum + c.rating / arr.length, 0)
    : null;

  const handleDownloadReport = async () => {
    setGenerating(true);
    try {
      // Open the backend PDF report URL in browser
      const reportUrl = `${API_BASE_URL}/analytics/report`;
      const canOpen = await Linking.canOpenURL(reportUrl);
      if (canOpen) {
        await Linking.openURL(reportUrl);
      } else {
        Alert.alert('Error', 'Cannot open report URL. Make sure the backend is running.');
      }
    } catch (_) {
      Alert.alert('Error', 'Could not open the report.');
    } finally { setGenerating(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monthly PDF Reports</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Stats Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Current Overview</Text>
          <View style={styles.statsGrid}>
            <StatBox label="Total" value={complaints.length} color={Colors.text} />
            <StatBox label="Resolved" value={resolved.length} color={Colors.success} />
            <StatBox label="Pending" value={pending.length} color={Colors.warning} />
            <StatBox label="In Progress" value={inProgress.length} color={Colors.orange} />
          </View>
          {avgRating !== null && (
            <View style={styles.ratingBox}>
              <Text style={styles.ratingLabel}>Average Rating</Text>
              <Text style={styles.ratingValue}>{'⭐'.repeat(Math.round(avgRating))} {avgRating.toFixed(2)}/5</Text>
            </View>
          )}
        </View>

        {/* Download Report */}
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 36 }]}>
          <View style={styles.reportIcon}>
            <Ionicons name="document-text" size={44} color={Colors.primary} />
          </View>
          <Text style={styles.reportTitle}>Full System Report</Text>
          <Text style={styles.reportDesc}>
            Download a comprehensive PDF summarizing resolution rates, maintenance costs, and SLA adherence across all campus sectors.
          </Text>
          <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadReport} disabled={generating || loading}>
            {generating ? <ActivityIndicator color="#fff" /> : (
              <><Ionicons name="download" size={20} color="#fff" /><Text style={styles.downloadText}>Generate Full System Report</Text></>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const StatBox = ({ label, value, color }) => (
  <View style={styles.statBox}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: { width: '47%', backgroundColor: Colors.bg, borderRadius: 12, padding: 14, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', marginTop: 4, textTransform: 'uppercase' },
  ratingBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, backgroundColor: Colors.bg, borderRadius: 12, padding: 14 },
  ratingLabel: { fontSize: 13, fontWeight: '700', color: Colors.textMuted },
  ratingValue: { fontSize: 15, fontWeight: '800', color: '#f59e0b' },
  reportIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 2, borderColor: '#bfdbfe' },
  reportTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 10 },
  reportDesc: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 28, paddingHorizontal: 10 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 14 },
  downloadText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
