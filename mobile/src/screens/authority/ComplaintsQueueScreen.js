import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
  Modal, TextInput, Alert, ActivityIndicator, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api, { STATIC_BASE_URL } from '../../api/axios';
import { useSocket } from '../../hooks/useSocket';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Colors } from '../../theme/colors';

const TABS = ['queue', 'assigned', 'completed', 'dismissed'];
const TAB_LABELS = { queue: 'Task Queue', assigned: 'Assigned', completed: 'Completed', dismissed: 'Dismissed' };
const TAB_COLORS = { queue: Colors.warning, assigned: Colors.orange, completed: Colors.success, dismissed: Colors.danger };
const DISMISS_REASONS = ['Inappropriate Content', 'Already Solved', 'Out of Scope', 'Not Enough Information', 'Other'];

const SLA_PRESETS = [
  { label: 'End of Day', hours: 8 },
  { label: '24 Hours', hours: 24 },
  { label: '48 Hours', hours: 48 },
  { label: '1 Week', hours: 168 },
];

const getImageUrl = (url) => url?.startsWith('/uploads/') ? `${STATIC_BASE_URL}${url}` : url;

function getSlaDate(hours) {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

export default function ComplaintsQueueScreen({ navigation }) {
  const [complaints, setComplaints] = useState({ queue: [], assigned: [], completed: [], dismissed: [] });
  const [tab, setTab] = useState('queue');
  const [maintainers, setMaintainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refresh, setRefresh] = useState(0);

  // View Detail Modal
  const [viewingComp, setViewingComp] = useState(null);

  // Assign Modal
  const [selectedComp, setSelectedComp] = useState(null);
  const [assignData, setAssignData] = useState({ assignedMaintainer: '', deadline: '', internalNote: '' });
  const [assigning, setAssigning] = useState(false);

  // Dismiss Modal
  const [dismissComp, setDismissComp] = useState(null);
  const [dismissReason, setDismissReason] = useState('Inappropriate Content');
  const [customReason, setCustomReason] = useState('');
  const [dismissing, setDismissing] = useState(false);

  useSocket('complaint_update', () => setRefresh(p => p + 1));
  useSocket('maintainer_update', () => setRefresh(p => p + 1));

  const fetchAll = async () => {
    try {
      const [cRes, mRes] = await Promise.all([api.get('/complaints'), api.get('/maintainers')]);
      const all = cRes.data.data || [];
      setComplaints({
        queue: all.filter(c => c.status === 'Pending'),
        assigned: all.filter(c => ['Assigned', 'Accepted', 'In Progress'].includes(c.status)),
        completed: all.filter(c => c.status === 'Resolved'),
        dismissed: all.filter(c => c.status === 'Rejected'),
      });
      setMaintainers(mRes.data.data || []);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchAll(); }, [refresh]);

  const handleAssign = async () => {
    if (!assignData.assignedMaintainer || !assignData.deadline) {
      Alert.alert('Error', 'Select a maintainer and set a deadline.'); return;
    }
    setAssigning(true);
    try {
      await api.patch(`/complaints/${selectedComp._id}/approve-assign`, assignData);
      setSelectedComp(null);
      setAssignData({ assignedMaintainer: '', deadline: '', internalNote: '' });
      fetchAll();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Assignment failed');
    } finally { setAssigning(false); }
  };

  const handleDismiss = async () => {
    const finalReason = dismissReason === 'Other' ? customReason : dismissReason;
    if (!finalReason) { Alert.alert('Error', 'Provide a reason.'); return; }
    setDismissing(true);
    try {
      await api.patch(`/complaints/${dismissComp._id}/status`, { status: 'Rejected', resolutionNote: finalReason });
      setDismissComp(null);
      fetchAll();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Dismissal failed');
    } finally { setDismissing(false); }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const current = complaints[tab] || [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complaints Management</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={{ height: 48, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map(t => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && { borderBottomColor: TAB_COLORS[t], borderBottomWidth: 3 }]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && { color: TAB_COLORS[t], fontWeight: '800' }]}>
                {TAB_LABELS[t]} ({complaints[t]?.length ?? 0})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor={Colors.primary} />}
      >
        {current.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="checkmark-done" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No {TAB_LABELS[tab].toLowerCase()} complaints</Text>
          </View>
        ) : (
          current.map(c => (
            <View key={c._id} style={styles.card}>
              <View style={styles.cardRow}>
                <StatusBadge status={c.status} />
                {c.priority && <Text style={[styles.priority, { color: c.priority === 'Urgent' ? Colors.danger : Colors.orange }]}>⚡ {c.priority}</Text>}
                <Text style={styles.date}>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
              </View>

              {/* Clickable title opens detail modal */}
              <TouchableOpacity onPress={() => setViewingComp(c)}>
                <Text style={[styles.cardTitle, { color: Colors.primary, textDecorationLine: 'underline' }]}>{c.title}</Text>
              </TouchableOpacity>
              <Text style={styles.cardDesc} numberOfLines={2}>{c.description}</Text>
              <Text style={styles.cardLocation}>📍 {[c.block, c.floor && `Floor ${c.floor}`, c.roomNumber].filter(Boolean).join(' · ')}</Text>
              {c.submittedBy && <Text style={styles.cardBy}>👤 {c.submittedBy.name}</Text>}
              {/* Categories */}
              {c.categories?.length > 0 && (
                <View style={styles.tagRow}>
                  {c.categories.map(cat => <View key={cat} style={styles.tag}><Text style={styles.tagText}>{cat}</Text></View>)}
                </View>
              )}
              {/* Assigned tab: show maintainer */}
              {tab === 'assigned' && c.assignedMaintainer && (
                <View style={styles.assignedInfo}>
                  <Ionicons name="person" size={13} color={Colors.primary} />
                  <Text style={styles.assignedText}>{c.assignedMaintainer.name} · {c.assignedMaintainer.jobType}</Text>
                </View>
              )}
              {/* Completed tab: show resolution note */}
              {tab === 'completed' && (
                <Text style={styles.resNote} numberOfLines={2}>{c.resolutionNote || 'No resolution note.'}</Text>
              )}

              {tab === 'queue' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primary }]} onPress={() => { setSelectedComp(c); setAssignData({ assignedMaintainer: '', deadline: '', internalNote: '' }); }}>
                    <Ionicons name="person-add" size={14} color="#fff" />
                    <Text style={styles.actionBtnText}>Approve & Assign</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.danger }]} onPress={() => setDismissComp(c)}>
                    <Ionicons name="close-circle" size={14} color="#fff" />
                    <Text style={styles.actionBtnText}>Dismiss</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* ===== VIEW DETAIL MODAL ===== */}
      <Modal visible={!!viewingComp} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle} numberOfLines={2}>{viewingComp?.title}</Text>
                <Text style={styles.modalSubtitle}>
                  Room {viewingComp?.roomNumber}, Block {viewingComp?.block}, Floor {viewingComp?.floor} · {viewingComp?.locationType}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setViewingComp(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {/* Status & Priority Row */}
              <View style={styles.detailRow}>
                <View style={styles.detailBox}>
                  <Text style={styles.detailLabel}>STATUS</Text>
                  <StatusBadge status={viewingComp?.status} />
                </View>
                <View style={styles.detailBox}>
                  <Text style={styles.detailLabel}>PRIORITY</Text>
                  <Text style={[styles.detailValue, { color: viewingComp?.priority === 'Urgent' ? Colors.danger : viewingComp?.priority === 'High' ? Colors.orange : Colors.text }]}>
                    {viewingComp?.priority}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <View style={styles.descBox}>
                <Text style={{ fontSize: 14, color: Colors.textMuted, lineHeight: 22 }}>{viewingComp?.description}</Text>
              </View>

              {/* AI Reason */}
              {viewingComp?.aiReason && (
                <View style={styles.aiBox}>
                  <Ionicons name="sparkles" size={14} color="#7c3aed" />
                  <Text style={styles.aiText}>{viewingComp.aiReason}</Text>
                </View>
              )}

              {/* Photos */}
              {viewingComp?.photos?.length > 0 && (
                <View style={{ marginBottom: 14 }}>
                  <Text style={styles.sectionLabel}>📷 Attached Evidence</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {viewingComp.photos.map((url, i) => (
                      <Image key={i} source={{ uri: getImageUrl(url) }} style={styles.photo} />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Assigned Maintainer (if any) */}
              {viewingComp?.assignedMaintainer && (
                <View style={styles.techCard}>
                  <Text style={styles.sectionLabel}>👷 Allocated Technician</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontWeight: '700', color: Colors.text }}>{viewingComp.assignedMaintainer.name}</Text>
                    <Text style={{ color: Colors.primary, fontWeight: '700' }}>{viewingComp.assignedMaintainer.jobType}</Text>
                  </View>
                </View>
              )}

              {/* Action from detail modal */}
              {viewingComp?.status === 'Pending' && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: Colors.primary, marginTop: 16 }]}
                  onPress={() => { setSelectedComp(viewingComp); setViewingComp(null); setAssignData({ assignedMaintainer: '', deadline: '', internalNote: '' }); }}
                >
                  <Ionicons name="person-add" size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>Approve & Assign Maintainer</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ===== ASSIGN MODAL (with SLA presets) ===== */}
      <Modal visible={!!selectedComp} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Approve & Assign</Text>
            <Text style={styles.modalSubtitle}>{selectedComp?.title}</Text>

            <Text style={styles.fieldLabel}>SELECT MAINTAINER</Text>
            <ScrollView style={styles.maintainerList} nestedScrollEnabled>
              {maintainers
                .filter(m => {
                  const categoryToMaintainer = {
                    'Electrical': ['Electrician'],
                    'Plumbing': ['Plumber'],
                    'IT Systems': ['Lab Technician'],
                    'Lab Management': ['Lab Technician', 'Electrician', 'MTS', 'AMC', 'Peon'],
                    'Infrastructure': ['AC Mechanic', 'Carpenter', 'Painter', 'Civil Worker', 'Sweeper']
                  };
                  return selectedComp?.categories?.some(cat =>
                    categoryToMaintainer[cat]?.includes(m.jobType)
                  ) || false;
                })
                .map(m => (
                <TouchableOpacity
                  key={m._id}
                  style={[styles.maintainerOption, assignData.assignedMaintainer === m._id && styles.maintainerOptionActive]}
                  onPress={() => setAssignData(d => ({ ...d, assignedMaintainer: m._id }))}
                >
                  <View style={styles.mAvatar}><Text style={styles.mAvatarText}>{m.name?.charAt(0)}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mName}>{m.name} ({m.jobType})</Text>
                    <Text style={styles.mJob}>Score: {m.performanceScore?.toFixed(1) ?? 'N/A'}</Text>
                  </View>
                  {assignData.assignedMaintainer === m._id && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* SLA Preset Chips */}
            <Text style={styles.fieldLabel}>SLA DEADLINE</Text>
            <View style={styles.slaPresets}>
              {SLA_PRESETS.map(p => {
                const val = getSlaDate(p.hours);
                const active = assignData.deadline === val;
                return (
                  <TouchableOpacity key={p.label} style={[styles.slaChip, active && styles.slaChipActive]} onPress={() => setAssignData(d => ({ ...d, deadline: val }))}>
                    <Text style={[styles.slaChipText, active && styles.slaChipTextActive]}>{p.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Or type custom date: 2026-03-25T18:00"
              placeholderTextColor={Colors.textMuted}
              value={assignData.deadline}
              onChangeText={v => setAssignData(d => ({ ...d, deadline: v }))}
            />

            <Text style={styles.fieldLabel}>INTERNAL NOTE (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Check wiring first"
              placeholderTextColor={Colors.textMuted}
              value={assignData.internalNote}
              onChangeText={v => setAssignData(d => ({ ...d, internalNote: v }))}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: Colors.primary }]} onPress={handleAssign} disabled={assigning}>
                {assigning ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Confirm Assignment</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#f1f5f9' }]} onPress={() => setSelectedComp(null)}>
                <Text style={[styles.modalBtnText, { color: Colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== DISMISS MODAL ===== */}
      <Modal visible={!!dismissComp} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={[styles.modalTitle, { color: Colors.danger }]}>Dismiss Job</Text>
            <Text style={styles.modalSubtitle}>{dismissComp?.title}</Text>
            <Text style={styles.fieldLabel}>REASON FOR DISMISSAL</Text>
            {DISMISS_REASONS.map(r => (
              <TouchableOpacity key={r} style={styles.radioRow} onPress={() => setDismissReason(r)}>
                <View style={[styles.radioOuter, dismissReason === r && { borderColor: Colors.danger }]}>
                  {dismissReason === r && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.radioLabel, dismissReason === r && { color: Colors.text, fontWeight: '700' }]}>{r}</Text>
              </TouchableOpacity>
            ))}
            {dismissReason === 'Other' && (
              <TextInput style={styles.input} placeholder="Enter custom reason..." placeholderTextColor={Colors.textMuted}
                value={customReason} onChangeText={setCustomReason} multiline />
            )}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: Colors.danger }]} onPress={handleDismiss} disabled={dismissing}>
                {dismissing ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Confirm Dismissal</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#f1f5f9' }]} onPress={() => setDismissComp(null)}>
                <Text style={[styles.modalBtnText, { color: Colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  tabs: { paddingHorizontal: 16, alignItems: 'center' },
  tab: { paddingHorizontal: 14, height: 48, justifyContent: 'center', marginRight: 4, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  list: { padding: 14, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  priority: { fontSize: 11, fontWeight: '700' },
  date: { marginLeft: 'auto', fontSize: 11, color: Colors.textMuted },
  cardTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  cardDesc: { fontSize: 13, color: Colors.textMuted, marginBottom: 6, lineHeight: 20 },
  cardLocation: { fontSize: 12, color: Colors.textMuted, marginBottom: 4 },
  cardBy: { fontSize: 12, color: Colors.textMuted, marginBottom: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  tag: { backgroundColor: '#f1f5f9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 10, color: '#475569', fontWeight: '700', textTransform: 'uppercase' },
  assignedInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, backgroundColor: Colors.primaryLight, borderRadius: 8, padding: 8 },
  assignedText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  resNote: { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic', marginBottom: 8 },
  actionRow: { flexDirection: 'row', gap: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: 12 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  empty: { alignItems: 'center', padding: 60, gap: 12 },
  emptyText: { color: Colors.textMuted, fontSize: 15 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: Colors.textMuted, lineHeight: 18, marginBottom: 4 },
  closeBtn: { padding: 8, backgroundColor: Colors.bg, borderRadius: 20 },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1, marginBottom: 8, marginTop: 14, textTransform: 'uppercase' },
  maintainerList: { maxHeight: 200, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 4 },
  maintainerOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  maintainerOptionActive: { backgroundColor: Colors.primaryLight },
  mAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  mAvatarText: { fontWeight: '800', color: Colors.primary },
  mName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  mJob: { fontSize: 11, color: Colors.textMuted },
  slaPresets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  slaChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#f8fafc' },
  slaChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  slaChipText: { fontSize: 13, fontWeight: '700', color: Colors.textMuted },
  slaChipTextActive: { color: Colors.primary },
  input: { backgroundColor: Colors.bg, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, padding: 14, fontSize: 14, color: Colors.text, marginBottom: 4 },
  modalBtns: { flexDirection: 'column', gap: 10, marginTop: 20 },
  modalBtn: { padding: 16, borderRadius: 14, alignItems: 'center' },
  modalBtnText: { fontWeight: '700', color: '#fff', fontSize: 15 },

  // View detail
  detailRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  detailBox: { flex: 1, backgroundColor: Colors.bg, borderRadius: 12, padding: 12 },
  detailLabel: { fontSize: 10, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' },
  detailValue: { fontSize: 14, fontWeight: '800' },
  descBox: { backgroundColor: Colors.bg, borderRadius: 14, padding: 14, marginBottom: 14 },
  aiBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: '#f5f3ff', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#ddd6fe' },
  aiText: { flex: 1, fontSize: 12, color: '#7c3aed', fontStyle: 'italic' },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: Colors.text, marginBottom: 10 },
  photo: { width: 130, height: 130, borderRadius: 12, marginRight: 10 },
  techCard: { backgroundColor: Colors.primaryLight, borderRadius: 14, padding: 14, marginBottom: 14 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 10 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.danger },
  radioLabel: { fontSize: 14, fontWeight: '600', color: Colors.textMuted, flex: 1 },
});
