import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Dimensions, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

const ROLES = [
  { key: 'student', label: 'Student', icon: 'person', color: '#2563eb', bg: '#eff6ff' },
  { key: 'authority', label: 'Authority', icon: 'shield', color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'maintainer', label: 'Maintainer', icon: 'construct', color: '#0891b2', bg: '#ecfeff' },
];

const JOB_TYPES = ['Electrician', 'Plumber', 'Lab Technician', 'AC Mechanic', 'Carpenter', 'Painter', 'Civil Worker', 'Sweeper', 'MTS', 'AMC', 'Peon'];
const FLOORS = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5', 'Floor 6'];
const RESPONSIBILITIES = ['Electrical', 'Plumbing', 'Lab Management', 'IT Systems', 'Infrastructure'];
const BLOCKS = ['MSI', 'MSIT', 'MBA'];

export default function LoginScreen({ navigation }) {
  const { login, register } = useAuth();
  const [role, setRole] = useState('student');
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', collegeId: '', phone: '', password: '', 
    confirmPassword: '', gender: 'Male', jobType: 'Electrician', 
    adminSecretKey: '', block: 'MSI', floors: [], responsibilities: []
  });

  const updateForm = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const toggleArray = (key, item) => {
    setForm(f => {
      const arr = f[key];
      if (arr.includes(item)) return { ...f, [key]: arr.filter(i => i !== item) };
      return { ...f, [key]: [...arr, item] };
    });
  };

  const validateForm = () => {
    if (tab === 'register') {
      if (!form.name || !form.phone) return "Name and Phone are required.";
      if (form.phone.length !== 10) return "Phone number must be 10 digits.";
      if (role === 'authority') {
        if (!form.email || !form.adminSecretKey) return "Email and Admin Secret Key are required.";
        if (form.responsibilities.length === 0) return "Select at least one responsibility.";
        if (form.floors.length === 0) return "Select at least one floor.";
      } else if (role === 'student') {
        if (!form.email.toLowerCase().endsWith('@gmail.com')) return "Please use a valid @gmail.com address.";
        if (form.password !== form.confirmPassword) return "Passwords do not match.";
        if (form.password.length < 6) return "Password must be at least 6 characters.";
      }
    } else {
      if (role === 'authority') {
        if (!form.email || !form.adminSecretKey) return "Email and Admin Secret Key required.";
      } else if (role === 'student') {
        if (!form.email && !form.collegeId) return "Email or College ID required.";
        if (!form.password) return "Password required.";
      } else if (role === 'maintainer') {
        if (!form.phone) return "Phone number required.";
        if (form.phone.length !== 10) return "Phone number must be 10 digits.";
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const err = validateForm();
    if (err) { Alert.alert('Check Fields', err); return; }

    setLoading(true); setMsg('');
    try {
      if (tab === 'login') {
        const p = { role };
        if (role === 'authority') { p.email = form.email; p.adminSecretKey = form.adminSecretKey; }
        else if (role === 'student') { p.password = form.password; p[form.email.includes('@') ? 'email' : 'collegeId'] = form.email || form.collegeId; }
        else { p.phone = form.phone; }
        const res = await login(p);
        if (!res.success) throw new Error(res.message);
      } else {
        const res = await register({ ...form, role: role.toLowerCase() });
        if (res.success || res.token) {
          if (role === 'maintainer') {
            setMsg(res.message || 'Registration successful! Your account is under review.');
            setShowSuccess(true);
          } else if (role !== 'authority') {
            Alert.alert('Success', 'Registration successful! Please login to continue.');
            setTab('login'); updateForm('password', ''); updateForm('confirmPassword', '');
          }
        }
      }
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || e.message || 'An error occurred');
    } finally { setLoading(false); }
  };

  const activeRole = ROLES.find(r => r.key === role);

  if (showSuccess) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, padding: 30, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: activeRole.bg, padding: 24, borderRadius: 28, marginBottom: 24 }}>
            <Ionicons name="checkmark-circle" size={70} color={activeRole.color} />
          </View>
          <Text style={{ fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 16, color: Colors.text }}>Under Review</Text>
          <Text style={{ fontSize: 16, textAlign: 'center', color: Colors.textMuted, lineHeight: 24, marginBottom: 36 }}>{msg}</Text>
          <TouchableOpacity style={[styles.submitBtn, { width: '100%', backgroundColor: activeRole.color, paddingVertical: 18 }]} onPress={() => setShowSuccess(false)}>
            <Text style={[styles.submitText, { fontSize: 18 }]}>Got It</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Decorative Background Bubbles */}
      <View style={[styles.bubble, { top: -60, left: -60, backgroundColor: 'rgba(37, 99, 235, 0.1)', width: 200, height: 200, borderRadius: 100 }]} />
      <View style={[styles.bubble, { top: 120, right: -80, backgroundColor: 'rgba(124, 58, 237, 0.08)', width: 250, height: 250, borderRadius: 125 }]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <Image source={require('../../../assets/msi_logo.png')} style={styles.headerLogo} />
            <View style={styles.logoRow}>
              <View style={[styles.logoDot, { backgroundColor: activeRole.color }]} />
              <Text style={styles.brand}>CampusFix</Text>
            </View>
            <Text style={styles.tagline}>Smart Campus, Seamless Maintenance</Text>
          </View>

          {/* Role Picker */}
          <View style={styles.roleWrapper}>
            <View style={styles.roleRow}>
              {ROLES.map(r => {
                const isActive = role === r.key;
                return (
                  <TouchableOpacity
                    key={r.key}
                    style={[styles.roleBtn, isActive && { backgroundColor: r.bg, borderColor: r.color }]}
                    onPress={() => { setRole(r.key); setTab('login'); }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={r.icon} size={18} color={isActive ? r.color : Colors.textMuted} />
                    <Text style={[styles.roleBtnText, isActive && { color: r.color }]}>{r.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Form Card */}
          <View style={[styles.card, { borderColor: activeRole.color, shadowColor: activeRole.color }]}>
            <Text style={styles.cardTitle}>
              {role === 'authority' ? 'Authority Access' : role === 'student' ? 'Student Portal' : 'Maintainer Portal'}
            </Text>

            {/* Login / Register Toggle */}
            <View style={styles.tabContainer}>
              <TouchableOpacity style={[styles.tabBtn, tab === 'login' && [styles.tabActive, { backgroundColor: activeRole.color }]]} onPress={() => setTab('login')}>
                <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tabBtn, tab === 'register' && [styles.tabActive, { backgroundColor: activeRole.color }]]} onPress={() => setTab('register')}>
                <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>Register</Text>
              </TouchableOpacity>
            </View>

            {tab === 'register' ? (
              <View style={styles.formSpace}>
                <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={Colors.textMuted} value={form.name} onChangeText={v => updateForm('name', v)} />
                {role === 'student' && <TextInput style={styles.input} placeholder="College ID" autoCapitalize="none" placeholderTextColor={Colors.textMuted} value={form.collegeId} onChangeText={v => updateForm('collegeId', v)} />}
                <TextInput style={styles.input} placeholder="Phone Number" keyboardType="numeric" maxLength={10} placeholderTextColor={Colors.textMuted} value={form.phone} onChangeText={v => updateForm('phone', v)} />

                {role === 'maintainer' && (
                  <View style={styles.pickerSection}>
                    <Text style={styles.pickerTitle}>Job Type:</Text>
                    <View style={styles.chipRow}>
                      {JOB_TYPES.map(j => (
                        <TouchableOpacity key={j} style={[styles.chip, form.jobType === j && [styles.chipActive, { backgroundColor: activeRole.color, borderColor: activeRole.color }]]} onPress={() => updateForm('jobType', j)}>
                          <Text style={[styles.chipText, form.jobType === j && styles.chipTextActive]}>{j}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {role === 'student' && (
                  <View style={styles.pickerSection}>
                    <Text style={styles.pickerTitle}>Gender:</Text>
                    <View style={styles.chipRow}>
                      {['Male', 'Female', 'Other'].map(g => (
                        <TouchableOpacity key={g} style={[styles.chip, form.gender === g && [styles.chipActive, { backgroundColor: activeRole.color, borderColor: activeRole.color }]]} onPress={() => updateForm('gender', g)}>
                          <Text style={[styles.chipText, form.gender === g && styles.chipTextActive]}>{g}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {role !== 'maintainer' && <TextInput style={styles.input} placeholder={role === 'student' ? "Valid @gmail.com" : "Email Address"} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={Colors.textMuted} value={form.email} onChangeText={v => updateForm('email', v)} />}

                {role === 'authority' && (
                  <>
                    <View style={styles.passwordRow}>
                      <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Admin Secret Key" placeholderTextColor={Colors.textMuted} value={form.adminSecretKey} onChangeText={v => updateForm('adminSecretKey', v)} secureTextEntry={!showPassword} />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                        <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.pickerSection}>
                      <Text style={styles.pickerTitle}>Block / Building:</Text>
                      <View style={styles.chipRow}>
                        {BLOCKS.map(b => (
                          <TouchableOpacity key={b} style={[styles.chip, form.block === b && [styles.chipActive, { backgroundColor: activeRole.color, borderColor: activeRole.color }]]} onPress={() => updateForm('block', b)}>
                            <Text style={[styles.chipText, form.block === b && styles.chipTextActive]}>{b}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.pickerSection}>
                      <Text style={styles.pickerTitle}>Floors (Select Multiple):</Text>
                      <View style={styles.chipRow}>
                        {FLOORS.map(fl => (
                          <TouchableOpacity key={fl} style={[styles.chip, form.floors.includes(fl) && [styles.chipActive, { backgroundColor: activeRole.color, borderColor: activeRole.color }]]} onPress={() => toggleArray('floors', fl)}>
                            <Text style={[styles.chipText, form.floors.includes(fl) && styles.chipTextActive]}>{fl}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.pickerSection}>
                      <Text style={styles.pickerTitle}>Responsibilities:</Text>
                      <View style={styles.chipRow}>
                        {RESPONSIBILITIES.map(resp => (
                          <TouchableOpacity key={resp} style={[styles.chip, form.responsibilities.includes(resp) && [styles.chipActive, { backgroundColor: activeRole.color, borderColor: activeRole.color }]]} onPress={() => toggleArray('responsibilities', resp)}>
                            <Text style={[styles.chipText, form.responsibilities.includes(resp) && styles.chipTextActive]}>{resp}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </>
                )}

                {role === 'student' && (
                  <>
                    <View style={styles.passwordRow}>
                      <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Password" placeholderTextColor={Colors.textMuted} value={form.password} onChangeText={v => updateForm('password', v)} secureTextEntry={!showPassword} />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                        <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                    <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor={Colors.textMuted} value={form.confirmPassword} onChangeText={v => updateForm('confirmPassword', v)} secureTextEntry />
                  </>
                )}
              </View>
            ) : (
              // LOGIN FORM
              <View style={styles.formSpace}>
                {role !== 'maintainer' && (
                  <TextInput style={styles.input} placeholder={role === 'student' ? "Email or College ID" : "Email Address"} autoCapitalize="none" placeholderTextColor={Colors.textMuted} value={form.email} onChangeText={v => updateForm('email', v)} />
                )}

                {role === 'maintainer' && (
                  <TextInput style={styles.input} placeholder="Registered Phone Number" keyboardType="numeric" maxLength={10} placeholderTextColor={Colors.textMuted} value={form.phone} onChangeText={v => updateForm('phone', v)} />
                )}

                {role === 'authority' && (
                  <View style={styles.passwordRow}>
                    <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Admin Secret Key" placeholderTextColor={Colors.textMuted} value={form.adminSecretKey} onChangeText={v => updateForm('adminSecretKey', v)} secureTextEntry={!showPassword} />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                      <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                )}

                {role === 'student' && (
                  <View style={styles.passwordRow}>
                    <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Password" placeholderTextColor={Colors.textMuted} value={form.password} onChangeText={v => updateForm('password', v)} secureTextEntry={!showPassword} />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                      <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: activeRole.color, shadowColor: activeRole.color }]} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.submitText}>{tab === 'login' ? 'Continue Access ➔' : 'Create Account ➔'}</Text>
              )}
            </TouchableOpacity>

          </View>
          
          {/* Branding */}
          <View style={styles.branding}>
            <Text style={styles.brandingText}>Managed by Maharaja Surajmal Institute</Text>
            <Text style={styles.versionText}>v2.1.0 • Stable</Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fdfdfd' },
  bubble: { position: 'absolute' },
  container: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 60 },
  header: { alignItems: 'flex-start', marginBottom: 30, paddingLeft: 6 },
  headerLogo: { width: 50, height: 50, borderRadius: 10, marginBottom: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  logoDot: { width: 14, height: 14, borderRadius: 7 },
  brand: { fontSize: 32, fontWeight: '900', color: '#1e293b', letterSpacing: -1 },
  tagline: { fontSize: 15, color: '#64748b', fontWeight: '500' },
  roleWrapper: { marginBottom: 20 },
  roleRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18, padding: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  roleBtn: { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: 'transparent' },
  roleBtnText: { fontSize: 11, fontWeight: '800', color: Colors.textMuted, marginTop: 4, letterSpacing: 0.5 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, paddingBottom: 32, borderWidth: 1, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 8 },
  cardTitle: { fontSize: 22, fontWeight: '900', color: Colors.text, marginBottom: 20, textAlign: 'center', letterSpacing: -0.5 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 14, padding: 4, marginBottom: 24 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  tabActive: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '800', color: '#64748b', letterSpacing: 0.5 },
  tabTextActive: { color: '#fff' },
  formSpace: { marginBottom: 16 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16, fontSize: 15, color: Colors.text, marginBottom: 14, fontWeight: '600' },
  passwordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  eyeBtn: { padding: 14, position: 'absolute', right: 0 },
  submitBtn: { padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 6 },
  submitText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  pickerSection: { marginBottom: 18, marginTop: 4 },
  pickerTitle: { fontSize: 11, fontWeight: '800', color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  chipActive: { },
  chipText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  chipTextActive: { color: '#fff' },
  branding: { marginTop: 40, alignItems: 'center', opacity: 0.5, paddingBottom: 20 },
  brandingText: { fontSize: 11, fontWeight: '700', color: Colors.text, textTransform: 'uppercase', letterSpacing: 1 },
  versionText: { fontSize: 10, color: Colors.textMuted, marginTop: 4 },
});
