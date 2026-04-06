import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';
import { Colors } from '../../theme/colors';

const JOB_TYPES = ['Electrician', 'Plumber', 'Lab Technician', 'AC Mechanic', 'Carpenter', 'Civil Worker', 'MTS', 'AMC', 'Peon'];

export default function AddMaintainerScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', phone: '', jobType: 'Electrician' });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      Alert.alert('Error', 'Name and phone are required.'); return;
    }
    setLoading(true);
    try {
      await api.post('/maintainers', form);
      setSuccess(true);
      setForm({ name: '', phone: '', jobType: 'Electrician' });
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || err?.response?.data?.message || 'Failed to create maintainer');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Maintainer</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Success overlay */}
        {success && (
          <View style={styles.successOverlay}>
            <View style={styles.successBox}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={56} color={Colors.success} />
              </View>
              <Text style={styles.successTitle}>Success!</Text>
              <Text style={styles.successMsg}>Maintainer has been successfully created and added to the database.</Text>
              <TouchableOpacity style={styles.continueBtn} onPress={() => setSuccess(false)}>
                <Text style={styles.continueBtnText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>Bypass pending approvals and directly provision field agents. Maintainer logs in via phone OTP.</Text>
          </View>

          <Label text="Full Name *" />
          <TextInput style={styles.input} placeholder="e.g., Ramesh Singh" placeholderTextColor={Colors.textMuted} value={form.name} onChangeText={v => update('name', v)} />

          <Label text="Secure Phone Number *" />
          <TextInput style={styles.input} placeholder="10-digit number used for authentication" placeholderTextColor={Colors.textMuted} value={form.phone} onChangeText={v => update('phone', v)} keyboardType="phone-pad" maxLength={10} />

          <Label text="Operative Domain *" />
          <View style={styles.chipGrid}>
            {JOB_TYPES.map(j => (
              <TouchableOpacity key={j} style={[styles.chip, form.jobType === j && styles.chipActive]} onPress={() => update('jobType', j)}>
                <Text style={[styles.chipText, form.jobType === j && styles.chipTextActive]}>{j}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="person-add" size={20} color="#fff" />
                <Text style={styles.submitText}>Add Maintainer</Text>
              </>
            )}
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
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  scroll: { padding: 16, paddingBottom: 40 },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: Colors.primaryLight, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#bfdbfe' },
  infoText: { flex: 1, fontSize: 13, color: Colors.primary, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.text, marginTop: 14, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, padding: 14, fontSize: 15, color: Colors.text },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff' },
  chipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: Colors.textMuted },
  chipTextActive: { color: Colors.primary },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.primary, padding: 18, borderRadius: 16, marginTop: 28 },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  // Success overlay
  successOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successBox: { backgroundColor: '#fff', borderRadius: 32, padding: 32, width: '100%', alignItems: 'center' },
  successIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.successLight, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 26, fontWeight: '900', color: Colors.text, marginBottom: 10 },
  successMsg: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  continueBtn: { width: '100%', backgroundColor: Colors.text, padding: 16, borderRadius: 16, alignItems: 'center' },
  continueBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
