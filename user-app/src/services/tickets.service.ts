import api from '../config/api';

export interface Ticket {
  ticketId: string;
  qrCodeData: string;
  generatedDate: string;
  generatedTime: string;
  status: 'available' | 'purchased' | 'used';
  purchasedBy?: string;
  purchasedAt?: string;
  usedAt?: string;
}

export interface AvailableTicketResponse {
  success: boolean;
  data?: {
    ticket: Ticket;
    message?: string;
  };
  message?: string;
}

export interface PurchaseTicketResponse {
  success: boolean;
  data: {
    ticket: Ticket;
  };
  message?: string;
}

export const ticketsService = {
  getAvailableTicket: async (): Promise<AvailableTicketResponse> => {
    const response = await api.get<AvailableTicketResponse>('/user/tickets/available');
    return response.data;
  },

  purchaseTicket: async (ticketId?: string): Promise<PurchaseTicketResponse> => {
    const response = await api.post<PurchaseTicketResponse>('/user/tickets/purchase', {
      ticketId,
    });
    return response.data;
  },

  getMyTicket: async () => {
    const response = await api.get('/user/tickets/my-ticket');
    return response.data;
  },

  getTicketHistory: async (limit: number = 10) => {
    const response = await api.get('/user/tickets/history', {
      params: { limit },
    });
    return response.data;
  },
};

