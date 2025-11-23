/**
 * ELMS Mobile - Profile Screen
 * User profile and app settings
 */

import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ScreenContainer,
  ScreenHeader,
  Section,
  ListItem,
  Avatar,
  RoleBadge,
  Typography,
  Button,
  Divider,
  Alert,
} from '@/components/ui';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { showMessage } from 'react-native-flash-message';

export default function ProfileScreen() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        showMessage({
          message: 'Logged Out',
          description: 'You have been logged out successfully',
          type: 'success',
          duration: 2000,
        });
        router.replace('/(auth)/login');
      },
      onError: (error: Error) => {
        showMessage({
          message: 'Logout Failed',
          description: error.message,
          type: 'danger',
          duration: 3000,
        });
      },
    });
  };

  if (!user) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Profile" />
        <Alert variant="error" className="m-4">
          Unable to load user profile
        </Alert>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <ScreenHeader title="Profile" variant="large" />

      {/* User Info */}
      <Section spacing="lg" className="px-4">
        <View className="items-center py-6">
          <Avatar
            name={`${user.firstName} ${user.lastName}`}
            size="2xl"
            className="mb-4"
          />
          <Typography variant="headlineMedium" className="text-neutral-900 mb-1">
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="bodyMedium" color="secondary" className="mb-3">
            {user.email}
          </Typography>
          <RoleBadge role={user.role} />
          {user.staffId && (
            <Typography variant="bodySmall" color="secondary" className="mt-2">
              Staff ID: {user.staffId}
            </Typography>
          )}
        </View>
      </Section>

      <Divider />

      {/* Account Settings */}
      <Section title="Account" spacing="md">
        <View className="bg-white">
          <ListItem
            title="Edit Profile"
            leftIcon="person-outline"
            showChevron
            onPress={() => showMessage({
              message: 'Coming Soon',
              description: 'Profile editing will be available in the next update',
              type: 'info',
            })}
          />
          <ListItem
            title="Change Password"
            leftIcon="lock-closed-outline"
            showChevron
            onPress={() => showMessage({
              message: 'Coming Soon',
              description: 'Password change will be available in the next update',
              type: 'info',
            })}
          />
          <ListItem
            title="Notifications"
            leftIcon="notifications-outline"
            showChevron
            onPress={() => showMessage({
              message: 'Coming Soon',
              description: 'Notification settings will be available in the next update',
              type: 'info',
            })}
          />
        </View>
      </Section>

      {/* App Settings */}
      <Section title="App" spacing="md">
        <View className="bg-white">
          <ListItem
            title="About"
            leftIcon="information-circle-outline"
            showChevron
            onPress={() => showMessage({
              message: 'ELMS Mobile v1.0.0',
              description: 'Exam Logistics Management System',
              type: 'info',
            })}
          />
          <ListItem
            title="Help & Support"
            leftIcon="help-circle-outline"
            showChevron
            onPress={() => showMessage({
              message: 'Coming Soon',
              description: 'Help documentation will be available soon',
              type: 'info',
            })}
          />
          <ListItem
            title="Privacy Policy"
            leftIcon="shield-checkmark-outline"
            showChevron
            onPress={() => showMessage({
              message: 'Coming Soon',
              description: 'Privacy policy will be available soon',
              type: 'info',
            })}
          />
        </View>
      </Section>

      {/* Logout */}
      <Section spacing="lg" className="px-4">
        <Button
          variant="destructive"
          leftIcon="log-out"
          onPress={handleLogout}
          loading={isLoggingOut}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Logging Out...' : 'Logout'}
        </Button>
      </Section>

      <View className="px-4 pb-6">
        <Typography variant="bodySmall" color="secondary" className="text-center">
          Version 1.0.0 • © 2025 ELMS
        </Typography>
      </View>
    </ScreenContainer>
  );
}
