import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface Metric {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  color: string;
}

const AnalyticsScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const periods = [
    { key: 'day', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' },
  ];

  const keyMetrics: Metric[] = [
    {
      id: '1',
      title: 'Scripts Processed',
      value: '2,847',
      change: '+12.5%',
      changeType: 'positive',
      color: '#3b82f6',
    },
    {
      id: '2',
      title: 'Exams Completed',
      value: '23',
      change: '+8.3%',
      changeType: 'positive',
      color: '#10b981',
    },
    {
      id: '3',
      title: 'Incidents Resolved',
      value: '18',
      change: '+25.0%',
      changeType: 'positive',
      color: '#f59e0b',
    },
    {
      id: '4',
      title: 'System Uptime',
      value: '99.8%',
      change: '+0.2%',
      changeType: 'positive',
      color: '#8b5cf6',
    },
  ];

  const scriptStatusData: ChartData[] = [
    { label: 'Verified', value: 45, color: '#10b981' },
    { label: 'Scanned', value: 30, color: '#3b82f6' },
    { label: 'Graded', value: 20, color: '#f59e0b' },
    { label: 'Returned', value: 5, color: '#8b5cf6' },
  ];

  const examTypesData: ChartData[] = [
    { label: 'Finals', value: 40, color: '#ef4444' },
    { label: 'Mid-terms', value: 35, color: '#3b82f6' },
    { label: 'Quizzes', value: 25, color: '#10b981' },
  ];

  const incidentTypesData: ChartData[] = [
    { label: 'Equipment', value: 50, color: '#f59e0b' },
    { label: 'Security', value: 25, color: '#ef4444' },
    { label: 'Script', value: 15, color: '#3b82f6' },
    { label: 'Other', value: 10, color: '#6b7280' },
  ];

  const recentTrends = [
    {
      title: 'Script Processing Speed',
      value: '2.3 min/script',
      trend: 'up',
      change: '15% faster',
      description: 'Average time to process each script',
    },
    {
      title: 'Incident Response Time',
      value: '4.2 hours',
      trend: 'down',
      change: '30% faster',
      description: 'Average time to resolve incidents',
    },
    {
      title: 'User Engagement',
      value: '87%',
      trend: 'up',
      change: '5% increase',
      description: 'Daily active users rate',
    },
    {
      title: 'Error Rate',
      value: '0.8%',
      trend: 'down',
      change: '2% decrease',
      description: 'System error occurrence rate',
    },
  ];

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  }, []);

  const renderDonutChart = (data: ChartData[], title: string) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.donutChart}>
          <View style={styles.donutCenter}>
            <Text style={styles.donutCenterText}>{total}</Text>
            <Text style={styles.donutCenterLabel}>Total</Text>
          </View>
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const rotation = currentAngle;
            currentAngle += angle;

            return (
              <View
                key={index}
                style={[
                  styles.donutSegment,
                  {
                    transform: [{ rotate: `${rotation}deg` }],
                    borderColor: item.color,
                  },
                ]}
              />
            );
          })}
        </View>
        <View style={styles.chartLegend}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>
                {item.label} ({item.value})
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderBarChart = (data: ChartData[], title: string) => {
    const maxValue = Math.max(...data.map(item => item.value));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.barChart}>
          {data.map((item, index) => (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <LinearGradient
                  colors={[item.color, item.color + '80']}
                  style={[
                    styles.bar,
                    { height: (item.value / maxValue) * 100 }
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{item.label}</Text>
              <Text style={styles.barValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
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
          <Text style={styles.title}>Analytics Dashboard</Text>
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="download-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period.key && styles.periodTextActive
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
          <View style={styles.metricsGrid}>
            {keyMetrics.map((metric) => (
              <View key={metric.id} style={styles.metricCard}>
                <LinearGradient
                  colors={[metric.color + '20', metric.color + '10']}
                  style={styles.metricGradient}
                >
                  <Text style={styles.metricValue}>{metric.value}</Text>
                  <Text style={styles.metricTitle}>{metric.title}</Text>
                  <View style={styles.metricChange}>
                    <Ionicons 
                      name={metric.changeType === 'positive' ? 'trending-up' : 'trending-down'} 
                      size={16} 
                      color={metric.changeType === 'positive' ? '#10b981' : '#ef4444'} 
                    />
                    <Text style={[
                      styles.metricChangeText,
                      { color: metric.changeType === 'positive' ? '#10b981' : '#ef4444' }
                    ]}>
                      {metric.change}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.chartsSection}>
          <Text style={styles.sectionTitle}>Data Insights</Text>
          
          {/* Script Status Distribution */}
          {renderDonutChart(scriptStatusData, 'Script Status Distribution')}
          
          {/* Exam Types */}
          {renderBarChart(examTypesData, 'Exam Types This Month')}
          
          {/* Incident Types */}
          {renderDonutChart(incidentTypesData, 'Incident Categories')}
        </View>

        {/* Trends Section */}
        <View style={styles.trendsSection}>
          <Text style={styles.sectionTitle}>Performance Trends</Text>
          {recentTrends.map((trend, index) => (
            <View key={index} style={styles.trendCard}>
              <View style={styles.trendHeader}>
                <View style={styles.trendInfo}>
                  <Text style={styles.trendTitle}>{trend.title}</Text>
                  <Text style={styles.trendDescription}>{trend.description}</Text>
                </View>
                <View style={styles.trendValue}>
                  <Text style={styles.trendValueText}>{trend.value}</Text>
                  <View style={styles.trendChange}>
                    <Ionicons 
                      name={trend.trend === 'up' ? 'arrow-up' : 'arrow-down'} 
                      size={14} 
                      color={trend.trend === 'up' ? '#10b981' : '#ef4444'} 
                    />
                    <Text style={[
                      styles.trendChangeText,
                      { color: trend.trend === 'up' ? '#10b981' : '#ef4444' }
                    ]}>
                      {trend.change}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* System Health */}
        <View style={styles.healthSection}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthGrid}>
            <View style={styles.healthCard}>
              <Ionicons name="server-outline" size={24} color="#3b82f6" />
              <Text style={styles.healthValue}>98.5%</Text>
              <Text style={styles.healthLabel}>Server Uptime</Text>
            </View>
            <View style={styles.healthCard}>
              <Ionicons name="flash-outline" size={24} color="#10b981" />
              <Text style={styles.healthValue}>1.2s</Text>
              <Text style={styles.healthLabel}>Response Time</Text>
            </View>
            <View style={styles.healthCard}>
              <Ionicons name="people-outline" size={24} color="#f59e0b" />
              <Text style={styles.healthValue}>247</Text>
              <Text style={styles.healthLabel}>Active Users</Text>
            </View>
            <View style={styles.healthCard}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#8b5cf6" />
              <Text style={styles.healthValue}>100%</Text>
              <Text style={styles.healthLabel}>Security Score</Text>
            </View>
          </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.xs,
  },
  exportText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  periodButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  periodTextActive: {
    color: 'white',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  metricsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  metricCard: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.sm) / 2,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
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
    marginBottom: theme.spacing.sm,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  chartContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  donutChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
    position: 'relative',
    backgroundColor: '#f3f4f6',
  },
  donutCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -20 }],
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 40,
  },
  donutCenterText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  donutCenterLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  donutSegment: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 20,
    borderColor: 'transparent',
  },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: theme.spacing.md,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 100,
    width: 30,
    justifyContent: 'flex-end',
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  barValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 2,
  },
  trendsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  trendCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendInfo: {
    flex: 1,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  trendDescription: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  trendValue: {
    alignItems: 'flex-end',
  },
  trendValueText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  trendChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  trendChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  healthSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  healthCard: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.sm) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  healthValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.sm,
  },
  healthLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default AnalyticsScreen;
