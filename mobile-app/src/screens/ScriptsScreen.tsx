import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

interface Script {
  id: string;
  batchId: string;
  qrCode: string;
  status: 'generated' | 'distributed' | 'collected' | 'verified' | 'scanned' | 'graded' | 'returned';
  examName: string;
  examDate: string;
  location: string;
  lastUpdated: Date;
  studentCount: number;
}

interface BatchInfo {
  id: string;
  name: string;
  totalScripts: number;
  scannedScripts: number;
  status: string;
}

const ScriptsScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scripts, setScripts] = useState<Script[]>([
    {
      id: 'SCR-001',
      batchId: 'BATCH-2025-001',
      qrCode: 'QR-SCR-001-2025',
      status: 'verified',
      examName: 'Computer Science Final',
      examDate: '2025-08-23',
      location: 'Hall A',
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
      studentCount: 156,
    },
    {
      id: 'SCR-002',
      batchId: 'BATCH-2025-002',
      qrCode: 'QR-SCR-002-2025',
      status: 'collected',
      examName: 'Mathematics Mid-term',
      examDate: '2025-08-24',
      location: 'Hall B',
      lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000),
      studentCount: 120,
    },
    {
      id: 'SCR-003',
      batchId: 'BATCH-2025-003',
      qrCode: 'QR-SCR-003-2025',
      status: 'scanned',
      examName: 'Physics Lab Exam',
      examDate: '2025-08-25',
      location: 'Lab Complex',
      lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
      studentCount: 89,
    },
  ]);

  const [showScanner, setShowScanner] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualQrCode, setManualQrCode] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const statusColors = {
    generated: '#6b7280',
    distributed: '#3b82f6',
    collected: '#f59e0b',
    verified: '#10b981',
    scanned: '#8b5cf6',
    graded: '#06b6d4',
    returned: '#84cc16',
  };

  const statusLabels = {
    generated: 'Generated',
    distributed: 'Distributed',
    collected: 'Collected',
    verified: 'Verified',
    scanned: 'Scanned',
    graded: 'Graded',
    returned: 'Returned',
  };

  const filterOptions = [
    { key: 'all', label: 'All Scripts' },
    { key: 'verified', label: 'Verified' },
    { key: 'collected', label: 'Collected' },
    { key: 'scanned', label: 'Scanned' },
    { key: 'graded', label: 'Graded' },
  ];

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  }, []);

  const handleQRScan = (data: string) => {
    setShowScanner(false);
    
    // Find script by QR code
    const script = scripts.find(s => s.qrCode === data);
    
    if (script) {
      Alert.alert(
        'QR Code Scanned',
        `Script: ${script.id}\nBatch: ${script.batchId}\nExam: ${script.examName}\nStatus: ${statusLabels[script.status]}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Update Status', 
            onPress: () => updateScriptStatus(script.id) 
          },
        ]
      );
    } else {
      Alert.alert('Error', 'QR code not found in the system');
    }
  };

  const handleManualEntry = () => {
    if (manualQrCode.trim()) {
      handleQRScan(manualQrCode.trim());
      setManualQrCode('');
      setShowManualEntry(false);
    }
  };

  const updateScriptStatus = (scriptId: string) => {
    setScripts(prev => prev.map(script => {
      if (script.id === scriptId) {
        const statusFlow = ['generated', 'distributed', 'collected', 'verified', 'scanned', 'graded', 'returned'];
        const currentIndex = statusFlow.indexOf(script.status);
        const nextStatus = statusFlow[Math.min(currentIndex + 1, statusFlow.length - 1)];
        
        return {
          ...script,
          status: nextStatus as Script['status'],
          lastUpdated: new Date(),
        };
      }
      return script;
    }));
    
    Alert.alert('Success', 'Script status updated successfully');
  };

  const filteredScripts = scripts.filter(script => 
    selectedFilter === 'all' || script.status === selectedFilter
  );

  const renderScript = ({ item }: { item: Script }) => (
    <TouchableOpacity style={styles.scriptCard}>
      <View style={styles.scriptHeader}>
        <View>
          <Text style={styles.scriptId}>{item.id}</Text>
          <Text style={styles.examName}>{item.examName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
        </View>
      </View>
      
      <View style={styles.scriptDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>{item.examDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>{item.studentCount} students</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>
            Updated {item.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera access is required for QR scanning</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Script Management</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowScanner(true)}
          >
            <Ionicons name="qr-code-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowManualEntry(true)}
          >
            <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={filterOptions}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === item.key && styles.filterChipActive
              ]}
              onPress={() => setSelectedFilter(item.key)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === item.key && styles.filterTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Scripts List */}
      <FlatList
        data={filteredScripts}
        keyExtractor={(item) => item.id}
        renderItem={renderScript}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.scriptsList}
        showsVerticalScrollIndicator={false}
      />

      {/* QR Scanner Modal */}
      <Modal visible={showScanner} animationType="slide">
        <SafeAreaView style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <TouchableOpacity onPress={() => setShowScanner(false)}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>Scan QR Code</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={styles.scannerContainer}>
            <CameraView
              style={styles.camera}
              onBarcodeScanned={({ data }) => handleQRScan(data)}
            />
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame} />
              <Text style={styles.scannerInstructions}>
                Position the QR code within the frame
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Manual Entry Modal */}
      <Modal visible={showManualEntry} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter QR Code Manually</Text>
            <TextInput
              style={styles.textInput}
              placeholder="QR Code"
              value={manualQrCode}
              onChangeText={setManualQrCode}
              autoCapitalize="characters"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowManualEntry(false);
                  setManualQrCode('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleManualEntry}
              >
                <Text style={styles.confirmButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  scriptsList: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  scriptCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  scriptId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  examName: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scriptDetails: {
    gap: theme.spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  permissionText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  scannerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  scannerInstructions: {
    color: 'white',
    fontSize: 16,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    marginBottom: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.text.secondary,
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ScriptsScreen;
