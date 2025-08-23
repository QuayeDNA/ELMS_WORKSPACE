import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Tab Screens
import DashboardScreen from '../screens/DashboardScreen';
import ScriptsScreen from '../screens/ScriptsScreen';
import ExamsScreen from '../screens/ExamsScreen';
import IncidentsScreen from '../screens/IncidentsScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Scripts: undefined;
  Exams: undefined;
  Incidents: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Scripts':
              iconName = focused ? 'file-document' : 'file-document-outline';
              break;
            case 'Exams':
              iconName = focused ? 'school' : 'school-outline';
              break;
            case 'Incidents':
              iconName = focused ? 'alert-circle' : 'alert-circle-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Scripts" 
        component={ScriptsScreen} 
        options={{ title: 'Scripts' }}
      />
      <Tab.Screen 
        name="Exams" 
        component={ExamsScreen} 
        options={{ title: 'Exams' }}
      />
      <Tab.Screen 
        name="Incidents" 
        component={IncidentsScreen} 
        options={{ title: 'Incidents' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
