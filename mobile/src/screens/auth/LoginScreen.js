import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../theme/colors';

const ROLES = [
  {
    key: 'student',
    label: 'Student',
    subtitle: 'Portal Access',
    icon: 'school-outline',
    accent: '#1d4ed8',
    soft: '#eef4ff',
    badge: '#ecfdf5',
  },
  {
    key: 'authority',
    label: 'Authority',
    subtitle: 'Admin Access',
    icon: 'shield-checkmark-outline',
    accent: '#0f766e',
    soft: '#edfdfa',
    badge: '#eff6ff',
  },
  {
    key: 'maintainer',
    label: 'Maintainer',
    subtitle: 'Staff Access',
    icon: 'construct-outline',
    accent: '#7c3aed',
    soft: '#f5f3ff',
    badge: '#fff7ed',
  },
];

const JOB_TYPES = ['Electrician', 'Plumber', 'Lab Technician', 'Printer Repair', 'AC Mechanic', 'Carpenter', 'Painter', 'Civil Worker', 'Sweeper', 'MTS', 'AMC', 'Peon'];
const FLOORS = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5', 'Floor 6'];
const RESPONSIBILITIES = ['Lab Management', 'Infrastructure'];
const BLOCKS = ['MSI', 'MSIT', 'MBA'];

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [role, setRole] = useState('student');
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [authSheetOpen, setAuthSheetOpen] = useState(false);
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    collegeId: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 'Male',
    jobType: 'Electrician',
    adminSecretKey: '',
    block: 'MSI',
    floors: [],
    responsibilities: [],
  });

  const activeRole = useMemo(
    () => ROLES.find((item) => item.key === role) || ROLES[0],
    [role]
  );

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const toggleArray = (key, item) => {
    setForm((current) => {
      const currentItems = current[key];
      return currentItems.includes(item)
        ? { ...current, [key]: currentItems.filter((value) => value !== item) }
        : { ...current, [key]: [...currentItems, item] };
    });
  };

  const validateForm = () => {
    if (tab === 'register') {
      if (!form.name || !form.phone) return 'Name and phone are required.';
      if (form.phone.length !== 10) return 'Phone number must be 10 digits.';

      if (role === 'authority') {
        if (!form.email || !form.adminSecretKey) return 'Email and admin secret key are required.';
        if (form.responsibilities.length === 0) return 'Select at least one responsibility.';
        if (form.floors.length === 0) return 'Select at least one floor.';
      } else if (role === 'student') {
        if (!form.email.toLowerCase().endsWith('@gmail.com')) return 'Please use a valid @gmail.com address.';
        if (form.password !== form.confirmPassword) return 'Passwords do not match.';
        if (form.password.length < 6) return 'Password must be at least 6 characters.';
      }
    } else {
      if (role === 'authority') {
        if (!form.email || !form.adminSecretKey) return 'Email and admin secret key are required.';
      } else if (role === 'student') {
        if (!form.email && !form.collegeId) return 'Enter your email or college ID.';
        if (!form.password) return 'Password is required.';
      } else if (role === 'maintainer') {
        if (!form.phone) return 'Phone number is required.';
        if (form.phone.length !== 10) return 'Phone number must be 10 digits.';
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Check Fields', validationError);
      return;
    }

    setLoading(true);
    setMsg('');

    try {
      if (tab === 'login') {
        const payload = { role };

        if (role === 'authority') {
          payload.email = form.email;
          payload.adminSecretKey = form.adminSecretKey;
        } else if (role === 'student') {
          payload.password = form.password;
          payload[form.email.includes('@') ? 'email' : 'collegeId'] = form.email || form.collegeId;
        } else {
          payload.phone = form.phone;
        }

        const response = await login(payload);
        if (!response.success) throw new Error(response.message);
      } else {
        const response = await register({ ...form, role: role.toLowerCase() });

        if (response.success || response.token) {
          if (role === 'maintainer') {
            setMsg(response.message || 'Registration successful. Your account is waiting for approval.');
            setShowSuccess(true);
          } else if (role !== 'authority') {
            Alert.alert('Success', 'Registration successful. Please sign in to continue.');
            setTab('login');
            updateForm('password', '');
            updateForm('confirmPassword', '');
          }
        }
      }
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (nextRole) => {
    setRole(nextRole);
    setTab('login');
    setShowPassword(false);
    setAuthSheetOpen(true);
  };

  const renderChipSelector = (title, items, selectedItems, onPress, multi = false) => (
    <View style={styles.selectorSection}>
      <Text style={styles.selectorTitle}>{title}</Text>
      <Text style={styles.selectorHint}>{multi ? 'You can choose more than one.' : 'Choose one option.'}</Text>
      <View style={styles.chipRow}>
        {items.map((item) => {
          const selected = Array.isArray(selectedItems) ? selectedItems.includes(item) : selectedItems === item;
          return (
            <TouchableOpacity
              key={item}
              style={[
                styles.choiceChip,
                selected && styles.choiceChipActive,
              ]}
              onPress={() => onPress(item)}
              activeOpacity={0.85}
            >
              <Text style={[styles.choiceChipText, selected && styles.choiceChipTextActive]}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderInput = (props) => (
    <TextInput
      {...props}
      style={[styles.input, props.style]}
      placeholderTextColor="#94a3b8"
      autoCorrect={false}
    />
  );

  const renderField = (label, props) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {renderInput(props)}
    </View>
  );

  if (showSuccess) {
    return (
      <SafeAreaView style={styles.successSafe}>
        <View style={styles.successWrap}>
          <View style={[styles.successIconWrap, { backgroundColor: activeRole.soft }]}>
            <Ionicons name="checkmark-circle" size={66} color={activeRole.accent} />
          </View>
          <Text style={styles.successTitle}>Request Sent</Text>
          <Text style={styles.successText}>{msg}</Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: activeRole.accent, width: '100%' }]}
            onPress={() => setShowSuccess(false)}
          >
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.backgroundOrbTop} />
      <View style={styles.backgroundOrbRight} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <View style={styles.brandLockup}>
              <View style={styles.brandLogoShell}>
                <Image source={require('../../../assets/msi_logo.png')} style={styles.brandLogo} />
              </View>
              <View>
                <Text style={styles.brandName}>CampusFix</Text>
                <Text style={styles.brandSub}>Maharaja Surajmal Institute</Text>
              </View>
            </View>
          </View>

          <View style={styles.hero}>
            <View style={[styles.systemBadge, { backgroundColor: activeRole.badge }]}>
              <View style={[styles.systemDot, { backgroundColor: activeRole.accent }]} />
              <Text style={styles.systemBadgeText}>Institutional Maintenance System</Text>
            </View>
            <Text style={styles.heroTitle}>
              The trusted platform for{'\n'}
              <Text style={styles.heroTitleAccent}>campus care.</Text>
            </Text>
            <Text style={styles.heroText}>
              Precision management for your academic and living environment.
            </Text>
          </View>

          <View style={styles.portalSection}>
            <TouchableOpacity
              style={[styles.primaryPortalCard, role === 'student' && styles.portalCardActive, { borderColor: role === 'student' ? ROLES[0].accent : '#eef2f7' }]}
              onPress={() => switchRole('student')}
              activeOpacity={0.92}
            >
              <View style={styles.portalLeft}>
                <View style={[styles.portalIconWrap, { backgroundColor: ROLES[0].soft }]}>
                  <Ionicons name={ROLES[0].icon} size={22} color={ROLES[0].accent} />
                </View>
                <View>
                  <Text style={styles.portalTitle}>Student</Text>
                  <Text style={styles.portalSubtitle}>Portal Access</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={18} color="#cbd5e1" />
            </TouchableOpacity>

            <View style={styles.secondaryPortalRow}>
              {ROLES.slice(1).map((item) => {
                const selected = role === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.secondaryPortalCard,
                      selected && { borderColor: item.accent, backgroundColor: item.soft },
                    ]}
                    onPress={() => switchRole(item.key)}
                    activeOpacity={0.92}
                  >
                    <View style={[styles.portalIconWrap, { backgroundColor: '#fff' }]}>
                      <Ionicons name={item.icon} size={21} color={item.accent} />
                    </View>
                    <Text style={styles.secondaryPortalTitle}>{item.label}</Text>
                    <Text style={styles.secondaryPortalSubtitle}>{item.subtitle}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Managed by Maharaja Surajmal Institute</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={authSheetOpen} transparent animationType="fade" onRequestClose={() => setAuthSheetOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalKeyboard}>
            <View
              style={[
                styles.authSheet,
                tab === 'register' ? styles.authSheetLarge : styles.authSheetCompact,
                role === 'authority' && tab === 'register' ? styles.authSheetAuthority : null,
              ]}
            >
              <View style={styles.sheetHandle} />
              <TouchableOpacity style={styles.sheetCloseButton} onPress={() => setAuthSheetOpen(false)}>
                <Ionicons name="close" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
              <View style={styles.sheetHeader}>
                <View style={styles.sheetHeadingBadge}>
                  <Ionicons name={activeRole.icon} size={15} color="#111827" />
                  <Text style={styles.sheetHeadingBadgeText}>
                    {tab === 'login' ? 'Portal Login' : 'Portal Registration'}
                  </Text>
                </View>
                <Text style={styles.sheetTitle}>
                  {role === 'student' ? 'Student Form' : role === 'authority' ? 'Authority Form' : 'Maintainer Form'}
                </Text>
                <Text style={styles.sheetSubtitle}>
                  {tab === 'login'
                    ? 'Login to continue.'
                    : 'Create your account to continue.'}
                </Text>
              </View>

              <ScrollView
                style={styles.sheetScroll}
                contentContainerStyle={styles.sheetScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                automaticallyAdjustKeyboardInsets
                bounces={false}
              >
                <View style={styles.tabContainer}>
                  {['login', 'register'].map((tabKey) => {
                    const selected = tab === tabKey;
                    return (
                      <TouchableOpacity
                        key={tabKey}
                        style={[
                          styles.tabButton,
                          selected && styles.tabButtonActive,
                        ]}
                        onPress={() => setTab(tabKey)}
                        activeOpacity={0.9}
                      >
                        <Text style={[styles.tabButtonText, selected && styles.tabButtonTextActive]}>
                          {tabKey === 'login' ? 'Sign In' : 'Register'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {tab === 'register' ? (
                  <View style={styles.formBlock}>
                    {renderField('Full Name', { placeholder: 'Full Name', value: form.name, onChangeText: (v) => updateForm('name', v) })}
                    {role === 'student' &&
                      renderField('College ID', {
                        placeholder: 'College ID',
                        value: form.collegeId,
                        onChangeText: (v) => updateForm('collegeId', v),
                        autoCapitalize: 'none',
                      })}
                    {renderField('Phone Number', {
                      placeholder: 'Phone Number',
                      value: form.phone,
                      onChangeText: (v) => updateForm('phone', v),
                      keyboardType: 'numeric',
                      maxLength: 10,
                    })}

                    {role === 'maintainer' &&
                      renderChipSelector('Work Category', JOB_TYPES, form.jobType, (item) => updateForm('jobType', item))}

                    {role === 'student' &&
                      renderChipSelector('Gender', ['Male', 'Female', 'Other'], form.gender, (item) => updateForm('gender', item))}

                    {role !== 'maintainer' &&
                      renderField(role === 'student' ? 'Gmail Address' : 'Email Address', {
                        placeholder: role === 'student' ? 'Valid @gmail.com' : 'Email Address',
                        value: form.email,
                        onChangeText: (v) => updateForm('email', v),
                        autoCapitalize: 'none',
                        keyboardType: 'email-address',
                      })}

                    {role === 'authority' && (
                      <>
                        <View style={styles.fieldGroup}>
                          <Text style={styles.fieldLabel}>Admin Secret Key</Text>
                          <View style={styles.passwordWrap}>
                            {renderInput({
                              style: styles.passwordInput,
                              placeholder: 'Admin Secret Key',
                              value: form.adminSecretKey,
                              onChangeText: (v) => updateForm('adminSecretKey', v),
                              secureTextEntry: !showPassword,
                            })}
                            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeButton}>
                              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {renderChipSelector('Block / Building', BLOCKS, form.block, (item) => updateForm('block', item))}
                        {renderChipSelector('Floors', FLOORS, form.floors, (item) => toggleArray('floors', item), true)}
                        {renderChipSelector('Responsibilities', RESPONSIBILITIES, form.responsibilities, (item) => toggleArray('responsibilities', item), true)}
                      </>
                    )}

                    {role === 'student' && (
                      <>
                        <View style={styles.fieldGroup}>
                          <Text style={styles.fieldLabel}>Password</Text>
                          <View style={styles.passwordWrap}>
                            {renderInput({
                              style: styles.passwordInput,
                              placeholder: 'Password',
                              value: form.password,
                              onChangeText: (v) => updateForm('password', v),
                              secureTextEntry: !showPassword,
                            })}
                            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeButton}>
                              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        {renderField('Confirm Password', {
                          placeholder: 'Confirm Password',
                          value: form.confirmPassword,
                          onChangeText: (v) => updateForm('confirmPassword', v),
                          secureTextEntry: true,
                        })}
                      </>
                    )}
                  </View>
                ) : (
                  <View style={styles.formBlock}>
                    {role !== 'maintainer' &&
                      renderField(role === 'student' ? 'Email or College ID' : 'Email Address', {
                        placeholder: role === 'student' ? 'Email or College ID' : 'Email Address',
                        value: form.email,
                        onChangeText: (v) => updateForm('email', v),
                        autoCapitalize: 'none',
                      })}

                    {role === 'maintainer' &&
                      renderField('Phone Number', {
                        placeholder: 'Registered Phone Number',
                        value: form.phone,
                        onChangeText: (v) => updateForm('phone', v),
                        keyboardType: 'numeric',
                        maxLength: 10,
                      })}

                    {role === 'authority' && (
                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Admin Secret Key</Text>
                        <View style={styles.passwordWrap}>
                          {renderInput({
                            style: styles.passwordInput,
                            placeholder: 'Admin Secret Key',
                            value: form.adminSecretKey,
                            onChangeText: (v) => updateForm('adminSecretKey', v),
                            secureTextEntry: !showPassword,
                          })}
                          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeButton}>
                            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {role === 'student' && (
                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Password</Text>
                        <View style={styles.passwordWrap}>
                          {renderInput({
                            style: styles.passwordInput,
                            placeholder: 'Password',
                            value: form.password,
                            onChangeText: (v) => updateForm('password', v),
                            secureTextEntry: !showPassword,
                          })}
                          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeButton}>
                            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>{tab === 'login' ? 'Continue' : 'Create Account'}</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#ffffff' },
  successSafe: { flex: 1, backgroundColor: '#ffffff' },
  container: { paddingHorizontal: 24, paddingTop: 6, paddingBottom: 40 },
  backgroundOrbTop: {
    position: 'absolute',
    top: -90,
    left: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'transparent',
  },
  backgroundOrbRight: {
    position: 'absolute',
    top: 160,
    right: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 34,
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  brandLogoShell: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5edf8',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  brandLogo: {
    width: 49,
    height: 49,
    resizeMode: 'contain',
  },
  brandName: {
    fontSize: 29,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -1,
  },
  brandSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  hero: {
    marginBottom: 30,
    alignItems: 'center',
  },
  systemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 24,
  },
  systemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  systemBadgeText: {
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '800',
    color: '#6b7280',
  },
  heroTitle: {
    fontSize: 42,
    lineHeight: 45,
    fontWeight: '900',
    textAlign: 'center',
    color: '#171717',
    letterSpacing: -2,
    marginBottom: 16,
  },
  heroTitleAccent: {
    fontStyle: 'italic',
  },
  heroText: {
    fontSize: 15,
    lineHeight: 25,
    color: '#5b6473',
    textAlign: 'center',
    maxWidth: 300,
  },
  portalSection: {
    marginBottom: 18,
  },
  primaryPortalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    padding: 22,
    borderWidth: 1.5,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
    elevation: 4,
  },
  portalCardActive: {
    transform: [{ scale: 0.995 }],
  },
  portalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  portalIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eef2f7',
  },
  portalTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: '#1f2937',
    letterSpacing: -0.8,
  },
  portalSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  secondaryPortalRow: {
    flexDirection: 'row',
    gap: 14,
  },
  secondaryPortalCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    minHeight: 174,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#eef2f7',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  secondaryPortalTitle: {
    marginTop: 20,
    fontSize: 21,
    fontWeight: '900',
    color: '#1f2937',
    letterSpacing: -0.8,
  },
  secondaryPortalSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
  },
  authSheet: {
    width: '92%',
    backgroundColor: '#ffffff',
    borderRadius: 32,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 6,
  },
  authSheetCompact: {
    minHeight: '52%',
    maxHeight: '68%',
  },
  authSheetLarge: {
    minHeight: '68%',
    maxHeight: '84%',
  },
  authSheetAuthority: {
    minHeight: '76%',
    maxHeight: '90%',
  },
  sheetHandle: {
    width: 58,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#d1d5db',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sheetCloseButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetHeadingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
    marginBottom: 12,
  },
  sheetHeadingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sheetKicker: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  sheetTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -1.4,
    textAlign: 'center',
    marginBottom: 8,
    width: '100%',
  },
  sheetSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 290,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 18,
    padding: 5,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#111111',
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748b',
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  formBlock: {
    marginBottom: 4,
    paddingBottom: 8,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    paddingLeft: 2,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600',
  },
  passwordWrap: {
    position: 'relative',
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 52,
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorSection: {
    marginBottom: 16,
  },
  selectorTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  selectorHint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  choiceChipActive: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  choiceChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4b5563',
  },
  choiceChipTextActive: {
    color: '#ffffff',
  },
  primaryButton: {
    marginTop: 12,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 18,
    paddingHorizontal: 12,
    opacity: 0.72,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalKeyboard: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  sheetScroll: {
    marginTop: 4,
    width: '100%',
  },
  sheetScrollContent: {
    paddingBottom: 28,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  successWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  successIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    lineHeight: 25,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 28,
  },
});
