import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import api from '../../api/axios';

export default function QRGeneratorScreen({ navigation }) {
  const [roomData, setRoomData] = useState({ roomNumber: '', block: '', floor: '' });
  const [qrCode, setQrCode] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!roomData.roomNumber || !roomData.block || !roomData.floor) {
      Alert.alert('Error', 'Fill in all three fields.'); return;
    }
    setGenerating(true);
    try {
      const res = await api.post('/analytics/qr', roomData);
      if (res.data.success) {
        setQrCode(res.data.data.qrCodeDataUrl);
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'QR generation failed');
    } finally { setGenerating(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Generate Room QR Map</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔍 Room Query Details</Text>

          <Text style={styles.label}>Room Number</Text>
          <TextInput style={styles.input} placeholder="e.g. 101" placeholderTextColor={Colors.textMuted}
            value={roomData.roomNumber} onChangeText={v => setRoomData(d => ({ ...d, roomNumber: v }))} />

          <Text style={styles.label}>Block</Text>
          <TextInput style={styles.input} placeholder="e.g. A" placeholderTextColor={Colors.textMuted}
            value={roomData.block} onChangeText={v => setRoomData(d => ({ ...d, block: v }))} />

          <Text style={styles.label}>Floor</Text>
          <TextInput style={styles.input} placeholder="e.g. 1" placeholderTextColor={Colors.textMuted}
            value={roomData.floor} onChangeText={v => setRoomData(d => ({ ...d, floor: v }))} keyboardType="numeric" />

          <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} disabled={generating}>
            {generating ? <ActivityIndicator color="#fff" /> : (
              <><Ionicons name="qr-code" size={20} color="#fff" /><Text style={styles.generateText}>Generate Assignment QR</Text></>
            )}
          </TouchableOpacity>
        </View>

        {/* QR Display */}
        <View style={[styles.card, { alignItems: 'center', minHeight: 260, justifyContent: 'center' }]}>
          {qrCode ? (
            <>
              <View style={styles.qrBox}>
                <Image source={{ uri: qrCode }} style={styles.qrImage} resizeMode="contain" />
              </View>
              <Text style={styles.qrRoomTitle}>Room Node: {roomData.roomNumber}</Text>
              <Text style={styles.qrRoomSub}>Block {roomData.block}, Floor {roomData.floor}</Text>
              <View style={styles.downloadHint}>
                <Ionicons name="information-circle" size={14} color={Colors.primary} />
                <Text style={styles.downloadHintText}>Save screenshot to print and place in the room.</Text>
              </View>
            </>
          ) : (
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code" size={64} color="#cbd5e1" />
              <Text style={styles.qrPlaceholderText}>Input room details above to mint a static QR map point. Placing these helps precise location reporting.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: Colors.bg, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, padding: 14, fontSize: 15, color: Colors.text },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.primary, padding: 16, borderRadius: 14, marginTop: 20 },
  generateText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  qrBox: { backgroundColor: '#fff', padding: 14, borderRadius: 16, borderWidth: 2, borderColor: Colors.border, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  qrImage: { width: 200, height: 200 },
  qrRoomTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  qrRoomSub: { fontSize: 13, color: Colors.textMuted, marginBottom: 16 },
  downloadHint: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryLight, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  downloadHintText: { fontSize: 12, color: Colors.primary, fontWeight: '600', flex: 1 },
  qrPlaceholder: { alignItems: 'center', padding: 24, backgroundColor: Colors.bg, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed', gap: 14 },
  qrPlaceholderText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, maxWidth: 260 },
});
