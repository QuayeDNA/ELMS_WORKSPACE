/**
 * ELMS Mobile - QR Scanner
 * Scan student QR codes
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert as RNAlert } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { styled } from 'nativewind';
import {
  ScreenContainer,
  ScreenHeader,
  Button,
  Alert,
  Typography,
  Card,
  CardContent,
  Badge,
} from '@/components/ui';
import { useScanStudent, useSubmitScript } from '@/hooks/useScript';
import { showMessage } from 'react-native-flash-message';

const StyledView = styled(View);

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scannedStudent, setScannedStudent] = useState<any>(null);

  const { mutate: scanStudent, isPending: isScanning } = useScanStudent();
  const { mutate: submitScript, isPending: isSubmitting } = useSubmitScript();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanning || isScanning) return;

    setScanning(true);
    scanStudent(data, {
      onSuccess: (student: any) => {
        setScannedStudent(student);
        if (student.hasSubmitted) {
          showMessage({
            message: 'Duplicate Submission',
            description: `${student.firstName} ${student.lastName} has already submitted`,
            type: 'warning',
            duration: 4000,
          });
        }
      },
      onError: (error: Error) => {
        showMessage({
          message: 'Scan Failed',
          description: error.message,
          type: 'danger',
          duration: 3000,
        });
        setScanning(false);
      },
    });
  };

  const handleSubmit = (sessionId: number) => {
    if (!scannedStudent) return;

    submitScript(
      {
        examSessionId: sessionId,
        studentId: scannedStudent.id,
        indexNumber: scannedStudent.indexNumber,
        scannedAt: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          showMessage({
            message: 'Script Submitted',
            description: `${scannedStudent.firstName} ${scannedStudent.lastName}'s script recorded`,
            type: 'success',
            duration: 2000,
          });
          setScannedStudent(null);
          setScanning(false);
        },
        onError: (error: Error) => {
          showMessage({
            message: 'Submission Failed',
            description: error.message,
            type: 'danger',
            duration: 3000,
          });
          setScanning(false);
        },
      }
    );
  };

  if (!permission) {
    return (
      <ScreenContainer>
        <ScreenHeader title="QR Scanner" />
        <StyledView className="flex-1 items-center justify-center px-6">
          <Typography>Requesting camera permission...</Typography>
        </StyledView>
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer>
        <ScreenHeader title="QR Scanner" />
        <StyledView className="flex-1 items-center justify-center px-6">
          <Alert variant="warning" className="mb-4">
            Camera access is required to scan QR codes
          </Alert>
          <Button onPress={requestPermission}>Grant Permission</Button>
        </StyledView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      <ScreenHeader
        title="Scan Student QR"
        leftAction={
          <Button variant="ghost" leftIcon="arrow-back" onPress={() => router.back()} />
        }
      />

      <StyledView className="flex-1">
        {/* Camera View */}
        <StyledView className="flex-1 overflow-hidden rounded-xl m-4">
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanning ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />

          {/* Overlay */}
          <View className="absolute inset-0 justify-center items-center">
            <View className="w-64 h-64 border-4 border-white rounded-2xl" />
          </View>
        </View>

        {/* Scanned Student Info */}
        {scannedStudent && (
          <StyledView className="px-4 pb-4">
            <Card variant="elevated">
              <CardContent>
                <StyledView className="flex-row items-center justify-between mb-3">
                  <Typography variant="titleMedium">
                    {scannedStudent.firstName} {scannedStudent.lastName}
                  </Typography>
                  {scannedStudent.isRegistered ? (
                    <Badge variant="success">Registered</Badge>
                  ) : (
                    <Badge variant="warning">Unregistered</Badge>
                  )}
                </StyledView>

                <Typography variant="bodyMedium" color="secondary">
                  Index: {scannedStudent.indexNumber}
                </Typography>
                <Typography variant="bodyMedium" color="secondary">
                  Program: {scannedStudent.programName}
                </Typography>
                <Typography variant="bodyMedium" color="secondary">
                  Level: {scannedStudent.level}
                </Typography>

                {scannedStudent.hasSubmitted && (
                  <Alert variant="warning" className="mt-3">
                    This student has already submitted a script
                  </Alert>
                )}

                <StyledView className="flex-row gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onPress={() => {
                      setScannedStudent(null);
                      setScanning(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onPress={() => handleSubmit(1)} // TODO: Get actual session ID
                    loading={isSubmitting}
                    disabled={scannedStudent.hasSubmitted}
                  >
                    Submit
                  </Button>
                </StyledView>
              </CardContent>
            </Card>
          </StyledView>
        )}

        {/* Instructions */}
        {!scannedStudent && (
          <StyledView className="px-4 pb-4">
            <Alert variant="info">
              Position the QR code within the frame to scan automatically
            </Alert>
          </StyledView>
        )}
      </StyledView>
    </ScreenContainer>
  );
}
