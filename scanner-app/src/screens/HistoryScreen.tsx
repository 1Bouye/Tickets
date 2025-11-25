import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { scannerService, ScanLog } from '../services/scanner.service';
import { format } from 'date-fns';
// Icons will be rendered as text/emoji for React Native compatibility

export default function HistoryScreen() {
  const { user, logout } = useAuth();
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        limit: 100,
      };
      // Only filter by date if we want today's scans, otherwise get all
      // For now, let's get all scans to see if there's any data
      // date: format(new Date(), 'yyyy-MM-dd'),
      
      if (filter !== 'all') {
        params.result = filter === 'success' ? 'success' : 'already_used,invalid,expired';
      }
      
      console.log('Loading scan history with params:', params);
      const response = await scannerService.getScanLogs(params);
      console.log('Scan logs response:', JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        const logs = response.data?.logs || response.logs || [];
        const statistics = response.data?.statistics || response.statistics || { total: 0, successful: 0, failed: 0 };
        
        console.log('Loaded logs:', logs.length, 'Statistics:', statistics);
        
        setLogs(logs);
        setStats(statistics);
      } else {
        console.error('Failed to load history - response not successful:', response);
        setLogs([]);
        setStats({ total: 0, successful: 0, failed: 0 });
      }
    } catch (error: any) {
      console.error('Failed to load history - error details:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert(
        'Error Loading History',
        error.response?.data?.error?.message || error.message || 'Failed to load scan history. Please check your connection and try again.'
      );
      setLogs([]);
      setStats({ total: 0, successful: 0, failed: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const getResultIcon = (result: string) => {
    return (
      <Text style={styles.iconText}>
        {result === 'success' ? '✓' : '✗'}
      </Text>
    );
  };

  const getResultColor = (result: string) => {
    if (result === 'success') {
      return '#d1fae5';
    }
    return '#fee2e2';
  };

  const getResultTextColor = (result: string) => {
    if (result === 'success') {
      return '#065f46';
    }
    return '#991b1b';
  };

  const filterLogs = (logs: ScanLog[]) => {
    if (!logs || !Array.isArray(logs)) {
      return [];
    }

    let filtered = [...logs];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((log) => {
        const ticketId = (log.ticketId || '').toLowerCase();
        const userId = (log.ticket?.owner?.userId || log.userIdFromQR || '').toLowerCase();
        return ticketId.includes(query) || userId.includes(query);
      });
    }

    return filtered;
  };

  const filteredLogs = filterLogs(logs || []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.total || 0}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>
          <View style={[styles.statCard, styles.statSuccess]}>
            <Text style={[styles.statValue, styles.statValueSuccess]}>{stats?.successful || 0}</Text>
            <Text style={styles.statLabel}>Successful</Text>
          </View>
          <View style={[styles.statCard, styles.statFailed]}>
            <Text style={[styles.statValue, styles.statValueFailed]}>{stats?.failed || 0}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Ticket ID or User ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'all' && styles.filterButtonTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'success' && styles.filterButtonActive]}
            onPress={() => setFilter('success')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'success' && styles.filterButtonTextActive,
              ]}
            >
              Success
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'failed' && styles.filterButtonActive]}
            onPress={() => setFilter('failed')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'failed' && styles.filterButtonTextActive,
              ]}
            >
              Failed
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : filteredLogs && filteredLogs.length > 0 ? (
          <View style={styles.logsContainer}>
            {filteredLogs.map((log) => (
              <View
                key={log.logId}
                style={[
                  styles.logItem,
                  { backgroundColor: getResultColor(log.scanResult) },
                ]}
              >
                <View style={styles.logHeader}>
                  {getResultIcon(log.scanResult)}
                  <Text
                    style={[
                      styles.logResult,
                      { color: getResultTextColor(log.scanResult) },
                    ]}
                  >
                    {log.scanResult === 'success'
                      ? 'Allowed'
                      : log.scanResult === 'already_used'
                      ? 'Already Used'
                      : log.scanResult === 'expired'
                      ? 'Expired'
                      : 'Invalid'}
                  </Text>
                </View>

                {log.scanResult === 'success' ? (
                  <>
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Ticket ID:</Text>
                      <Text style={styles.detailValue}>
                        {log.ticket?.ticketId || log.ticketId}
                      </Text>
                    </View>

                    {log.ticket?.owner ? (
                      <>
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Owner Name:</Text>
                          <Text style={styles.detailValue}>
                            {log.ticket.owner.name || 'N/A'}
                          </Text>
                        </View>
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Owner User ID:</Text>
                          <Text style={styles.detailValue}>
                            {log.ticket.owner.userId}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Owner User ID:</Text>
                        <Text style={styles.detailValue}>
                          {log.userIdFromQR}
                        </Text>
                      </View>
                    )}

                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Scan Time:</Text>
                      <Text style={styles.detailValue}>
                        {format(new Date(log.scanTime), 'EEEE, MMMM dd, yyyy HH:mm:ss')}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.logTicketId}>Ticket: {log.ticketId}</Text>
                    <Text style={styles.logUserId}>User: {log.userIdFromQR}</Text>
                    <Text style={styles.logTime}>
                      {format(new Date(log.scanTime), 'MMM dd, yyyy HH:mm:ss')}
                    </Text>
                  </>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery.trim() 
                ? 'No scans found matching your search' 
                : filter === 'success'
                ? 'No successful scans for today'
                : filter === 'failed'
                ? 'No failed scans for today'
                : 'No scan history for today'}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
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
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
  },
  logsContainer: {
    gap: 12,
  },
  logItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  logResult: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logTicketId: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    fontWeight: '500',
  },
  logUserId: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  logTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  iconText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

