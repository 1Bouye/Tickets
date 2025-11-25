'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ticketsService } from '@/lib/services/tickets.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ticket, CheckCircle } from 'lucide-react';

const generateSchema = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1').max(10000, 'Quantity cannot exceed 10000'),
});

type GenerateFormData = z.infer<typeof generateSchema>;

export default function GenerateTicketsPage() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [lastGenerated, setLastGenerated] = useState<{ quantity: number; timestamp: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<GenerateFormData>({
    resolver: zodResolver(generateSchema),
  });

  const onSubmit = async (data: GenerateFormData) => {
    try {
      const response = await ticketsService.generateTickets({ quantity: data.quantity });
      if (response.success) {
        setToast({
          message: `Successfully generated ${data.quantity} tickets for today!`,
          type: 'success',
        });
        setLastGenerated({
          quantity: data.quantity,
          timestamp: new Date().toLocaleString(),
        });
        reset();
      }
    } catch (error: any) {
      setToast({
        message: error.response?.data?.error?.message || 'Failed to generate tickets',
        type: 'error',
      });
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8">
          Generate Tickets
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl border border-gray-100 p-8 transition-all duration-300 transform hover:-translate-y-1">
              {/* Header with Icon */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                  <Ticket className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create Daily Tickets</h2>
                  <p className="text-sm text-gray-500 mt-1">Generate tickets for today's events</p>
                </div>
              </div>

              <p className="text-gray-700 mb-8 leading-relaxed">
                Generate a batch of tickets for today. These tickets will be available for users to purchase and use immediately.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Number of Tickets"
                  type="number"
                  {...register('quantity', { valueAsNumber: true })}
                  error={errors.quantity?.message}
                  placeholder="e.g., 1000"
                />

                <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 border-2 border-yellow-300 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-500 rounded-full p-1.5 mt-0.5">
                      <span className="text-white text-lg">⚠️</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-yellow-900 mb-1">Important Note</p>
                      <p className="text-sm text-yellow-800 leading-relaxed">
                        Tickets generated today will expire at midnight. Make sure to generate enough tickets for the day to meet demand.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:via-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                    isLoading={isSubmitting}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Ticket className="relative z-10 mr-2 group-hover:rotate-12 transition-transform duration-300" size={22} />
                    <span className="relative z-10 font-bold">Generate Tickets</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Information Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Information</h3>
              </div>
              
              <div className="space-y-5">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="bg-blue-500 rounded-full w-2 h-2"></span>
                    Ticket Format
                  </p>
                  <p className="text-base font-mono font-bold bg-white px-4 py-3 rounded-lg border-2 border-gray-300 shadow-sm text-gray-900">
                    TKT-YYYYMMDD-####
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 hover:shadow-md transition-shadow duration-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="bg-green-500 rounded-full w-2 h-2"></span>
                    Initial Status
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-green-500 text-white text-sm font-bold rounded-full shadow-sm">
                      Available
                    </span>
                    <span className="text-sm text-gray-700">All tickets start as available</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-200 hover:shadow-md transition-shadow duration-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="bg-orange-500 rounded-full w-2 h-2"></span>
                    Daily Reset
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    Tickets expire at <span className="font-bold text-orange-600">midnight</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">New tickets must be generated daily</p>
                </div>
              </div>

              {lastGenerated && (
                <div className="mt-6 pt-6 border-t-2 border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-green-500 rounded-full p-2">
                      <CheckCircle className="text-white" size={20} />
                    </div>
                    <span className="font-bold text-green-900">Last Generated</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white rounded-lg px-4 py-3 border-2 border-green-300 shadow-sm">
                      <p className="text-2xl font-bold text-gray-900">
                        {lastGenerated.quantity}
                      </p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Tickets</p>
                    </div>
                    <p className="text-xs text-gray-600 font-medium flex items-center gap-2">
                      <span>🕐</span>
                      {lastGenerated.timestamp}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </Layout>
  );
}

