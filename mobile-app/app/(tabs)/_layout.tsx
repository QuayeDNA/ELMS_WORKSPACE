import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';

import { HapticTab } from '../../components/haptic-tab';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { useAuth, useLogout } from '../../hooks/useAuth';
import { Button, Typography } from '../../components/ui';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const { logout } = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        headerTintColor: Colors[colorScheme ?? 'light'].text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerRight: () => (
          <View style={styles.headerRight}>
            <Typography variant="bodySmall" color="secondary">
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
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="camera" color={color} />,
        }}
      />
      <Tabs.Screen
        name="batches"
        options={{
          title: 'Batches',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="archivebox" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 16,
  },
});
