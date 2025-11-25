'use client';

import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ticketsService, DashboardStats } from '@/lib/services/tickets.service';
import { Ticket, Users, CheckCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await ticketsService.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      title: 'Total Tickets Today',
      value: stats?.totalTickets || 0,
      icon: Ticket,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
    },
    {
      title: 'Available',
      value: stats?.availableTickets || 0,
      icon: Clock,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      iconBg: 'bg-green-500',
    },
    {
      title: 'Purchased',
      value: stats?.purchasedTickets || 0,
      icon: Users,
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-50 to-orange-100',
      iconBg: 'bg-yellow-500',
    },
    {
      title: 'Used',
      value: stats?.usedTickets || 0,
      icon: CheckCircle,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
    },
  ];

  return (
    <Layout>
      <div className="animate-fade-in">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1 transform group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2 font-medium">{stat.title}</p>
                    <p className="text-4xl font-bold bg-gradient-to-r text-gray-900 group-hover:scale-105 transition-transform duration-300">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.iconBg} p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white" size={28} />
                  </div>
                </div>
                <div className={`mt-4 h-1 bg-gradient-to-r ${stat.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl p-6 border border-gray-100 transition-all duration-300 hover:-translate-y-1 transform">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
              System Overview
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <span className="text-gray-700 font-medium">Total Users</span>
                <span className="font-bold text-lg text-blue-600">{stats?.totalUsers || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <span className="text-gray-700 font-medium">Scans Today</span>
                <span className="font-bold text-lg text-green-600">{stats?.scanLogsToday || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl p-6 border border-gray-100 transition-all duration-300 hover:-translate-y-1 transform">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <a
                href="/tickets/generate"
                className="block w-full text-left px-5 py-3 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-300 hover:shadow-md hover:scale-105 transform font-medium"
              >
                ✨ Generate New Tickets
              </a>
              <a
                href="/users"
                className="block w-full text-left px-5 py-3 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-300 hover:shadow-md hover:scale-105 transform font-medium"
              >
                👤 Create New User
              </a>
              <a
                href="/tickets"
                className="block w-full text-left px-5 py-3 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-300 hover:shadow-md hover:scale-105 transform font-medium"
              >
                📋 View All Tickets
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

