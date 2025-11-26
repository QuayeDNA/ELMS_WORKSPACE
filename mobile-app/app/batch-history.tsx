import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Typography } from '../components/ui';

export default function BatchHistoryScreen() {
  const { batchId } = useLocalSearchParams();

  return (
    <ScreenContainer>
      <View style={{ padding: 20 }}>
        <Typography variant="headlineMedium">Batch History</Typography>
        <Typography variant="bodyMedium">Batch ID: {batchId}</Typography>
        <Typography variant="bodySmall" color="secondary">
          This screen is under development.
        </Typography>
      </View>
    </ScreenContainer>
  );
}
