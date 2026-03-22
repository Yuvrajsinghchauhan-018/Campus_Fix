import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Image, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api, { STATIC_BASE_URL } from '../../api/axios';
import { useSocket } from '../../hooks/useSocket';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Colors } from '../../theme/colors';

const getImageUrl = (url) => url?.startsWith('/uploads/') ? `${STATIC_BASE_URL}${url}` : url;

export default function TaskDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useSocket('complaint_update', () => setRefresh(p => p + 1));

  const fetchTask = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.data.success) setTask(res.data.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTask(); }, [id, refresh]);

  const handleStatusUpdate = async (newStatus) => {
    setSubmitting(true);
    try {
      await api.patch(`/complaints/${id}/status`, { status: newStatus });
      fetchTask();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update status');
    } finally { setSubmitting(false); }
  };

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') { Alert.alert('Permission needed'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true });
    if (!result.canceled) setPhoto(result.assets[0]);
  };

  const handleResolve = async () => {
    if (!photo) { Alert.alert('Required', 'Please attach a completion photo.'); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('resolutionNote', note);
      formData.append('completionPhoto', {
        uri: photo.uri, name: 'completion.jpg', type: 'image/jpeg',
      });
      await api.patch(`/complaints/${id}/resolve`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert('✅ Task Resolved!', 'Great job! The task has been marked as resolved.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to resolve task');
    } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!task) return (
    <SafeAreaView style={styles.safe}><Text style={{ textAlign: 'center', marginTop: 40 }}>Task not found</Text></SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{task.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Status & Info */}
        <View style={styles.card}>
          <View style={styles.row}>
            <StatusBadge status={task.status} />
            {task.priority && <Text style={[styles.priority, { color: task.priority === 'Urgent' ? Colors.danger : Colors.orange }]}>⚡ {task.priority}</Text>}
          </View>
          <Text style={styles.titleText}>{task.title}</Text>
          <Text style={styles.location}>📍 Room {task.roomNumber}, Block {task.block}, Floor {task.floor}</Text>
          {task.deadline && (
            <View style={styles.deadlineBadge}>
              <Ionicons name="time" size={14} color={Colors.danger} />
              <Text style={styles.deadlineText}>SLA Due: {new Date(task.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Description</Text>
          <Text style={styles.desc}>{task.description}</Text>
        </View>

        {/* Student Photos */}
        {task.photos?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📷 Student Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {task.photos.map((url, i) => (
                <Image key={i} source={{ uri: getImageUrl(url) }} style={styles.photo} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Actions */}
        {task.status === 'Assigned' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#f97316' }]}
            onPress={() => handleStatusUpdate('In Progress')}
            disabled={submitting}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="play-circle" size={20} color="#fff" />
                <Text style={styles.actionText}>Start Job (Mark In Progress)</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {task.status === 'In Progress' && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { color: Colors.success }]}>✅ Complete This Job</Text>

            <Text style={styles.fieldLabel}>Resolution Note</Text>
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              placeholder="Describe what was done (e.g., Replaced faulty wiring)..."
              placeholderTextColor={Colors.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
            />

            <Text style={styles.fieldLabel}>Completion Photo (Required)</Text>
            {!photo ? (
              <TouchableOpacity style={styles.photoPicker} onPress={pickPhoto}>
                <Ionicons name="camera" size={28} color={Colors.success} />
                <Text style={styles.photoPickerText}>Take Completion Photo</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photo.uri }} style={{ width: '100%', height: 200, borderRadius: 12 }} resizeMode="cover" />
                <TouchableOpacity style={styles.removePhotoBtn} onPress={() => setPhoto(null)}>
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.success, marginTop: 16 }]}
              onPress={handleResolve}
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.actionText}>Submit & Mark Resolved</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {task.status === 'Resolved' && (
          <View style={[styles.card, { borderTopWidth: 4, borderTopColor: Colors.success }]}>
            <Text style={[styles.cardTitle, { color: Colors.success }]}>✅ Task Resolved</Text>
            <Text style={styles.desc}>{task.resolutionNote || 'Resolved successfully.'}</Text>
            {task.completionPhoto && (
              <Image source={{ uri: getImageUrl(task.completionPhoto) }} style={{ marginTop: 12, width: '100%', height: 180, borderRadius: 12 }} resizeMode="cover" />
            )}
            {task.rating && (
              <View style={{ flexDirection: 'row', marginTop: 12, gap: 4 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <Ionicons key={n} name={n <= task.rating ? 'star' : 'star-outline'} size={22} color="#f59e0b" />
                ))}
                <Text style={{ marginLeft: 8, color: Colors.textMuted, fontSize: 13 }}>Student rating</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.text, marginHorizontal: 12 },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: Colors.border },
  row: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'center' },
  priority: { fontSize: 12, fontWeight: '700' },
  titleText: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  location: { fontSize: 13, color: Colors.textMuted, marginBottom: 8 },
  deadlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef2f2', borderRadius: 10, padding: 10, marginTop: 4 },
  deadlineText: { color: Colors.danger, fontSize: 13, fontWeight: '600' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  desc: { fontSize: 14, color: Colors.textMuted, lineHeight: 22 },
  photo: { width: 120, height: 120, borderRadius: 12, marginRight: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 18, borderRadius: 16, marginBottom: 14 },
  actionText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.text, marginTop: 14, marginBottom: 8 },
  input: { backgroundColor: Colors.bg, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, padding: 14, fontSize: 14, color: Colors.text },
  photoPicker: { borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.success, borderRadius: 14, padding: 28, alignItems: 'center', gap: 8, backgroundColor: '#f0fdf4' },
  photoPickerText: { color: Colors.success, fontWeight: '700' },
  photoPreview: { borderRadius: 12, overflow: 'hidden', position: 'relative' },
  removePhotoBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 16, padding: 6 },
});
