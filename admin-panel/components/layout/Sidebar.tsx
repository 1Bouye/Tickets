'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  Ticket,
  FileText,
  LogOut,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tickets/generate', label: 'Generate Tickets', icon: Ticket },
  { href: '/tickets', label: 'Manage Tickets', icon: Ticket },
  { href: '/users', label: 'Manage Users', icon: Users },
  { href: '/reports', label: 'Reports', icon: FileText },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white min-h-screen flex flex-col shadow-2xl">
      <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="flex justify-center mb-4">
          <div className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300">
            <Image
              src="/university-logo.png"
              alt="University Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
        </div>
        <h1 className="text-xl font-bold text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Ticket System
        </h1>
        <p className="text-sm text-gray-400 mt-1 text-center font-medium">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            
            // More precise active state checking to avoid conflicts
            let isActive = false;
            if (item.href === '/tickets') {
              // "Manage Tickets" should only be active for /tickets, not /tickets/generate
              isActive = pathname === '/tickets' || (pathname?.startsWith('/tickets/') && !pathname?.startsWith('/tickets/generate'));
            } else if (item.href === '/tickets/generate') {
              // "Generate Tickets" should only be active for /tickets/generate
              isActive = pathname === '/tickets/generate' || pathname?.startsWith('/tickets/generate/');
            } else {
              // For other routes, use standard matching
              isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            }
            
            // Different hover colors for different buttons
            const getHoverClass = (label: string) => {
              if (isActive) return 'bg-blue-600 text-white';
              
              switch (label) {
                case 'Dashboard':
                  return 'text-gray-300 hover:bg-blue-500 hover:text-white';
                case 'Generate Tickets':
                  return 'text-gray-300 hover:bg-green-600 hover:text-white';
                case 'Manage Tickets':
                  return 'text-gray-300 hover:bg-purple-600 hover:text-white';
                case 'Manage Users':
                  return 'text-gray-300 hover:bg-orange-600 hover:text-white';
                case 'Reports':
                  return 'text-gray-300 hover:bg-indigo-600 hover:text-white';
                default:
                  return 'text-gray-300 hover:bg-gray-800 hover:text-white';
              }
            };
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${getHoverClass(item.label)}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700 bg-gradient-to-t from-gray-800 to-gray-900">
        <div className="mb-4 px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-700 shadow-inner">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Logged in as</p>
          <p className="font-bold text-white">{user?.name || user?.userId}</p>
          {user?.name && (
            <p className="text-xs text-gray-400 mt-1">ID: {user?.userId}</p>
          )}
          {user?.role === 'admin' && (
            <span className="inline-block mt-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white">
              Admin
            </span>
          )}
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-gray-300 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-red-600 hover:to-red-700 hover:text-white transition-all duration-300 hover:scale-105 transform shadow-md hover:shadow-lg font-medium"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

