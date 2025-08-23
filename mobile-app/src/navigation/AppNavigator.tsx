import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main App Navigation
import MainTabNavigator from './MainTabNavigator';

export type RootStackParamList = {
  // Auth Stack
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  
  // Main App
  MainTabs: undefined;
  
  // Modal Screens
  ScriptDetails: { scriptId: string };
  ExamDetails: { examId: string };
  IncidentDetails: { incidentId: string };
  QRScanner: undefined;
  CreateIncident: { scriptId?: string; examId?: string };
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </Stack.Group>
        ) : (
          // Main App Stack
          <Stack.Group>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            
            {/* Modal Screens */}
            <Stack.Group screenOptions={{ presentation: 'modal', headerShown: true }}>
              <Stack.Screen 
                name="ScriptDetails" 
                component={ScriptDetailsScreen}
                options={{ title: 'Script Details' }}
              />
              <Stack.Screen 
                name="ExamDetails" 
                component={ExamDetailsScreen}
                options={{ title: 'Exam Details' }}
              />
              <Stack.Screen 
                name="IncidentDetails" 
                component={IncidentDetailsScreen}
                options={{ title: 'Incident Details' }}
              />
              <Stack.Screen 
                name="QRScanner" 
                component={QRScannerScreen}
                options={{ title: 'Scan QR Code' }}
              />
              <Stack.Screen 
                name="CreateIncident" 
                component={CreateIncidentScreen}
                options={{ title: 'Report Incident' }}
              />
              <Stack.Screen 
                name="Profile" 
                component={ProfileScreen}
                options={{ title: 'Profile' }}
              />
              <Stack.Screen 
                name="Settings" 
                component={SettingsScreen}
                options={{ title: 'Settings' }}
              />
              <Stack.Screen 
                name="Notifications" 
                component={NotificationsScreen}
                options={{ title: 'Notifications' }}
              />
            </Stack.Group>
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Placeholder screens - these will be created in separate files
const ScriptDetailsScreen = () => <></>;
const ExamDetailsScreen = () => <></>;
const IncidentDetailsScreen = () => <></>;
const QRScannerScreen = () => <></>;
const CreateIncidentScreen = () => <></>;
const ProfileScreen = () => <></>;
const SettingsScreen = () => <></>;
const NotificationsScreen = () => <></>;

export default AppNavigator;
