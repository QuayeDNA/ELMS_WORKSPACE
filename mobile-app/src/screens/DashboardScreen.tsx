import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { RootState, AppDispatch } from '../store';
import { logoutUser } from '../store/slices/authSlice';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

interface MetricCard {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface Activity {
  id: string;
  type: 'script' | 'exam' | 'incident' | 'user';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
}

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      id: '1',
      title: 'Scripts Processed',
      value: '1,247',
      change: '+12%',
      changeType: 'positive',
      icon: 'document-text',
      color: theme.colors.primary,
    },
    {
      id: '2',
      title: 'Active Exams',
      value: '3',
      change: 'Live now',
      changeType: 'neutral',
      icon: 'school',
      color: theme.colors.secondary,
    },
    {
      id: '3',
      title: 'Incidents',
      value: '2',
      change: '-1 today',
      changeType: 'positive',
      icon: 'warning',
      color: '#f59e0b',
    },
    {
      id: '4',
      title: 'System Health',
      value: '98.5%',
      change: 'Excellent',
      changeType: 'positive',
      icon: 'pulse',
      color: '#10b981',
    },
  ]);

  const [recentActivities, setRecentActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'script',
      title: 'Script Batch Scanned',
      description: 'Batch SCR-2025-001 verified successfully',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'success',
    },
    {
      id: '2',
      type: 'exam',
      title: 'Exam Started',
      description: 'COMP 101 Final - Hall A (156 students)',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: 'info',
    },
    {
      id: '3',
      type: 'incident',
      title: 'Scanner Issue',
      description: 'Station 3 requires maintenance',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'warning',
    },
    {
      id: '4',
      type: 'user',
      title: 'User Login',
      description: 'Dr. Johnson logged in',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      status: 'info',
    },
  ]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update metrics with new values
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      value: metric.id === '1' ? String(1247 + Math.floor(Math.random() * 50)) : metric.value,
    })));
    
    setRefreshing(false);
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'script':
        return 'document-text';
      case 'exam':
        return 'school';
      case 'incident':
        return 'warning';
      case 'user':
        return 'person';
      default:
        return 'information-circle';
    }
  };

  const getActivityColor = (status: Activity['status']) => {
    switch (status) {
      case 'success':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      case 'info':
        return theme.colors.primary;
      default:
        return theme.colors.text.secondary;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, {user?.firstName || 'User'}
            </Text>
            <Text style={styles.subtitle}>Here&apos;s your ELMS overview</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color={theme.colors.text.primary} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Metrics Cards */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          <View style={styles.metricsGrid}>
            {metrics.map((metric, index) => (
              <TouchableOpacity key={metric.id} style={styles.metricCard}>
                <LinearGradient
                  colors={[metric.color + '20', metric.color + '10']}
                  style={styles.metricGradient}
                >
                  <View style={styles.metricHeader}>
                    <View style={[styles.metricIcon, { backgroundColor: metric.color + '20' }]}>
                      <Ionicons name={metric.icon} size={20} color={metric.color} />
                    </View>
                    <View style={[
                      styles.changeIndicator,
                      { backgroundColor: metric.changeType === 'positive' ? '#10b981' : 
                        metric.changeType === 'negative' ? '#ef4444' : '#6b7280' }
                    ]}>
                      <Text style={styles.changeText}>{metric.change}</Text>
                    </View>
                  </View>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                  <Text style={styles.metricTitle}>{metric.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="qr-code-outline" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.quickActionText}>Scan QR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#10b981' + '20' }]}>
                <Ionicons name="add-circle-outline" size={24} color="#10b981" />
              </View>
              <Text style={styles.quickActionText}>Report Incident</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#f59e0b' + '20' }]}>
                <Ionicons name="search-outline" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.quickActionText}>Search Scripts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#8b5cf6' + '20' }]}>
                <Ionicons name="bar-chart-outline" size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.quickActionText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesContainer}>
          <View style={styles.activitiesHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentActivities.map((activity) => (
            <TouchableOpacity key={activity.id} style={styles.activityCard}>
              <View style={[
                styles.activityIcon,
                { backgroundColor: getActivityColor(activity.status) + '20' }
              ]}>
                <Ionicons 
                  name={getActivityIcon(activity.type)} 
                  size={20} 
                  color={getActivityColor(activity.status)} 
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityTimestamp}>{formatTimestamp(activity.timestamp)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutButton: {
    padding: 8,
  },
  metricsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.sm) / 2,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  quickActionsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: (width - theme.spacing.lg * 2 - theme.spacing.sm * 3) / 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  quickActionText: {
    fontSize: 12,
    color: theme.colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  activitiesContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  activitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  viewAllText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  activityTimestamp: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
});

export default DashboardScreen;
