import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Link } from 'expo-router';
import {
  ScreenContainer,
  Section,
  ListItem,
  EmptyState,
  SkeletonList,
  Typography,
  Badge,
} from '@/components/ui';
import { useMySessions } from '@/services/queries';
import { ExamSession } from '@/types';

export default function SessionsScreen() {
  const { data: sessionsResponse, isLoading, refetch, isRefetching } = useMySessions();

  const sessions = sessionsResponse?.data || [];

  const getStatusColor = (status: ExamSession['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'scheduled':
        return 'info';
      case 'completed':
        return 'neutral';
      case 'cancelled':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <Section title="My Sessions" spacing="lg">
          <SkeletonList count={3} />
        </Section>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable
      refreshing={isRefetching}
      onRefresh={refetch}
    >
      <Section title="My Sessions" spacing="lg">
        <Typography variant="bodyMedium" color="secondary">
          Exam sessions assigned to you
        </Typography>
      </Section>

      {sessions.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No Sessions"
          description="You don't have any exam sessions assigned at the moment."
          action={
            <Typography variant="bodyMedium" color="secondary">
              Sessions will appear here when assigned by an Exams Officer.
            </Typography>
          }
        />
      ) : (
        <Section spacing="lg">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/session-details?sessionId=${session.id}`}
              asChild
            >
              <ListItem
                title={`${session.course.code} - ${session.course.name}`}
                subtitle={`${session.venue.name} • ${formatDateTime(session.date, session.startTime)}`}
                description={`${session.registeredStudents}/${session.expectedStudents} students registered • ${session.submittedScripts} scripts submitted`}
                leftIcon="document-text"
                leftIconColor="#2563eb"
                rightElement={
                  <Badge variant={getStatusColor(session.status)} size="sm">
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </Badge>
                }
                showChevron
              />
            </Link>
          ))}
        </Section>
      )}
    </ScreenContainer>
  );
}
