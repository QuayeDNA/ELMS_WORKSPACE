import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface Incident {
  id: string;
  title: string;
  description: string;
  type: 'equipment' | 'security' | 'exam' | 'script' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reportedBy: string;
  assignedTo?: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

type IncidentForm = Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'reportedBy' | 'status'>;

const IncidentsScreen: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: 'INC-001',
      title: 'Scanner Malfunction',
      description: 'QR code scanner at Station 3 is not responding properly',
      type: 'equipment',
      priority: 'high',
      status: 'in_progress',
      reportedBy: 'John Doe',
      assignedTo: 'Tech Team',
      location: 'Verification Station 3',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      id: 'INC-002',
      title: 'Unauthorized Access',
      description: 'Unknown person attempted to access restricted area',
      type: 'security',
      priority: 'critical',
      status: 'open',
      reportedBy: 'Security Guard',
      location: 'Main Entrance',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: 'INC-003',
      title: 'Script Batch Missing',
      description: 'Batch SCR-2025-001 cannot be located',
      type: 'script',
      priority: 'high',
      status: 'resolved',
      reportedBy: 'Jane Smith',
      assignedTo: 'Logistics Team',
      location: 'Storage Room B',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  ]);

  const [showReportModal, setShowReportModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [newIncident, setNewIncident] = useState<IncidentForm>({
    title: '',
    description: '',
    type: 'other',
    priority: 'medium',
    location: '',
  });

  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626',
  };

  const statusColors = {
    open: '#ef4444',
    in_progress: '#f59e0b',
    resolved: '#10b981',
    closed: '#6b7280',
  };

  const typeIcons = {
    equipment: 'build-outline',
    security: 'shield-outline',
    exam: 'school-outline',
    script: 'document-text-outline',
    other: 'help-circle-outline',
  };

  const filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
  ];

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  }, []);

  const handleReportIncident = () => {
    if (!newIncident.title.trim() || !newIncident.description.trim() || !newIncident.location.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const incident: Incident = {
      ...newIncident,
      id: `INC-${String(incidents.length + 1).padStart(3, '0')}`,
      reportedBy: 'Current User', // In real app, get from auth state
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setIncidents(prev => [incident, ...prev]);
    setNewIncident({
      title: '',
      description: '',
      type: 'other',
      priority: 'medium',
      location: '',
    });
    setShowReportModal(false);
    Alert.alert('Success', 'Incident reported successfully');
  };

  const updateIncidentStatus = (incidentId: string, newStatus: Incident['status']) => {
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { ...incident, status: newStatus, updatedAt: new Date() }
        : incident
    ));
  };

  const filteredIncidents = incidents.filter(incident => 
    selectedFilter === 'all' || incident.status === selectedFilter
  );

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const renderIncident = ({ item }: { item: Incident }) => (
    <TouchableOpacity style={styles.incidentCard}>
      <View style={styles.incidentHeader}>
        <View style={styles.incidentTitleRow}>
          <View style={[styles.typeIcon, { backgroundColor: priorityColors[item.priority] + '20' }]}>
            <Ionicons 
              name={typeIcons[item.type] as any} 
              size={20} 
              color={priorityColors[item.priority]} 
            />
          </View>
          <View style={styles.incidentTitleContainer}>
            <Text style={styles.incidentId}>{item.id}</Text>
            <Text style={styles.incidentTitle}>{item.title}</Text>
          </View>
        </View>
        <View style={styles.badgeContainer}>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColors[item.priority] }]}>
            <Text style={styles.badgeText}>{item.priority.toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
            <Text style={styles.badgeText}>{item.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.incidentDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.incidentDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>Reported by {item.reportedBy}</Text>
        </View>
        {item.assignedTo && (
          <View style={styles.detailRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.detailText}>Assigned to {item.assignedTo}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>{formatTimestamp(item.createdAt)}</Text>
        </View>
      </View>

      {item.status !== 'closed' && (
        <View style={styles.actionButtons}>
          {item.status === 'open' && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
              onPress={() => updateIncidentStatus(item.id, 'in_progress')}
            >
              <Text style={styles.actionButtonText}>Start Progress</Text>
            </TouchableOpacity>
          )}
          {item.status === 'in_progress' && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#10b981' }]}
              onPress={() => updateIncidentStatus(item.id, 'resolved')}
            >
              <Text style={styles.actionButtonText}>Mark Resolved</Text>
            </TouchableOpacity>
          )}
          {item.status === 'resolved' && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#6b7280' }]}
              onPress={() => updateIncidentStatus(item.id, 'closed')}
            >
              <Text style={styles.actionButtonText}>Close</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Incident Management</Text>
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => setShowReportModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{incidents.filter(i => i.status === 'open').length}</Text>
          <Text style={styles.statLabel}>Open</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{incidents.filter(i => i.status === 'in_progress').length}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{incidents.filter(i => i.priority === 'critical').length}</Text>
          <Text style={styles.statLabel}>Critical</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{incidents.filter(i => i.status === 'resolved').length}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
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

      {/* Incidents List */}
      <FlatList
        data={filteredIncidents}
        keyExtractor={(item) => item.id}
        renderItem={renderIncident}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.incidentsList}
        showsVerticalScrollIndicator={false}
      />

      {/* Report Incident Modal */}
      <Modal visible={showReportModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowReportModal(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Report Incident</Text>
            <TouchableOpacity onPress={handleReportIncident}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Brief description of the incident"
                value={newIncident.title}
                onChangeText={(text) => setNewIncident(prev => ({ ...prev, title: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeSelector}>
                {Object.entries(typeIcons).map(([type, icon]) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      newIncident.type === type && styles.typeOptionActive
                    ]}
                    onPress={() => setNewIncident(prev => ({ ...prev, type: type as any }))}
                  >
                    <Ionicons 
                      name={icon as any} 
                      size={20} 
                      color={newIncident.type === type ? 'white' : theme.colors.text.secondary} 
                    />
                    <Text style={[
                      styles.typeText,
                      newIncident.type === type && styles.typeTextActive
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.prioritySelector}>
                {Object.entries(priorityColors).map(([priority, color]) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      { borderColor: color },
                      newIncident.priority === priority && { backgroundColor: color }
                    ]}
                    onPress={() => setNewIncident(prev => ({ ...prev, priority: priority as any }))}
                  >
                    <Text style={[
                      styles.priorityText,
                      { color: newIncident.priority === priority ? 'white' : color }
                    ]}>
                      {priority.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Location *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Where did this incident occur?"
                value={newIncident.location}
                onChangeText={(text) => setNewIncident(prev => ({ ...prev, location: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Detailed description of the incident"
                value={newIncident.description}
                onChangeText={(text) => setNewIncident(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </SafeAreaView>
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
  reportButton: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 4,
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
  incidentsList: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  incidentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  incidentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  incidentTitleContainer: {
    flex: 1,
  },
  incidentId: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  badgeContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  incidentDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  incidentDetails: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  saveButton: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  textArea: {
    height: 100,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.xs,
  },
  typeOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  typeTextActive: {
    color: 'white',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  priorityOption: {
    flex: 1,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default IncidentsScreen;
