import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert,
  TextInput, ActivityIndicator, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api, { STATIC_BASE_URL } from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Colors } from '../../theme/colors';

const getImageUrl = (url) => url?.startsWith('/uploads/') ? `${STATIC_BASE_URL}${url}` : url;

const FLOW = {
  normal: ['Pending', 'Assigned', 'In Progress', 'Resolved'],
  rejected: ['Pending', 'Rejected'],
};

export default function ComplaintDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingDone, setRatingDone] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const fetchComplaint = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.data);
        if (res.data.data.rating) setRatingDone(true);
      }
    } catch (_) {
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchComplaint(); }, [id]);

  const submitRating = async () => {
    if (!rating) return;
    setRatingLoading(true);
    try {
      await api.patch(`/complaints/${id}/rate`, { rating, feedback });
      setRatingDone(true);
      fetchComplaint();
      Alert.alert('Thanks!', 'Your rating was submitted.');
    } catch (_) {
      Alert.alert('Error', 'Could not submit rating.');
    } finally { setRatingLoading(false); }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!complaint) return (
    <SafeAreaView style={styles.safe}>
      <Text style={{ textAlign: 'center', marginTop: 40 }}>Complaint not found</Text>
    </SafeAreaView>
  );

  const flow = complaint.status === 'Rejected' ? FLOW.rejected : FLOW.normal;
  const currentIndex = flow.indexOf(complaint.status);
  const date = new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{complaint.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Status & Priority */}
        <View style={styles.row}>
          <StatusBadge status={complaint.status} />
          {complaint.priority && (
            <View style={[styles.priorityBadge, { backgroundColor: complaint.priority === 'Urgent' ? '#fef2f2' : complaint.priority === 'High' ? '#fff7ed' : '#f1f5f9' }]}>
              <Text style={[styles.priorityText, { color: complaint.priority === 'Urgent' ? Colors.danger : complaint.priority === 'High' ? Colors.orange : Colors.textMuted }]}>
                ⚡ {complaint.priority}
              </Text>
            </View>
          )}
          <Text style={styles.date}>{date}</Text>
        </View>

        {/* Title & Desc */}
        <View style={styles.card}>
          <Text style={styles.title}>{complaint.title}</Text>
          <Text style={styles.desc}>{complaint.description}</Text>
          {complaint.aiReason && (
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={14} color="#7c3aed" />
              <Text style={styles.aiText}>{complaint.aiReason}</Text>
            </View>
          )}
        </View>

        {/* Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Location & Category</Text>
          <Text style={styles.infoRow}><Text style={styles.infoLabel}>Block: </Text>{complaint.block}</Text>
          <Text style={styles.infoRow}><Text style={styles.infoLabel}>Floor: </Text>{complaint.floor}</Text>
          <Text style={styles.infoRow}><Text style={styles.infoLabel}>Room: </Text>{complaint.roomNumber}</Text>
          <Text style={styles.infoRow}><Text style={styles.infoLabel}>Type: </Text>{complaint.locationType}</Text>
          {complaint.categories?.length > 0 && (
            <View style={styles.tagRow}>
              {complaint.categories.map(c => (
                <View key={c} style={styles.tag}><Text style={styles.tagText}>{c}</Text></View>
              ))}
            </View>
          )}
        </View>

        {/* Assignment */}
        {complaint.assignedMaintainer && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>👷 Assigned Maintainer</Text>
            <View style={styles.maintainerRow}>
              <View style={styles.mAvatar}>
                <Text style={styles.mAvatarText}>{complaint.assignedMaintainer.name?.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.mName}>{complaint.assignedMaintainer.name}</Text>
                <Text style={styles.mJob}>{complaint.assignedMaintainer.jobType}</Text>
              </View>
            </View>
            {complaint.deadline && complaint.status !== 'Resolved' && (
              <View style={styles.deadlineBadge}>
                <Ionicons name="time" size={14} color={Colors.danger} />
                <Text style={styles.deadlineText}>
                  SLA Deadline: {new Date(complaint.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Photos */}
        {complaint.photos?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📷 Submitted Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {complaint.photos.map((url, i) => (
                <TouchableOpacity key={i} onPress={() => setLightbox(getImageUrl(url))}>
                  <Image source={{ uri: getImageUrl(url) }} style={styles.photo} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Resolution */}
        {complaint.status === 'Resolved' && (
          <View style={[styles.card, { borderTopWidth: 4, borderTopColor: Colors.success }]}>
            <Text style={[styles.cardTitle, { color: Colors.success }]}>✅ Resolution Details</Text>
            <Text style={styles.desc}>{complaint.resolutionNote || 'Issue resolved by the assigned maintainer.'}</Text>
            {complaint.completionPhoto && (
              <TouchableOpacity onPress={() => setLightbox(getImageUrl(complaint.completionPhoto))}>
                <Image source={{ uri: getImageUrl(complaint.completionPhoto) }} style={styles.photo} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {complaint.status === 'Rejected' && (
          <View style={[styles.card, { borderTopWidth: 4, borderTopColor: Colors.danger }]}>
            <Text style={[styles.cardTitle, { color: Colors.danger }]}>❌ Request Rejected</Text>
            <Text style={styles.desc}>{complaint.resolutionNote || 'No specific reason provided.'}</Text>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Status Timeline</Text>
          <View style={styles.timeline}>
            {flow.map((s, i) => (
              <View key={s} style={styles.timelineItem}>
                <View style={[styles.timelineDot, i <= currentIndex && styles.timelineDotActive, i > currentIndex && styles.timelineDotInactive]} />
                {i < flow.length - 1 && <View style={[styles.timelineLine, i < currentIndex && styles.timelineLineActive]} />}
                <Text style={[styles.timelineLabel, i > currentIndex && { color: Colors.border }, i === currentIndex && { color: Colors.primary, fontWeight: '700' }]}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Rating */}
        {complaint.status === 'Resolved' && !ratingDone && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⭐ Rate the Service</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity key={n} onPress={() => setRating(n)}>
                  <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={36} color={n <= rating ? '#f59e0b' : Colors.border} />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.input]}
              placeholder="Leave optional feedback..."
              placeholderTextColor={Colors.textMuted}
              value={feedback}
              onChangeText={setFeedback}
              multiline numberOfLines={3}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.submitBtn, !rating && { opacity: 0.5 }]}
              onPress={submitRating}
              disabled={!rating || ratingLoading}
            >
              {ratingLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Rating</Text>}
            </TouchableOpacity>
          </View>
        )}
        {ratingDone && complaint.rating && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⭐ Your Rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <Ionicons key={n} name={n <= complaint.rating ? 'star' : 'star-outline'} size={28} color={n <= complaint.rating ? '#f59e0b' : Colors.border} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Lightbox */}
      <Modal visible={!!lightbox} transparent animationType="fade">
        <TouchableOpacity style={styles.lightboxOverlay} onPress={() => setLightbox(null)} activeOpacity={1}>
          <Image source={{ uri: lightbox }} style={styles.lightboxImg} resizeMode="contain" />
          <TouchableOpacity style={styles.lightboxClose} onPress={() => setLightbox(null)}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.text, marginHorizontal: 12 },
  scroll: { padding: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  priorityText: { fontSize: 11, fontWeight: '700' },
  date: { marginLeft: 'auto', fontSize: 12, color: Colors.textMuted },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 10 },
  desc: { fontSize: 14, color: Colors.textMuted, lineHeight: 22 },
  aiBadge: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: '#f5f3ff', borderRadius: 10, padding: 10, marginTop: 12 },
  aiText: { flex: 1, fontSize: 12, color: '#7c3aed' },
  infoRow: { fontSize: 14, color: Colors.textMuted, marginBottom: 6 },
  infoLabel: { fontWeight: '700', color: Colors.text },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { backgroundColor: '#f1f5f9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  maintainerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  mAvatarText: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  mName: { fontWeight: '700', color: Colors.text, fontSize: 15 },
  mJob: { color: Colors.textMuted, fontSize: 13 },
  deadlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: '#fef2f2', borderRadius: 10, padding: 10 },
  deadlineText: { color: Colors.danger, fontSize: 13, fontWeight: '600' },
  photo: { width: 130, height: 130, borderRadius: 12, marginRight: 10 },
  timeline: { flexDirection: 'row', justifyContent: 'space-between' },
  timelineItem: { flex: 1, alignItems: 'center', position: 'relative' },
  timelineDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.primary, marginBottom: 6 },
  timelineDotActive: { backgroundColor: Colors.primary },
  timelineDotInactive: { backgroundColor: Colors.border },
  timelineLine: { position: 'absolute', top: 8, right: -'50%', width: '100%', height: 2, backgroundColor: Colors.border, zIndex: -1 },
  timelineLineActive: { backgroundColor: Colors.primary },
  timelineLabel: { fontSize: 10, fontWeight: '600', color: Colors.textMuted, textAlign: 'center' },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, padding: 12, fontSize: 14, color: Colors.text, marginBottom: 12, height: 80, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: Colors.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  lightboxOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  lightboxImg: { width: '100%', height: '80%' },
  lightboxClose: { position: 'absolute', top: 50, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8 },
});
