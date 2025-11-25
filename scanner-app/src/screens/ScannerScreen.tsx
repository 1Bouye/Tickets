import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { scannerService } from '../services/scanner.service';
// Icons will be rendered as text/emoji for React Native compatibility

interface ScanResult {
  type: 'success' | 'error';
  message: string;
  ticketData?: {
    ticketId: string;
    userId: string;
    purchasedAt: string;
  };
}

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (isValidating || !isScanning) return;

    try {
      setIsScanning(false);
      setIsValidating(true);

      const response = await scannerService.validateTicket(data);

      if (response.success && response.data) {
        // Success
        Vibration.vibrate(200);
        setScanResult({
          type: 'success',
          message: 'Valid Ticket',
          ticketData: response.data.ticket,
        });
      } else {
        // Error
        Vibration.vibrate([0, 100, 50, 100]);
        setScanResult({
          type: 'error',
          message: response.error?.message || 'Invalid ticket',
        });
      }
    } catch (error: any) {
      Vibration.vibrate([0, 100, 50, 100]);
      setScanResult({
        type: 'error',
        message: error.response?.data?.error?.message || 'Validation failed',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleNext = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (scanResult) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.resultContainer,
            scanResult.type === 'success' ? styles.successContainer : styles.errorContainer,
          ]}
        >
          <Text style={styles.iconText}>
            {scanResult.type === 'success' ? '✓' : '✗'}
          </Text>
          <Text
            style={[
              styles.resultTitle,
              scanResult.type === 'success' ? styles.successText : styles.errorText,
            ]}
          >
            {scanResult.type === 'success' ? 'Valid Ticket' : 'Deny Entry'}
          </Text>
          <Text style={styles.resultMessage}>{scanResult.message}</Text>

          {scanResult.ticketData && (
            <View style={styles.ticketInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>User ID:</Text>
                <Text style={styles.infoValue}>{scanResult.ticketData.userId}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ticket ID:</Text>
                <Text style={styles.infoValue}>{scanResult.ticketData.ticketId}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next Scan</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.corner} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.instructionText}>Point camera at QR code</Text>
          {isValidating && (
            <View style={styles.validatingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.validatingText}>Validating...</Text>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderColor: '#2563eb',
    top: -2,
    left: -2,
  },
  topRight: {
    top: -2,
    right: -2,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 4,
  },
  bottomLeft: {
    top: 'auto',
    bottom: -2,
    left: -2,
    borderTopWidth: 0,
    borderBottomWidth: 4,
  },
  bottomRight: {
    top: 'auto',
    bottom: -2,
    right: -2,
    left: 'auto',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  instructionText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 30,
    fontWeight: '600',
  },
  validatingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  validatingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  permissionText: {
    fontSize: 18,
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successContainer: {
    backgroundColor: '#d1fae5',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  successText: {
    color: '#065f46',
  },
  errorText: {
    color: '#991b1b',
  },
  resultMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    color: '#374151',
  },
  iconText: {
    fontSize: 80,
    fontWeight: 'bold',
  },
  ticketInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
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
  nextButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    paddingHorizontal: 48,
    marginTop: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

