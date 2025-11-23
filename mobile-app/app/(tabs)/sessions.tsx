/**
 * ELMS Mobile - Sessions List
 * View all assigned exam sessions
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ScreenContainer,
  ScreenHeader,
  Section,
  ListItem,
  Badge,
  EmptyState,
  SkeletonList,
  ChipGroup,
} from '@/components/ui';
import { useMyAssignments } from '@/hooks/useSession';

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
];

export default function SessionsScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string[]>(['today']);

  // Get filter parameters
  const getFilterParams = () => {
    const filter = selectedFilter[0];
    if (filter === 'today') {
      return { date: new Date().toISOString().split('T')[0] };
    }
    if (filter === 'completed') {
      return { status: 'COMPLETED' };
    }
    return undefined;
  };

  const { data: sessions, isLoading, refetch } = useMyAssignments(getFilterParams());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success" size="sm">Active</Badge>;
      case 'PENDING':
        return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'COMPLETED':
        return <Badge variant="default" size="sm">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="error" size="sm">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <ScreenContainer scrollable refreshing={isLoading} onRefresh={refetch}>
      <ScreenHeader title="Exam Sessions" variant="large" />

      <Section spacing="md" className="px-4">
        <ChipGroup
          chips={filterOptions}
          selectedIds={selectedFilter}
          onSelect={(id: string) => setSelectedFilter([id])}
          variant="outlined"
          color="primary"
        />
      </Section>

      <Section spacing="lg">
        {isLoading ? (
          <SkeletonList count={5} showAvatar={false} />
        ) : !sessions || sessions.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No Sessions Found"
            description={`You have no ${selectedFilter[0]} sessions`}
          />
        ) : (
          <View className="bg-white">
            {sessions.map((session: any) => (
              <ListItem
                key={session.id}
                title={`${session.courseCode} - ${session.courseName}`}
                subtitle={`${session.venue} • ${session.startTime}`}
                description={`${session.scannedCount}/${session.totalStudents} scanned`}
                leftIcon="document-text"
                leftIconColor="#2563eb"
                rightElement={getStatusBadge(session.status)}
                showChevron
                onPress={() => console.log('Navigate to session', session.id)}
              />
            ))}
          </View>
        )}
      </Section>
    </ScreenContainer>
  );
}
