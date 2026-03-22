import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusColors } from '../theme/colors';

const StatusBadge = ({ status }) => {
  const colors = StatusColors[status] || { bg: '#f1f5f9', text: '#475569' };
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default StatusBadge;
