import { Tabs } from 'expo-router';
import React from 'react';
import { View, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '../../components/haptic-tab';
import { colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { useAuth, useLogout } from '../../hooks/useAuth';
import { Button, Typography } from '../../components/ui';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const { logout } = useLogout();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    logout();
  };

  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-1 relative">
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarStyle: {
          backgroundColor: colors.surface.primary,
          borderTopColor: colors.neutral[200],
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Math.max(8, insets.bottom), // Respect bottom safe area
          height: 70 + insets.bottom, // Add bottom safe area to height
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        headerShown: true,
        tabBarButton: HapticTab,
        headerStyle: {
          backgroundColor: colors.surface.primary,
          borderBottomColor: colors.neutral[200],
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTransparent: false,
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.text.primary,
        },
        headerRight: () => (
          <View className="flex-row items-center mr-4">
            <Typography variant="bodySmall" color="secondary" className="mr-3">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Button
              variant="ghost"
              size="sm"
              onPress={handleLogout}
              leftIcon="log-out"
            >
              Logout
            </Button>
          </View>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "qr-code" : "qr-code-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="batches"
        options={{
          title: 'Batches',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "archive" : "archive-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}
