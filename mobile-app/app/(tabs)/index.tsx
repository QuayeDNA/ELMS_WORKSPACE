/**
 * ELMS Mobile - Home Dashboard
 * Main dashboard with stats and quick actions
 */

import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import {
  ScreenContainer,
  ScreenHeader,
  Section,
  Card,
  CardContent,
  Typography,
  Button,
  Badge,
  ListItem,
  EmptyState,
  SkeletonCard,
} from '@/components/ui';
import { useCurrentUser } from '@/hooks/useAuth';
import { useDashboardStats, useMyAssignments } from '@/hooks/useSession';

const StyledView = styled(View);

export default function HomeScreen() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: sessions, isLoading: sessionsLoading, refetch: refetchSessions } = useMyAssignments({
    date: new Date().toISOString().split('T')[0],
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchSessions()]);
    setRefreshing(false);
  };

  const todaySessions = sessions?.filter(s => s.status !== 'COMPLETED') || [];

  return (
    <ScreenContainer scrollable={false}>
      <ScreenHeader
        title="Dashboard"
        subtitle={user ? `${user.firstName} ${user.lastName}` : ''}
        variant="large"
        rightAction={
          <Badge variant="default" size="sm">
            {user?.role.replace('_', ' ')}
          </Badge>
        }
      />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <Section title="Today's Overview" spacing="lg">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {statsLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <StyledView className="w-40 bg-primary-50 p-4 rounded-xl border border-primary-200">
                  <Typography variant="headlineMedium" className="text-primary-600">
                    {stats?.todaySessions || 0}
                  </Typography>
                  <Typography variant="bodySmall" color="secondary" className="mt-1">
                    Sessions Today
                  </Typography>
                </StyledView>

                <StyledView className="w-40 bg-success-50 p-4 rounded-xl border border-success-200">
                  <Typography variant="headlineMedium" className="text-success-600">
                    {stats?.totalScanned || 0}
                  </Typography>
                  <Typography variant="bodySmall" color="secondary" className="mt-1">
                    Scripts Scanned
                  </Typography>
                </StyledView>

                <StyledView className="w-40 bg-warning-50 p-4 rounded-xl border border-warning-200">
                  <Typography variant="headlineMedium" className="text-warning-600">
                    {stats?.pendingBatches || 0}
                  </Typography>
                  <Typography variant="bodySmall" color="secondary" className="mt-1">
                    Pending Batches
                  </Typography>
                </StyledView>
              </>
            )}
          </ScrollView>
        </Section>

        {/* Quick Actions */}
        <Section title="Quick Actions" spacing="lg" className="px-4">
          <StyledView className="flex-row gap-3">
            <Button
              className="flex-1"
              leftIcon="qr-code"
              onPress={() => router.push('/(tabs)/scan')}
            >
              Scan QR
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              leftIcon="calendar"
              onPress={() => router.push('/(tabs)/sessions')}
            >
              Sessions
            </Button>
          </StyledView>
        </Section>

        {/* Today's Sessions */}
        <Section title="Today's Sessions" spacing="lg">
          {sessionsLoading ? (
            <SkeletonCard lines={2} />
          ) : todaySessions.length === 0 ? (
            <StyledView className="px-4">
              <EmptyState
                icon="calendar-outline"
                title="No Sessions Today"
                description="You have no exam sessions assigned for today"
              />
            </StyledView>
          ) : (
            <StyledView className="bg-white">
              {todaySessions.slice(0, 3).map((session) => (
                <ListItem
                  key={session.id}
                  title={`${session.courseCode} - ${session.courseName}`}
                  subtitle={`${session.venue} • ${session.startTime}`}
                  description={`${session.scannedCount}/${session.totalStudents} scanned`}
                  leftIcon="document-text"
                  leftIconColor="#2563eb"
                  showChevron
                  onPress={() => router.push(`/session/${session.id}`)}
                />
              ))}
            </StyledView>
          )}
        </Section>
      </ScrollView>
    </ScreenContainer>
  );
}
