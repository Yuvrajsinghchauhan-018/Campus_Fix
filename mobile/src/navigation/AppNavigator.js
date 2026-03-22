import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';

// Student Screens
import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
import NewComplaintScreen from '../screens/student/NewComplaintScreen';
import ComplaintHistoryScreen from '../screens/student/ComplaintHistoryScreen';
import ComplaintDetailScreen from '../screens/student/ComplaintDetailScreen';

// Maintainer Screens
import MaintainerDashboardScreen from '../screens/maintainer/MaintainerDashboardScreen';
import TaskDetailScreen from '../screens/maintainer/TaskDetailScreen';

// Authority Screens
import AuthorityDashboardScreen from '../screens/authority/AuthorityDashboardScreen';
import ComplaintsQueueScreen from '../screens/authority/ComplaintsQueueScreen';
import MaintainerApprovalsScreen from '../screens/authority/MaintainerApprovalsScreen';
import ManageMaintainersScreen from '../screens/authority/ManageMaintainersScreen';
import AddMaintainerScreen from '../screens/authority/AddMaintainerScreen';
import PDFReportsScreen from '../screens/authority/PDFReportsScreen';
import QRGeneratorScreen from '../screens/authority/QRGeneratorScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

const StudentStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StudentDashboard" component={StudentDashboardScreen} />
    <Stack.Screen name="NewComplaint" component={NewComplaintScreen} />
    <Stack.Screen name="ComplaintHistory" component={ComplaintHistoryScreen} />
    <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} />
  </Stack.Navigator>
);

const MaintainerStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MaintainerDashboard" component={MaintainerDashboardScreen} />
    <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
  </Stack.Navigator>
);

const AuthorityStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AuthorityDashboard" component={AuthorityDashboardScreen} />
    <Stack.Screen name="ComplaintsQueue" component={ComplaintsQueueScreen} />
    <Stack.Screen name="MaintainerApprovals" component={MaintainerApprovalsScreen} />
    <Stack.Screen name="ManageMaintainers" component={ManageMaintainersScreen} />
    <Stack.Screen name="AddMaintainer" component={AddMaintainerScreen} />
    <Stack.Screen name="PDFReports" component={PDFReportsScreen} />
    <Stack.Screen name="QRGenerator" component={QRGeneratorScreen} />
  </Stack.Navigator>
);

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  const getStack = () => {
    if (!user) return <AuthStack />;
    if (user.role === 'student') return <StudentStack />;
    if (user.role === 'maintainer') return <MaintainerStack />;
    if (user.role === 'authority') return <AuthorityStack />;
    return <AuthStack />;
  };

  return (
    <NavigationContainer>
      {getStack()}
    </NavigationContainer>
  );
}
