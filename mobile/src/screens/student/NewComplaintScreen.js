import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../api/axios';
import { Colors } from '../../theme/colors';

const BLOCKS = ['MSI', 'MSIT', 'MBA'];
const LOCATION_TYPES = ['Classroom', 'Lab', 'Corridor', 'Washroom', 'Staff Room', 'Common Area'];

const FLOORS = [1, 2, 3, 4, 5, 6, 7];

const DYNAMIC_ISSUES = {
  Classroom: ['Projector', 'Fan', 'AC', 'Lights', 'Benches/Desks', 'Board'],
  Lab: ['Computers', 'Keyboards', 'Mouse', 'Printers', 'Projector', 'AC', 'Fans', 'Electrical Points', 'Desks'],
  Corridor: ['Lights', 'CCTV', 'Cleanliness', 'Electrical'],
  Washroom: ['Water Supply', 'Flush', 'Cleanliness', 'Broken Fixtures'],
  'Staff Room': ['AC', 'Furniture', 'Electrical', 'Internet', 'Printers'],
  'Common Area': ['Lights', 'Cleanliness', 'Furniture']
};
const LAB_COMPUTER_RELATED_ISSUES = ['Computers', 'Keyboards', 'Mouse'];

export default function NewComplaintScreen({ navigation }) {
  const [form, setForm] = useState({
    title: '', description: '',
    locationType: 'Classroom', roomNumber: '', block: 'MSI', floor: '1', issues: [],
    computerNumber: '', printerNumber: ''
  });
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (key, val) => {
    if (key === 'locationType') {
      setForm(f => ({ ...f, locationType: val, issues: [] }));
    } else {
      setForm(f => ({ ...f, [key]: val }));
    }
  };

  const toggleIssue = (issue) => {
    setForm(f => {
      const arr = f.issues || [];
      const newIssues = arr.includes(issue) ? arr.filter(i => i !== issue) : [...arr, issue];
      const hasComputerRelatedIssue = LAB_COMPUTER_RELATED_ISSUES.some(item => newIssues.includes(item));
      return {
        ...f,
        issues: newIssues,
        computerNumber: hasComputerRelatedIssue ? f.computerNumber : '',
        printerNumber: newIssues.includes('Printers') ? f.printerNumber : '',
      };
    });
  };

  const pickImage = async (useCamera) => {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') { Alert.alert('Permission needed'); return; }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsMultipleSelection: true, mediaTypes: ImagePicker.MediaTypeOptions.Images });

    if (!result.canceled) {
      const chosen = result.assets.slice(0, 3 - photos.length);
      setPhotos(prev => [...prev, ...chosen].slice(0, 3));
    }
  };

  const removePhoto = (idx) => setPhotos(p => p.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Please enter a title.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const data = new FormData();
      Object.keys(form).forEach(k => {
        if (k === 'issues') {
           form.issues.forEach(iss => data.append('issues', iss));
        } else {
           data.append(k, form[k]);
        }
      });
      photos.forEach((photo, i) => {
        data.append('photos', {
          uri: photo.uri,
          name: `photo_${i}.jpg`,
          type: 'image/jpeg',
        });
      });
      const res = await api.post('/complaints', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) {
        Alert.alert('Success! 🎉', 'Your complaint has been submitted. Our AI is analyzing it.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report an Issue</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* AI Badge */}
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={16} color="#7c3aed" />
            <Text style={styles.aiText}>AI will auto-categorize and prioritize your complaint</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Title */}
          <Label text="Issue Title" />
          <TextInput style={styles.input} placeholder="e.g., Broken AC in Room 101"
            placeholderTextColor={Colors.textMuted} value={form.title} onChangeText={v => update('title', v)} />

          {/* Description */}
          <Label text="Description" />
          <TextInput style={[styles.input, styles.textarea]} placeholder="Describe the issue in detail (optional)..."
            placeholderTextColor={Colors.textMuted} value={form.description} onChangeText={v => update('description', v)}
            multiline numberOfLines={4} textAlignVertical="top" />

          {/* Block */}
          <Label text="Block / Building" />
          <View style={styles.chipRow}>
            {BLOCKS.map(b => (
              <TouchableOpacity key={b} style={[styles.chip, form.block === b && styles.chipActive]} onPress={() => update('block', b)}>
                <Text style={[styles.chipText, form.block === b && styles.chipTextActive]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Floor */}
          <Label text="Floor" />
          <View style={styles.chipRow}>
            {FLOORS.map(f => (
              <TouchableOpacity key={f} style={[styles.chip, form.floor === String(f) && styles.chipActive]} onPress={() => update('floor', String(f))}>
                <Text style={[styles.chipText, form.floor === String(f) && styles.chipTextActive]}>Floor {f}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Location Type */}
          <Label text="Location Type" />
          <View style={styles.chipRow}>
            {LOCATION_TYPES.map(t => (
              <TouchableOpacity key={t} style={[styles.chip, form.locationType === t && styles.chipActive]} onPress={() => update('locationType', t)}>
                <Text style={[styles.chipText, form.locationType === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Room / Lab Number */}
          <Label text={form.locationType === 'Lab' ? 'Lab Number' : 'Room Number'} />
          <TextInput style={styles.input} placeholder={form.locationType === 'Lab' ? 'e.g., Computer Lab 2' : 'e.g., 101'}
            placeholderTextColor={Colors.textMuted} value={form.roomNumber} onChangeText={v => update('roomNumber', v)} />

          {/* Dynamic Issues Based on Location */}
          {form.locationType && DYNAMIC_ISSUES[form.locationType] && (
            <>
              <Label text={`What's wrong in the ${form.locationType}? (Select all that apply)`} />
              <View style={styles.chipRow}>
                {DYNAMIC_ISSUES[form.locationType].map(issue => {
                  const isSelected = form.issues.includes(issue);
                  return (
                    <TouchableOpacity key={issue} style={[styles.chip, styles.issueChip, isSelected && styles.issueChipActive]} onPress={() => toggleIssue(issue)}>
                      <Text style={[styles.chipText, isSelected && styles.issueChipTextActive]}>+ {issue}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Conditional Item Number Fields (Lab only) */}
          {form.locationType === 'Lab' && (
            <>
              {LAB_COMPUTER_RELATED_ISSUES.some(issue => form.issues.includes(issue)) && (
                <>
                  <Label text="Computer Number (written at the back of your screen)" />
                  <TextInput style={styles.input} placeholder="e.g., PC-01" placeholderTextColor={Colors.textMuted}
                    value={form.computerNumber} onChangeText={v => update('computerNumber', v)} />
                </>
              )}
              {form.issues.includes('Printers') && (
                <>
                  <Label text="Printer Number" />
                  <TextInput style={styles.input} placeholder="e.g., PRN-01" placeholderTextColor={Colors.textMuted}
                    value={form.printerNumber} onChangeText={v => update('printerNumber', v)} />
                </>
              )}
            </>
          )}

          {/* Photos */}
          <Label text={`Supporting Photos (${photos.length}/3)`} />
          <View style={styles.photoRow}>
            <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(true)}>
              <Ionicons name="camera" size={24} color={Colors.primary} />
              <Text style={styles.photoBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(false)}>
              <Ionicons name="images" size={24} color="#7c3aed" />
              <Text style={styles.photoBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>
          {photos.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
              {photos.map((p, i) => (
                <View key={i} style={styles.photoThumb}>
                  <Image source={{ uri: p.uri }} style={styles.thumbImg} />
                  <TouchableOpacity style={styles.removePhoto} onPress={() => removePhoto(i)}>
                    <Ionicons name="close" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Submit */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.submitText}>Submit Complaint</Text>
                </>
            }
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const Label = ({ text }) => <Text style={styles.label}>{text}</Text>;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  scroll: { padding: 16, paddingBottom: 40 },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f5f3ff', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#ddd6fe' },
  aiText: { flex: 1, fontSize: 13, color: '#7c3aed', fontWeight: '600' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.dangerLight, borderRadius: 10, padding: 12, marginBottom: 14, borderLeftWidth: 4, borderLeftColor: Colors.danger },
  errorText: { color: Colors.danger, fontSize: 13, flex: 1 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 8, marginTop: 14 },
  input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, padding: 14, fontSize: 15, color: Colors.text },
  textarea: { height: 110, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff' },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: Colors.textMuted },
  chipTextActive: { color: '#fff' },
  issueChip: { backgroundColor: '#f8fafc', borderColor: '#cbd5e1', borderRadius: 20 },
  issueChipActive: { backgroundColor: '#e0e7ff', borderColor: '#6366f1' },
  issueChipTextActive: { color: '#4f46e5' },
  photoRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  photoBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.border, backgroundColor: '#fff' },
  photoBtnText: { fontSize: 13, fontWeight: '700', color: Colors.textMuted },
  photoThumb: { width: 80, height: 80, borderRadius: 10, marginRight: 8, overflow: 'hidden', position: 'relative' },
  thumbImg: { width: '100%', height: '100%' },
  removePhoto: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 10, padding: 3 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.primary, padding: 18, borderRadius: 16, marginTop: 24 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
