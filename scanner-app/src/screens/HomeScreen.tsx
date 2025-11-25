import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { scannerService } from '../services/scanner.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

export default function HomeScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    // Try to get user name from backend if missing
    if (user && !user.name) {
      fetchUserName();
    } else if (user?.name) {
      setUserName(user.name);
    }
  }, [user]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await scannerService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserName = async () => {
    try {
      const response = await scannerService.getCurrentUser();
      if (response.success && response.data?.name) {
        setUserName(response.data.name);
        // Update stored user with name
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.name = response.data.name;
          await AsyncStorage.setItem('user', JSON.stringify(parsedUser));
        }
      }
    } catch (error) {
      console.error('Failed to fetch user name:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    if (user && !user.name) {
      await fetchUserName();
    }
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome{userName || user?.name ? `, ${userName || user?.name}` : user?.userId ? `, ${user.userId}` : ''}
          </Text>
          <Text style={styles.subtitleText}>Today's Scanning Overview</Text>
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : stats ? (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.total || 0}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>Total Scans</Text>
              </View>
              <View style={[styles.statCard, styles.statSuccess]}>
                <Text style={[styles.statValue, styles.statValueSuccess]}>
                  {stats.successful || 0}
                </Text>
                <Text style={styles.statLabel} numberOfLines={1}>Successful</Text>
              </View>
              <View style={[styles.statCard, styles.statFailed]}>
                <Text style={[styles.statValue, styles.statValueFailed]}>
                  {stats.failed || 0}
                </Text>
                <Text style={styles.statLabel} numberOfLines={1}>Failed</Text>
              </View>
            </View>

            {stats.breakdown && (
              <View style={styles.breakdownContainer}>
                <Text style={styles.sectionTitle}>Failure Breakdown</Text>
                <View style={styles.breakdownCard}>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Already Used:</Text>
                    <Text style={styles.breakdownValue}>
                      {stats.breakdown.alreadyUsed || 0}
                    </Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Invalid:</Text>
                    <Text style={styles.breakdownValue}>{stats.breakdown.invalid || 0}</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Expired:</Text>
                    <Text style={styles.breakdownValue}>{stats.breakdown.expired || 0}</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Quick Actions</Text>
              <Text style={styles.infoText}>
                • Use the Scanner tab to scan QR codes
              </Text>
              <Text style={styles.infoText}>
                • Check Scan History for detailed logs
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statSuccess: {
    backgroundColor: '#d1fae5',
  },
  statFailed: {
    backgroundColor: '#fee2e2',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
    textAlign: 'center',
  },
  statValueSuccess: {
    color: '#065f46',
  },
  statValueFailed: {
    color: '#991b1b',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  breakdownContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  breakdownCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  breakdownLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

