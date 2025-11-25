import api from '../api';

export interface Ticket {
  ticketId: string;
  qrCodeData: string;
  generatedDate: string;
  generatedTime: string;
  status: 'available' | 'purchased' | 'used';
  purchasedBy?: string;
  purchasedAt?: string;
  usedAt?: string;
  scannedBy?: string;
}

export interface GenerateTicketsData {
  quantity: number;
}

export interface TicketsResponse {
  success: boolean;
  data: {
    tickets: Ticket[];
    total: number;
    statistics: {
      available: number;
      purchased: number;
      used: number;
    };
  };
}

export interface DashboardStats {
  success: boolean;
  data: {
    totalTickets: number;
    availableTickets: number;
    purchasedTickets: number;
    usedTickets: number;
    totalUsers: number;
    scanLogsToday: number;
  };
}

export const ticketsService = {
  generateTickets: async (data: GenerateTicketsData) => {
    const response = await api.post('/admin/tickets/generate', data);
    return response.data;
  },

  getTickets: async (params?: {
    date?: string;
    status?: 'available' | 'purchased' | 'used';
    page?: number;
    limit?: number;
  }): Promise<TicketsResponse> => {
    const response = await api.get<TicketsResponse>('/admin/tickets', { params });
    return response.data;
  },

  getTicket: async (ticketId: string) => {
    const response = await api.get(`/admin/tickets/${ticketId}`);
    return response.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/admin/dashboard/stats');
    return response.data;
  },
};

