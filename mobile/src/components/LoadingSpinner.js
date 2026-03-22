import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

const LoadingSpinner = ({ fullScreen = false }) => (
  <View style={[styles.container, fullScreen && styles.fullScreen]}>
    <ActivityIndicator size="large" color={Colors.primary} />
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 40, justifyContent: 'center', alignItems: 'center' },
  fullScreen: { flex: 1 },
});

export default LoadingSpinner;
