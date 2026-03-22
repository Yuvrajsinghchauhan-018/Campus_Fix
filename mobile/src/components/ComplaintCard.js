import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import StatusBadge from './StatusBadge';

const ComplaintCard = ({ complaint, onPress }) => {
  const c = complaint;
  const date = new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.row}>
        <StatusBadge status={c.status} />
        <Text style={styles.date}>{date}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>{c.title}</Text>
      {c.categories && c.categories.length > 0 && (
        <View style={styles.tags}>
          {c.categories.slice(0, 3).map((cat) => (
            <View key={cat} style={styles.tag}>
              <Text style={styles.tagText}>{cat}</Text>
            </View>
          ))}
        </View>
      )}
      {(c.block || c.floor || c.roomNumber) && (
        <Text style={styles.location}>
          📍 {[c.block, c.floor && `Floor ${c.floor}`, c.roomNumber].filter(Boolean).join(' · ')}
        </Text>
      )}
      {c.priority && (
        <Text style={[styles.priority, { color: c.priority === 'High' ? Colors.danger : c.priority === 'Medium' ? Colors.orange : Colors.textMuted }]}>
          ⚡ {c.priority} Priority
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  date: { fontSize: 12, color: Colors.textMuted },
  title: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 8, lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  tag: { backgroundColor: '#f1f5f9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  location: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  priority: { fontSize: 12, fontWeight: '700', marginTop: 6 },
});

export default ComplaintCard;
