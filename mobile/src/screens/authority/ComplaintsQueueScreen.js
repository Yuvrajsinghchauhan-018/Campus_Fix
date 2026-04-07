import React, { useState, useEffect, useRef } from 'react';
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
const categoryToMaintainer = {
  'Lab Management': ['MTS', 'AMC', 'Peon', 'Electrician', 'Printer Repair', 'Lab Technician'],
  Infrastructure: ['Electrician', 'Plumber', 'Lab Technician', 'Printer Repair', 'AC Mechanic', 'Carpenter', 'Painter', 'Civil Worker', 'Sweeper'],
};

const getImageUrl = (url) => url?.startsWith('/uploads/') ? `${STATIC_BASE_URL}${url}` : url;

function getSlaDate(hours) {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

export default function ComplaintsQueueScreen({ navigation }) {
  const assignScrollRef = useRef(null);
  const assignFieldPositions = useRef({ deadline: 0, internalNote: 0 });
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
  const [maintainerPickerOpen, setMaintainerPickerOpen] = useState(false);

  // Dismiss Modal
  const [dismissComp, setDismissComp] = useState(null);
  const [dismissReason, setDismissReason] = useState('Inappropriate Content');
  const [customReason, setCustomReason] = useState('');
  const [dismissing, setDismissing] = useState(false);

  useSocket('complaint_update', () => setRefresh(p => p + 1));
  useSocket('maintainer_update', () => setRefresh(p => p + 1));

  useEffect(() => {
    if (!selectedComp) {
      setMaintainerPickerOpen(false);
    }
  }, [selectedComp]);

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
      setMaintainerPickerOpen(false);
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

  const scrollAssignFieldIntoView = (field) => {
    setTimeout(() => {
      const y = Math.max(0, (assignFieldPositions.current[field] || 0) - 95);
      assignScrollRef.current?.scrollTo({ y, animated: true });
    }, 180);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const current = complaints[tab] || [];
  const eligibleMaintainers = maintainers.filter(m =>
    selectedComp?.categories?.some(cat => categoryToMaintainer[cat]?.includes(m.jobType)) || false
  );
  const selectedMaintainerDetails = eligibleMaintainers.find(m => m._id === assignData.assignedMaintainer) || null;

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
                  <Text style={styles.sectionLabel}>👷 Assigned Lab Technician</Text>
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
          <View style={[styles.modalBox, styles.assignModalBox]}>
            <View style={styles.assignHandle} />
            <ScrollView
              ref={assignScrollRef}
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              automaticallyAdjustKeyboardInsets
              contentContainerStyle={styles.assignScrollContent}
            >
            <View style={styles.assignHero}>
              <View style={styles.assignHeroBadge}>
                <Ionicons name="person-add" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Assign Maintainer</Text>
                <Text style={styles.modalSubtitle} numberOfLines={2}>{selectedComp?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedComp(null)} style={styles.assignCloseBtn}>
                <Ionicons name="close" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.assignSummaryCard}>
              <View style={styles.assignSummaryRow}>
                <Ionicons name="location-outline" size={14} color={Colors.primary} />
                <Text style={styles.assignSummaryText}>
                  {[selectedComp?.block, selectedComp?.floor && `Floor ${selectedComp.floor}`, selectedComp?.roomNumber].filter(Boolean).join(' • ')}
                </Text>
              </View>
              {!!selectedComp?.categories?.length && (
                <View style={styles.assignCategoryRow}>
                  {selectedComp.categories.map(cat => (
                    <View key={cat} style={styles.assignCategoryChip}>
                      <Text style={styles.assignCategoryText}>{cat}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.assignSectionHeader}>
              <Text style={styles.fieldLabel}>MAINTAINER TO ASSIGN</Text>
              <Text style={styles.assignSectionMeta}>{eligibleMaintainers.length} available</Text>
            </View>
            <Text style={styles.assignHelperText}>
              Step 1: Tap "Choose Maintainer". Step 2: Tap one name from the list.
            </Text>
            {eligibleMaintainers.length > 0 ? (
              <>
                <TouchableOpacity
                  style={[styles.dropdownField, selectedMaintainerDetails && styles.dropdownFieldActive]}
                  onPress={() => setMaintainerPickerOpen(v => !v)}
                  activeOpacity={0.9}
                >
                  <View style={styles.dropdownFieldIcon}>
                    <Ionicons name="person-circle-outline" size={24} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dropdownFieldLabel}>
                      {selectedMaintainerDetails ? selectedMaintainerDetails.name : 'Choose Maintainer'}
                    </Text>
                    <Text style={styles.dropdownFieldValue}>
                      {selectedMaintainerDetails
                        ? `${selectedMaintainerDetails.jobType} • Score ${selectedMaintainerDetails.performanceScore?.toFixed(1) ?? 'N/A'}`
                        : 'Opens a simple list of available maintainers'}
                    </Text>
                  </View>
                  <Ionicons name={maintainerPickerOpen ? 'chevron-up' : 'chevron-down'} size={22} color={Colors.textMuted} />
                </TouchableOpacity>
                {maintainerPickerOpen && (
                  <View style={styles.inlinePickerCard}>
                    <View style={styles.inlinePickerHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inlinePickerTitle}>Choose Maintainer</Text>
                        <Text style={styles.inlinePickerSubtitle}>
                          Tap one name below. After you choose, the list closes automatically.
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => setMaintainerPickerOpen(false)} style={styles.inlinePickerCloseBtn}>
                        <Ionicons name="close" size={18} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </View>

                    <ScrollView
                      style={styles.inlinePickerList}
                      contentContainerStyle={styles.maintainerListContent}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                    >
                      {eligibleMaintainers.map(m => (
                        <TouchableOpacity
                          key={m._id}
                          style={[styles.maintainerOption, styles.pickerOption, assignData.assignedMaintainer === m._id && styles.maintainerOptionActive]}
                          onPress={() => {
                            setAssignData(d => ({ ...d, assignedMaintainer: m._id }));
                            setMaintainerPickerOpen(false);
                          }}
                          activeOpacity={0.92}
                        >
                          <View style={[styles.mAvatar, assignData.assignedMaintainer === m._id && styles.mAvatarActive]}>
                            <Text style={[styles.mAvatarText, assignData.assignedMaintainer === m._id && styles.mAvatarTextActive]}>
                              {m.name?.charAt(0)?.toUpperCase()}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.pickerName}>{m.name}</Text>
                            <Text style={styles.pickerMeta}>{m.jobType}</Text>
                            <Text style={styles.pickerMeta}>Performance score: {m.performanceScore?.toFixed(1) ?? 'N/A'}</Text>
                          </View>
                          <View style={[styles.selectCircle, assignData.assignedMaintainer === m._id && styles.selectCircleActive]}>
                            {assignData.assignedMaintainer === m._id && <Ionicons name="checkmark" size={14} color="#fff" />}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                {!!selectedMaintainerDetails && (
                  <View style={styles.selectedMaintainerBanner}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                    <Text style={styles.selectedMaintainerBannerText}>
                      {selectedMaintainerDetails.name} is selected for this complaint.
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyMaintainerState}>
                <View style={styles.emptyMaintainerIcon}>
                  <Ionicons name="construct-outline" size={24} color={Colors.textMuted} />
                </View>
                <Text style={styles.emptyMaintainerTitle}>No matching maintainer found</Text>
                <Text style={styles.emptyMaintainerText}>
                  Add or approve a maintainer for this complaint category to continue assignment.
                </Text>
              </View>
            )}

            {/* SLA Preset Chips */}
            <Text style={styles.fieldLabel}>DEADLINE</Text>
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
            <View onLayout={(e) => { assignFieldPositions.current.deadline = e.nativeEvent.layout.y; }}>
              <TextInput
                style={styles.input}
                placeholder="Or type custom date: 2026-03-25T18:00"
                placeholderTextColor={Colors.textMuted}
                value={assignData.deadline}
                onChangeText={v => setAssignData(d => ({ ...d, deadline: v }))}
                onFocus={() => scrollAssignFieldIntoView('deadline')}
              />
            </View>

            <Text style={styles.fieldLabel}>INTERNAL NOTE (OPTIONAL)</Text>
            <View onLayout={(e) => { assignFieldPositions.current.internalNote = e.nativeEvent.layout.y; }}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Check wiring first"
                placeholderTextColor={Colors.textMuted}
                value={assignData.internalNote}
                onChangeText={v => setAssignData(d => ({ ...d, internalNote: v }))}
                onFocus={() => scrollAssignFieldIntoView('internalNote')}
              />
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: Colors.primary }]} onPress={handleAssign} disabled={assigning}>
                {assigning ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Confirm Assignment</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#f1f5f9' }]} onPress={() => setSelectedComp(null)}>
                <Text style={[styles.modalBtnText, { color: Colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
            </ScrollView>
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
  assignModalBox: { paddingTop: 14 },
  assignScrollContent: { paddingBottom: 16 },
  assignHandle: { alignSelf: 'center', width: 52, height: 5, borderRadius: 999, backgroundColor: '#cbd5e1', marginBottom: 14 },
  assignHero: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  assignHeroBadge: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center' },
  assignCloseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  assignSummaryCard: { backgroundColor: '#f8fbff', borderWidth: 1, borderColor: '#dbeafe', borderRadius: 18, padding: 14, marginBottom: 10 },
  assignSummaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  assignSummaryText: { flex: 1, fontSize: 13, color: Colors.text, fontWeight: '600' },
  assignCategoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  assignCategoryChip: { backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#bfdbfe' },
  assignCategoryText: { fontSize: 11, color: Colors.primary, fontWeight: '800', textTransform: 'uppercase' },
  assignSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  assignSectionMeta: { fontSize: 12, color: Colors.textMuted, fontWeight: '700' },
  assignHelperText: { fontSize: 13, color: Colors.textMuted, lineHeight: 19, marginBottom: 10 },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: Colors.textMuted, lineHeight: 18, marginBottom: 4 },
  closeBtn: { padding: 8, backgroundColor: Colors.bg, borderRadius: 20 },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1, marginBottom: 8, marginTop: 14, textTransform: 'uppercase' },
  dropdownField: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 78, borderRadius: 18, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8 },
  dropdownFieldActive: { borderColor: '#93c5fd', backgroundColor: '#eff6ff' },
  dropdownFieldIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center' },
  dropdownFieldLabel: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 3 },
  dropdownFieldValue: { fontSize: 13, color: Colors.textMuted, lineHeight: 18 },
  inlinePickerCard: { backgroundColor: '#f8fbff', borderWidth: 1, borderColor: '#dbeafe', borderRadius: 18, padding: 12, marginBottom: 8 },
  inlinePickerHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  inlinePickerTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 3 },
  inlinePickerSubtitle: { fontSize: 12, color: Colors.textMuted, lineHeight: 17 },
  inlinePickerCloseBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  inlinePickerList: { maxHeight: 280 },
  selectedMaintainerBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 6 },
  selectedMaintainerBannerText: { flex: 1, fontSize: 13, color: '#166534', fontWeight: '700' },
  maintainerList: { maxHeight: 270, marginBottom: 4 },
  maintainerListContent: { gap: 10, paddingBottom: 6 },
  maintainerOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: '#fff', shadowColor: '#0f172a', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  maintainerOptionActive: { backgroundColor: '#eff6ff', borderColor: '#93c5fd', shadowColor: '#2563eb', shadowOpacity: 0.12 },
  mAvatar: { width: 46, height: 46, borderRadius: 16, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  mAvatarActive: { backgroundColor: Colors.primary },
  mAvatarText: { fontWeight: '900', color: Colors.primary, fontSize: 16 },
  mAvatarTextActive: { color: '#fff' },
  maintainerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 4 },
  mName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  mJob: { fontSize: 11, color: Colors.textMuted },
  jobTypePill: { backgroundColor: '#f8fafc', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: Colors.border },
  jobTypePillText: { fontSize: 10, color: Colors.textMuted, fontWeight: '800', textTransform: 'uppercase' },
  pickerOption: { minHeight: 86, paddingVertical: 16 },
  pickerName: { fontSize: 17, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  pickerMeta: { fontSize: 13, color: Colors.textMuted, lineHeight: 18 },
  selectCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  selectCircleActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  emptyMaintainerState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 28, paddingHorizontal: 18, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: '#fff' },
  emptyMaintainerIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  emptyMaintainerTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  emptyMaintainerText: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
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
