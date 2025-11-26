import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Link } from 'expo-router';
import {
  ScreenContainer,
  Section,
  Button,
  Typography,
  Card,
  CardContent,
} from '@/components/ui';

export default function ScannerScreen() {
  const [isScanning, setIsScanning] = useState(false);

  const handleScanStudent = () => {
    // In real app, this would open camera for QR scanning
    Alert.alert(
      'Scan Student',
      'Camera would open here to scan student QR code',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Scan',
          onPress: () => {
            Alert.alert('Success', 'Student CE001 scanned successfully!');
          }
        }
      ]
    );
  };

  const handleBulkSubmit = () => {
    Alert.alert(
      'Bulk Submit',
      'Navigate to bulk submission screen?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go',
          onPress: () => {
            // Navigate to bulk submit screen
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer>
      <Section title="QR Scanner" spacing="lg">
        <Typography variant="bodyMedium" color="secondary">
          Scan student QR codes or perform bulk submissions
        </Typography>
      </Section>

      <Section spacing="lg">
        <Card variant="elevated">
          <CardContent>
            <View style={{ gap: 16 }}>
              <Typography variant="titleMedium">Student Verification</Typography>
              <Typography variant="bodyMedium" color="secondary">
                Scan individual student QR codes to verify attendance and collect scripts.
              </Typography>
              <Button
                onPress={handleScanStudent}
                leftIcon="camera"
                loading={isScanning}
              >
                Scan Student QR
              </Button>
            </View>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent>
            <View style={{ gap: 16 }}>
              <Typography variant="titleMedium">Bulk Submission</Typography>
              <Typography variant="bodyMedium" color="secondary">
                Submit multiple scripts at once for completed exam sessions.
              </Typography>
              <Link href="/bulk-submission" asChild>
                <Button variant="outline" leftIcon="cloud-upload">
                  Bulk Submit Scripts
                </Button>
              </Link>
            </View>
          </CardContent>
        </Card>
      </Section>

      <Section title="Quick Actions" spacing="lg">
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Link href="/sessions" asChild>
            <Button variant="outline" size="sm" style={{ flex: 1 }}>
              View Sessions
            </Button>
          </Link>
          <Link href="/batches" asChild>
            <Button variant="outline" size="sm" style={{ flex: 1 }}>
              My Batches
            </Button>
          </Link>
        </View>
      </Section>
    </ScreenContainer>
  );
}
