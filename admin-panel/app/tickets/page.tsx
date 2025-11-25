'use client';

import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ticketsService, Ticket } from '@/lib/services/tickets.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search } from 'lucide-react';
import { format } from 'date-fns';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'purchased' | 'used'>('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, dateFilter]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: 1,
        limit: 100,
      };
      // Only add date filter if a date is selected
      if (dateFilter) {
        params.date = dateFilter;
      }
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      console.log('Fetching tickets with params:', params);
      const response = await ticketsService.getTickets(params);
      console.log('Tickets response:', response);
      
      if (response && response.success) {
        const ticketsData = response.data?.tickets || response.tickets || [];
        console.log('Loaded tickets:', ticketsData.length);
        setTickets(ticketsData);
      } else {
        console.error('Failed to fetch tickets - response not successful:', response);
        setTickets([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch tickets - error details:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.error?.message || error.message || 'Failed to load tickets. Please try again.');
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.purchasedBy && ticket.purchasedBy.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'purchased':
        return 'bg-blue-100 text-blue-800';
      case 'used':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Manage Tickets
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-100 p-6 mb-6 transition-all duration-300">
          <div className="flex flex-wrap items-end gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search by ticket ID or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="purchased">Purchased</option>
                <option value="used">Used</option>
              </select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date (Optional)</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="All dates"
                className="h-10"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Ticket ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Purchased By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Generated Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Purchased At
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Used At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.ticketId} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 hover:shadow-sm">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {ticket.ticketId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            ticket.status
                          )}`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.purchasedBy || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(ticket.generatedDate), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.purchasedAt
                          ? format(new Date(ticket.purchasedAt), 'MMM dd, yyyy HH:mm')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.usedAt ? format(new Date(ticket.usedAt), 'MMM dd, yyyy HH:mm') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTickets.length === 0 && (
                <div className="text-center py-12 text-gray-500">No tickets found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

