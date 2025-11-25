import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ticketsService, Ticket } from '../services/tickets.service';
import { format } from 'date-fns';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [history, setHistory] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const response = await ticketsService.getTicketHistory(20);
      if (response.success && response.data) {
        setHistory(response.data.tickets || []);
      }
    } catch (error: any) {
      console.error('Failed to load history:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error?.message || 'Failed to load purchase history.'
      );
    } finally {
      setIsLoading(false);
    }
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileCard}>
          <Text style={styles.profileTitle}>User Information</Text>
          {user?.name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name:</Text>
              <Text style={styles.infoValue}>{user.name}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID:</Text>
            <Text style={styles.infoValue}>{user?.userId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role:</Text>
            <Text style={styles.infoValue}>{user?.role}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Purchase History</Text>
          {isLoading === true ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : history.length > 0 ? (
            <View style={styles.historyList}>
              {history.map((ticket) => (
                <View key={ticket.ticketId} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyTicketId}>{ticket.ticketId}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        ticket.status === 'used'
                          ? styles.statusUsed
                          : ticket.status === 'purchased'
                          ? styles.statusPurchased
                          : styles.statusAvailable,
                      ]}
                    >
                      <Text style={styles.statusText}>{ticket.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.historyDate}>
                    {format(new Date(ticket.generatedDate), 'MMM dd, yyyy')}
                  </Text>
                  {ticket.purchasedAt && (
                    <Text style={styles.historyTime}>
                      Purchased: {format(new Date(ticket.purchasedAt), 'MMM dd, yyyy HH:mm')}
                    </Text>
                  )}
                  {ticket.usedAt && (
                    <Text style={styles.historyTime}>
                      Used: {format(new Date(ticket.usedAt), 'MMM dd, yyyy HH:mm')}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No purchase history</Text>
            </View>
          )}
        </View>

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
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  infoLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
  },
  historyList: {
    // gap: 12, // Not supported in all React Native versions
  },
  historyItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTicketId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusAvailable: {
    backgroundColor: '#d1fae5',
  },
  statusPurchased: {
    backgroundColor: '#dbeafe',
  },
  statusUsed: {
    backgroundColor: '#e5e7eb',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  historyDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  historyTime: {
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
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

