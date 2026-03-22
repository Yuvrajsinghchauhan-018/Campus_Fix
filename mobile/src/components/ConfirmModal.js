import React from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const ConfirmModal = ({ visible, title, message, onConfirm, onCancel, loading, danger = true }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={[styles.iconCircle, { backgroundColor: danger ? Colors.dangerLight : Colors.primaryLight }]}>
          <Ionicons name={danger ? 'trash' : 'checkmark-circle'} size={36} color={danger ? Colors.danger : Colors.primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: danger ? Colors.danger : Colors.primary }]}
          onPress={onConfirm}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>{danger ? 'Yes, Delete' : 'Confirm'}</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modal: { backgroundColor: '#fff', borderRadius: 28, padding: 28, width: '100%', maxWidth: 380, alignItems: 'center' },
  iconCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 10, textAlign: 'center' },
  message: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  confirmBtn: { width: '100%', padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 10 },
  confirmText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: { width: '100%', padding: 16, borderRadius: 16, alignItems: 'center', backgroundColor: '#f1f5f9' },
  cancelText: { color: Colors.textMuted, fontWeight: '700', fontSize: 15 },
});

export default ConfirmModal;
