import api from '../config/api';

export interface ValidationResponse {
  success: boolean;
  data?: {
    ticket: {
      ticketId: string;
      userId: string;
      purchasedAt: string;
    };
  };
  error?: {
    message: string;
    code: string;
  };
}

export interface ScanLog {
  logId: string;
  ticketId: string;
  scannedBy: string;
  scanTime: string;
  scanResult: 'success' | 'already_used' | 'invalid' | 'expired';
  userIdFromQR: string;
  ticket?: {
    ticketId: string;
    owner: {
      userId: string;
      name: string;
    } | null;
  };
  scanner?: {
    userId: string;
    name: string | null;
  };
}

export interface ScanLogsResponse {
  success: boolean;
  data: {
    logs: ScanLog[];
    statistics: {
      total: number;
      successful: number;
      failed: number;
    };
  };
}

export const scannerService = {
  validateTicket: async (qrCodeData: string): Promise<ValidationResponse> => {
    const response = await api.post<ValidationResponse>('/scanner/validate', {
      qrCodeData,
    });
    return response.data;
  },

  getScanLogs: async (params?: {
    date?: string;
    result?: string;
    limit?: number;
  }): Promise<ScanLogsResponse> => {
    const response = await api.get<ScanLogsResponse>('/scanner/logs', { params });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/scanner/stats');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/scanner/me');
    return response.data;
  },
};

