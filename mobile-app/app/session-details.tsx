import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Typography } from '../components/ui';

export default function SessionDetailsScreen() {
  const { sessionId } = useLocalSearchParams();

  return (
    <ScreenContainer>
      <View style={{ padding: 20 }}>
        <Typography variant="headlineMedium">Session Details</Typography>
        <Typography variant="bodyMedium">Session ID: {sessionId}</Typography>
        <Typography variant="bodySmall" color="secondary">
          This screen is under development.
        </Typography>
      </View>
    </ScreenContainer>
  );
}
