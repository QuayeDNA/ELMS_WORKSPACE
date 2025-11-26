import React from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../stores/store';
import { useInvigilatorDashboard } from '../../services/queries';
import {
  ScreenContainer,
  Typography,
  Button,
  Card,
  ListItem,
  Badge,
  FAB,
  Spinner,
  Section,
} from '../../components/ui';

const Index: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: dashboard, isLoading, refetch } = useInvigilatorDashboard();
  const [refreshing, setRefreshing] = React.useState(false);
  const router = useRouter();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const dashboardData = dashboard?.data;
  const activeSessions = dashboardData?.activeSessions || [];
  const todayStats = dashboardData?.todayStats;
  const recentActivity = dashboardData?.recentActivity || [];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'scan':
        router.push('/scanner');
        break;
      case 'batch':
        // TODO: Navigate to create batch screen
        console.log('Navigate to create batch');
        break;
      case 'report':
        // TODO: Navigate to incident report screen
        console.log('Navigate to incident report');
        break;
      default:
        console.log('Quick action:', action);
    }
  };

  const handleViewAllSessions = () => {
    router.push('/sessions');
  };

  const handleSessionPress = (sessionId: number) => {
    router.push(`/session-details?sessionId=${sessionId}`);
  };

  if (isLoading) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']}>
        <Spinner size="large" centered />
      </ScreenContainer>
    );
  }

  return (
    <>
      <ScreenContainer edges={['bottom', 'left', 'right']} className="bg-gray-100">
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Header */}
          <View className="mb-6 px-4">
            <Typography variant="headlineMedium" className="mb-2">
              Welcome back, {user?.firstName || 'Handler'}!
            </Typography>
            <Typography variant="bodyLarge" color="secondary">
              {activeSessions.length} active session{activeSessions.length !== 1 ? 's' : ''} today
            </Typography>
          </View>

          {/* Main Actions Grid */}
          <View className="px-4 mb-8">
            <Typography variant="titleSmall" className="mb-4">
              What would you like to do?
            </Typography>
            <View className="gap-4">
              <View className="flex-row gap-4">
                <Card className="flex-1 p-4 items-center bg-white">
                  <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center mb-3">
                    <Ionicons name="qr-code" size={24} color="#2563eb" />
                  </View>
                  <Typography variant="bodyMedium" className="text-center font-medium mb-1">
                    Scan Scripts
                  </Typography>
                  <Typography variant="bodySmall" color="secondary" className="text-center mb-3">
                    Collect and verify exam scripts
                  </Typography>
                  <Button
                    size="sm"
                    leftIcon="qr-code"
                    onPress={() => handleQuickAction('scan')}
                    className="w-full"
                  >
                    Start Scanning
                  </Button>
                </Card>

                <Card className="flex-1 p-4 items-center bg-white">
                  <View className="w-12 h-12 rounded-full bg-error-100 items-center justify-center mb-3">
                    <Ionicons name="alert-circle" size={24} color="#dc2626" />
                  </View>
                  <Typography variant="bodyMedium" className="text-center font-medium mb-1">
                    Report Incident
                  </Typography>
                  <Typography variant="bodySmall" color="secondary" className="text-center mb-3">
                    Log exam irregularities
                  </Typography>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon="alert-circle"
                    onPress={() => handleQuickAction('report')}
                    className="w-full"
                  >
                    Report Incident
                  </Button>
                </Card>
              </View>

              <Card className="p-4 items-center bg-white">
                <View className="w-12 h-12 rounded-full bg-success-100 items-center justify-center mb-3">
                  <Ionicons name="archive" size={24} color="#16a34a" />
                </View>
                <Typography variant="bodyMedium" className="text-center font-medium mb-1">
                  Manage Batches
                </Typography>
                <Typography variant="bodySmall" color="secondary" className="text-center mb-3">
                  Create and track script batches
                </Typography>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon="cube"
                  onPress={() => handleQuickAction('batch')}
                  className="w-full"
                >
                  View Batches
                </Button>
              </Card>
            </View>
          </View>

          {/* Active Sessions */}
          {activeSessions.length > 0 && (
            <Section spacing="lg">
              <View className="flex-row justify-between items-center mb-4">
                <Typography variant="titleLarge">Active Sessions</Typography>
                <Badge variant="success" size="sm">
                  {activeSessions.length}
                </Badge>
              </View>
              <Card className="p-4 bg-white">
                {activeSessions.slice(0, 2).map((session) => (
                  <ListItem
                    key={session.id}
                    title={`${session.courseName} (${session.courseCode})`}
                    subtitle={`${session.venueName}${session.roomName ? ` • ${session.roomName}` : ''} • ${session.startTime} - ${session.endTime}`}
                    rightElement={
                      <View className="items-end">
                        <Badge
                          variant={
                            session.status === 'completed' ? 'success' :
                            session.status === 'in_progress' ? 'warning' : 'default'
                          }
                          size="sm"
                        >
                          {session.status === 'in_progress' ? 'In Progress' :
                           session.status === 'not_started' ? 'Not Started' : 'Completed'}
                        </Badge>
                        <Typography variant="bodySmall" color="secondary">
                          {session.presentStudents}/{session.expectedStudents} students
                        </Typography>
                      </View>
                    }
                    onPress={() => handleSessionPress(session.id)}
                    className="mb-2 last:mb-0"
                  />
                ))}
                {activeSessions.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={handleViewAllSessions}
                    className="mt-2"
                  >
                    View all {activeSessions.length} active sessions
                  </Button>
                )}
              </Card>
            </Section>
          )}

          {/* Today's Overview */}
          <Section spacing="lg">
            <Typography variant="titleLarge" className="mb-4">
              Today&apos;s Overview
            </Typography>
            <View className="flex-row gap-3">
              <Card className="flex-1 p-4 items-center bg-white">
                <Typography variant="displaySmall" color="success" className="mb-1">
                  {todayStats?.sessionsCompleted || 0}
                </Typography>
                <Typography variant="bodySmall" color="secondary" className="text-center">
                  Completed
                </Typography>
              </Card>
              <Card className="flex-1 p-4 items-center bg-white">
                <Typography variant="displaySmall" color="primary" className="mb-1">
                  {activeSessions.length}
                </Typography>
                <Typography variant="bodySmall" color="secondary" className="text-center">
                  Active
                </Typography>
              </Card>
              <Card className="flex-1 p-4 items-center bg-white">
                <Typography variant="displaySmall" color="warning" className="mb-1">
                  {todayStats?.scriptsCollected || 0}
                </Typography>
                <Typography variant="bodySmall" color="secondary" className="text-center">
                  Scripts
                </Typography>
              </Card>
              <Card className="flex-1 p-4 items-center bg-white">
                <Typography variant="displaySmall" color="error" className="mb-1">
                  {todayStats?.incidentsReported || 0}
                </Typography>
                <Typography variant="bodySmall" color="secondary" className="text-center">
                  Incidents
                </Typography>
              </Card>
            </View>
          </Section>

          {/* Recent Activity */}
          <Section spacing="lg">
            <View className="flex-row justify-between items-center mb-4">
              <Typography variant="titleLarge">Recent Activity</Typography>
              <Button variant="ghost" size="sm" onPress={handleViewAllSessions}>
                View All
              </Button>
            </View>
            <Card className="p-4 bg-white">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 3).map((activity) => (
                  <ListItem
                    key={activity.id}
                    title={activity.description}
                    subtitle={new Date(activity.timestamp).toLocaleString()}
                    className="mb-2 last:mb-0"
                  />
                ))
              ) : (
                <View className="py-8 items-center">
                  <Typography variant="bodyMedium" color="secondary" className="text-center">
                    No recent activity
                  </Typography>
                </View>
              )}
            </Card>
          </Section>
        </ScrollView>
      </ScreenContainer>

      {/* FAB for quick scan */}
      <FAB
        icon="qr-code"
        onPress={() => handleQuickAction('scan')}
        className="absolute bottom-6 right-6 z-10"
      />
    </>
  );
};

export default Index;
