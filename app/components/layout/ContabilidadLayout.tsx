'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, DollarSign, Users, Briefcase, Settings } from 'lucide-react';
import ChatWidget from '@/app/components/chat/ChatWidget';

export default function ContabilidadLayout({
  children,
  userName,
  userId,
}: {
  children: React.ReactNode;
  userName: string;
  userId: number;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Dashboard', href: '/contabilidad', icon: DollarSign },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-emerald-900 text-gray-300 transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center px-6 bg-emerald-950">
          <span className="text-xl font-bold text-white">ERP Financiero</span>
        </div>
        
        <div className="px-6 py-4 border-b border-emerald-800">
          <p className="text-xs text-emerald-400 uppercase font-semibold">Contabilidad</p>
          <p className="text-sm text-white font-medium truncate">{userName}</p>
        </div>

        <nav className="p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-emerald-800 bg-emerald-900">
           <form action="/api/logout" method="POST">
             <button type="submit" className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors">
               <Settings className="w-5 h-5" />
               Cerrar Sesión
             </button>
           </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between bg-white px-6 border-b border-gray-200">
          <button className="md:hidden text-gray-600" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
             <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">Módulo Contable</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 bg-gray-900/50 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <ChatWidget currentUserId={userId} />
    </div>
  );
}
