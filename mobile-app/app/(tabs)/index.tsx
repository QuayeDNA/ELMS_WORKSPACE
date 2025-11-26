import React from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { useMySessions } from '../../services/queries';
import {
  ScreenContainer,
  Typography,
  Button,
  Card,
  ListItem,
  Badge,
  FAB,
  Spinner,
} from '../../components/ui';
import { ExamSession } from '../../types';

const Index: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: sessions, isLoading, refetch } = useMySessions();
  const [refreshing, setRefreshing] = React.useState(false);
  const router = useRouter();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const recentSessions: ExamSession[] = sessions?.data?.slice(0, 3) || [];
  const activeSessions: ExamSession[] = sessions?.data?.filter((s: ExamSession) => s.status === 'active') || [];

  const handleQuickAction = (action: string) => {
    // Handle quick actions
    console.log('Quick action:', action);
  };

  const handleViewAllSessions = () => {
    // TODO: Navigate to sessions tab
    console.log('Navigate to sessions');
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <Spinner size="large" centered />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Header */}
        <View style={{ marginBottom: 24 }}>
          <Typography variant="headlineMedium" style={{ marginBottom: 8 }}>
            Welcome back, {user?.firstName || 'Officer'}!
          </Typography>
          <Typography variant="bodyMedium" color="secondary">
            {activeSessions.length} active sessions today
          </Typography>
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: 24 }}>
          <Typography variant="titleMedium" style={{ marginBottom: 16 }}>
            Quick Actions
          </Typography>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <Button
              variant="default"
              size="sm"
              onPress={() => handleQuickAction('scan')}
              style={{ flex: 1, minWidth: 120 }}
            >
              Scan Script
            </Button>
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleQuickAction('batch')}
              style={{ flex: 1, minWidth: 120 }}
            >
              Create Batch
            </Button>
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleQuickAction('report')}
              style={{ flex: 1, minWidth: 120 }}
            >
              View Reports
            </Button>
          </View>
        </View>

        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Typography variant="titleMedium" style={{ marginBottom: 16 }}>
              Active Sessions
            </Typography>
            <Card style={{ padding: 16 }}>
              {activeSessions.map((session: ExamSession) => (
                <ListItem
                  key={session.id}
                  title={session.course.name}
                  subtitle={`${session.venue.name} • ${session.startTime} - ${session.endTime}`}
                  rightElement={
                    <Badge variant="success" size="sm">
                      Active
                    </Badge>
                  }
                  onPress={() => {
                    // Navigate to session details
                  }}
                  style={{ marginBottom: 8 }}
                />
              ))}
            </Card>
          </View>
        )}

        {/* Recent Sessions */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Typography variant="titleMedium">Recent Sessions</Typography>
            <Button variant="ghost" size="sm" onPress={handleViewAllSessions}>
              View All
            </Button>
          </View>
          <Card style={{ padding: 16 }}>
            {recentSessions.length > 0 ? (
              recentSessions.map((session: ExamSession) => (
                <ListItem
                  key={session.id}
                  title={session.course.name}
                  subtitle={`${session.date} • ${session.venue.name}`}
                  rightElement={
                    <Badge
                      variant={
                        session.status === 'completed' ? 'success' :
                        session.status === 'active' ? 'info' : 'default'
                      }
                      size="sm"
                    >
                      {session.status}
                    </Badge>
                  }
                  onPress={() => {
                    // Navigate to session details
                  }}
                  style={{ marginBottom: 8 }}
                />
              ))
            ) : (
              <Typography variant="bodyMedium" color="secondary" style={{ textAlign: 'center', paddingVertical: 16 }}>
                No recent sessions
              </Typography>
            )}
          </Card>
        </View>

        {/* Today's Summary */}
        <View style={{ marginBottom: 24 }}>
          <Typography variant="titleMedium" style={{ marginBottom: 16 }}>
            Today's Summary
          </Typography>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Card style={{ flex: 1, padding: 16, alignItems: 'center' }}>
              <Typography variant="headlineSmall" color="primary">
                {sessions?.data?.filter((s: ExamSession) => s.status === 'completed').length || 0}
              </Typography>
              <Typography variant="bodyMedium" color="secondary">
                Completed
              </Typography>
            </Card>
            <Card style={{ flex: 1, padding: 16, alignItems: 'center' }}>
              <Typography variant="headlineSmall" color="warning">
                {activeSessions.length}
              </Typography>
              <Typography variant="bodyMedium" color="secondary">
                Active
              </Typography>
            </Card>
            <Card style={{ flex: 1, padding: 16, alignItems: 'center' }}>
              <Typography variant="headlineSmall" color="error">
                {sessions?.data?.filter((s: ExamSession) => s.status === 'cancelled').length || 0}
              </Typography>
              <Typography variant="bodyMedium" color="secondary">
                Issues
              </Typography>
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* FAB for quick scan */}
      <FAB
        icon="qr-code"
        onPress={() => handleQuickAction('scan')}
        style={{ position: 'absolute', bottom: 24, right: 24 }}
      />
    </ScreenContainer>
  );
};

export default Index;
