import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../context/AuthContext';
import { ticketsService, Ticket } from '../services/tickets.service';
import { format } from 'date-fns';

export default function HomeScreen() {
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasPurchasedToday, setHasPurchasedToday] = useState(false);

  useEffect(() => {
    loadTicket();
  }, []);

  const loadTicket = async () => {
    try {
      setIsLoading(true);
      const response = await ticketsService.getMyTicket();
      if (response.success && response.data?.ticket) {
        setTicket(response.data.ticket);
        setHasPurchasedToday(true);
      } else {
        // Check for available ticket
        const availableResponse = await ticketsService.getAvailableTicket();
        if (availableResponse.success && availableResponse.data?.ticket) {
          setHasPurchasedToday(false);
        } else if (availableResponse.message?.includes('already purchased')) {
          setHasPurchasedToday(true);
        }
      }
    } catch (error: any) {
      console.error('Failed to load ticket:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error?.message || 'Failed to load ticket. Please check your connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    Alert.alert(
      'Purchase Ticket',
      'Are you sure you want to purchase today\'s ticket?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            try {
              setIsPurchasing(true);
              const response = await ticketsService.purchaseTicket();
              if (response.success) {
                setTicket(response.data.ticket);
                setHasPurchasedToday(true);
                Alert.alert('Success', 'Ticket purchased successfully!');
              }
            } catch (error: any) {
              Alert.alert(
                'Purchase Failed',
                error.response?.data?.error?.message || 'Failed to purchase ticket. Please try again.'
              );
            } finally {
              setIsPurchasing(false);
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTicket();
    setRefreshing(false);
  };

  if (isLoading === true) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const isToday = ticket
    ? format(new Date(ticket.generatedDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    : false;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        {hasPurchasedToday === false ? (
          <View style={styles.purchaseContainer}>
            <Text style={styles.title}>Available Ticket</Text>
            <Text style={styles.description}>
              You can purchase today's ticket. Each user can purchase one ticket per day.
            </Text>
            <TouchableOpacity
              style={[styles.purchaseButton, isPurchasing ? styles.buttonDisabled : null]}
              onPress={handlePurchase}
              disabled={!!isPurchasing}
            >
              {isPurchasing === true ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.purchaseButtonText}>Purchase Ticket</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : ticket !== null && ticket !== undefined ? (
          <View style={styles.ticketContainer}>
            {isToday === false ? (
              <View style={styles.expiredBanner}>
                <Text style={styles.expiredText}>⚠️ This ticket has expired</Text>
              </View>
            ) : null}
            <Text style={styles.ticketTitle}>Your Ticket</Text>
            <View style={styles.qrContainer}>
              {ticket.qrCodeData && String(ticket.qrCodeData).trim() !== '' ? (
                <QRCode
                  value={String(ticket.qrCodeData)}
                  size={250}
                  backgroundColor="#fff"
                  color="#000"
                />
              ) : (
                <ActivityIndicator size="large" color="#2563eb" />
              )}
            </View>
            <View style={styles.ticketInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>User ID:</Text>
                <Text style={styles.infoValue}>{user?.userId}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ticket ID:</Text>
                <Text style={styles.infoValue}>{ticket.ticketId}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>
                  {format(new Date(ticket.generatedDate), 'MMM dd, yyyy')}
                </Text>
              </View>
              {ticket.purchasedAt && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Purchased At:</Text>
                  <Text style={styles.infoValue}>
                    {format(new Date(ticket.purchasedAt), 'MMM dd, yyyy HH:mm')}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.validityBanner}>
              <Text style={styles.validityText}>
                ✓ This ticket is valid for today only
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noTicketContainer}>
            <Text style={styles.noTicketText}>No ticket available</Text>
            <Text style={styles.noTicketSubtext}>
              Please check back later or contact support.
            </Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  purchaseContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  purchaseButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  ticketContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  expiredBanner: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  expiredText: {
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '600',
  },
  ticketTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  ticketInfo: {
    width: '100%',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  validityBanner: {
    backgroundColor: '#d1fae5',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  validityText: {
    color: '#065f46',
    textAlign: 'center',
    fontWeight: '600',
  },
  noTicketContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  noTicketText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  noTicketSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

