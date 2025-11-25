'use client';

import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ticketsService } from '@/lib/services/tickets.service';
import { usersService } from '@/lib/services/users.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { format, subDays } from 'date-fns';
import { BarChart3, TrendingUp, Users, Ticket, Filter } from 'lucide-react';

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });
  const [localDateRange, setLocalDateRange] = useState(dateRange);

  // Initial load
  useEffect(() => {
    fetchReports();
  }, []);

  const handleApplyFilter = () => {
    setDateRange(localDateRange);
    fetchReports();
  };

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      // Fetch tickets without date filter to get all tickets statistics
      // The date range can be used for filtering in the future if needed
      const [ticketsResponse, usersResponse, dashboardResponse] = await Promise.all([
        ticketsService.getTickets({ limit: 1000 }), // Get all tickets for statistics
        usersService.getUsers(),
        ticketsService.getDashboardStats(),
      ]);

      console.log('Tickets Response:', ticketsResponse);
      console.log('Users Response:', usersResponse);
      console.log('Dashboard Response:', dashboardResponse);

      // Handle different response structures
      const ticketsData = ticketsResponse?.data || ticketsResponse;
      const usersData = usersResponse?.data || usersResponse;
      const dashboardData = dashboardResponse?.data || dashboardResponse;

      console.log('Processed Tickets Data:', ticketsData);
      console.log('Tickets Statistics:', ticketsData?.statistics);

      setStats({
        tickets: ticketsData,
        users: usersData,
        dashboard: dashboardData,
      });
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        {isLoading && (
          <div className="fixed top-20 right-6 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span className="text-sm font-medium">Loading data...</span>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Reports & History
          </h1>
          <div className="flex flex-wrap items-end gap-4">
            <Input
              type="date"
              label="Start Date"
              value={localDateRange.start}
              onChange={(e) => setLocalDateRange({ ...localDateRange, start: e.target.value })}
              className="min-w-[180px]"
              placeholder="YYYY-MM-DD"
            />
            <Input
              type="date"
              label="End Date"
              value={localDateRange.end}
              onChange={(e) => setLocalDateRange({ ...localDateRange, end: e.target.value })}
              className="min-w-[180px]"
              placeholder="YYYY-MM-DD"
            />
            <Button
              onClick={handleApplyFilter}
              variant="primary"
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:via-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Filter className="relative z-10 mr-2 group-hover:rotate-12 transition-transform duration-300" size={20} />
              <span className="relative z-10 font-bold">Apply Filter</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1 transform group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2 font-medium">Total Tickets Today</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
                  {stats?.dashboard?.totalTickets || 0}
                </p>
              </div>
              <div className="bg-blue-500 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Ticket className="text-white" size={28} />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1 transform group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2 font-medium">Total Users</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
                  {stats?.users?.total || 0}
                </p>
              </div>
              <div className="bg-green-500 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="text-white" size={28} />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1 transform group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2 font-medium">Purchased</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
                  {stats?.tickets?.statistics?.purchased || 0}
                </p>
              </div>
              <div className="bg-yellow-500 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="text-white" size={28} />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1 transform group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2 font-medium">Used</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
                  {stats?.tickets?.statistics?.used || 0}
                </p>
              </div>
              <div className="bg-purple-500 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="text-white" size={28} />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ticket Statistics Card */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl p-6 border border-gray-100 transition-all duration-300 hover:-translate-y-1 transform">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-xl shadow-lg">
                <Ticket className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Ticket Statistics</h2>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="bg-green-500 rounded-full w-2 h-2"></span>
                    Available
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {stats?.tickets?.statistics?.available ?? 
                     stats?.tickets?.data?.statistics?.available ?? 
                     stats?.dashboard?.availableTickets ?? 
                     0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 shadow-md"
                    style={{
                      width: `${
                        (() => {
                          const total = stats?.tickets?.total ?? 
                                       stats?.tickets?.data?.total ?? 
                                       stats?.dashboard?.totalTickets ?? 
                                       0;
                          const available = stats?.tickets?.statistics?.available ?? 
                                          stats?.tickets?.data?.statistics?.available ?? 
                                          stats?.dashboard?.availableTickets ?? 
                                          0;
                          return total > 0 ? Math.max((available / total) * 100, 2) : 0;
                        })()
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="bg-yellow-500 rounded-full w-2 h-2"></span>
                    Purchased
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {stats?.tickets?.statistics?.purchased ?? 
                     stats?.tickets?.data?.statistics?.purchased ?? 
                     stats?.dashboard?.purchasedTickets ?? 
                     0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500 shadow-md"
                    style={{
                      width: `${
                        (() => {
                          const total = stats?.tickets?.total ?? 
                                       stats?.tickets?.data?.total ?? 
                                       stats?.dashboard?.totalTickets ?? 
                                       0;
                          const purchased = stats?.tickets?.statistics?.purchased ?? 
                                          stats?.tickets?.data?.statistics?.purchased ?? 
                                          stats?.dashboard?.purchasedTickets ?? 
                                          0;
                          return total > 0 ? Math.max((purchased / total) * 100, 2) : 0;
                        })()
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="bg-purple-500 rounded-full w-2 h-2"></span>
                    Used
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {stats?.tickets?.statistics?.used ?? 
                     stats?.tickets?.data?.statistics?.used ?? 
                     stats?.dashboard?.usedTickets ?? 
                     0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-md"
                    style={{
                      width: `${
                        (() => {
                          const total = stats?.tickets?.total ?? 
                                       stats?.tickets?.data?.total ?? 
                                       stats?.dashboard?.totalTickets ?? 
                                       0;
                          const used = stats?.tickets?.statistics?.used ?? 
                                      stats?.tickets?.data?.statistics?.used ?? 
                                      stats?.dashboard?.usedTickets ?? 
                                      0;
                          return total > 0 ? Math.max((used / total) * 100, 2) : 0;
                        })()
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* User Statistics Card */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl p-6 border border-gray-100 transition-all duration-300 hover:-translate-y-1 transform">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl shadow-lg">
                <Users className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">User Statistics</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold flex items-center gap-2">
                    <span className="bg-blue-500 rounded-full w-2 h-2"></span>
                    Total Users
                  </span>
                  <span className="text-2xl font-bold text-blue-600">{stats?.users?.total || 0}</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold flex items-center gap-2">
                    <span className="bg-green-500 rounded-full w-2 h-2"></span>
                    Active Users
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {stats?.users?.users?.filter((u: any) => u.isActive).length || 0}
                  </span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold flex items-center gap-2">
                    <span className="bg-orange-500 rounded-full w-2 h-2"></span>
                    Staff Members
                  </span>
                  <span className="text-2xl font-bold text-orange-600">
                    {stats?.users?.users?.filter((u: any) => u.role === 'staff').length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

