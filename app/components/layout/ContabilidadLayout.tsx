'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, DollarSign, Settings } from 'lucide-react';
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
    <div className="portal-shell flex h-screen bg-gray-100">
      <aside className={`portal-sidebar fixed inset-y-0 left-0 z-40 w-64 bg-brand-900 text-gray-300 transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center px-6 bg-brand-950">
          <Link href="/contabilidad" className="portal-brand text-white">Colegio Militar <span> / EVA</span></Link>
        </div>
        
        <div className="px-6 py-4 border-b border-brand-800">
          <p className="text-xs text-brand-400 uppercase font-semibold">Contabilidad</p>
          <p className="text-sm text-white font-medium truncate">{userName}</p>
        </div>

        <nav className="p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-600 text-white' : 'hover:bg-brand-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-brand-800 bg-brand-900">
           <form action="/api/logout" method="POST">
             <button type="submit" className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-brand-200 hover:text-white hover:bg-brand-800 rounded-lg transition-colors">
               <Settings className="w-5 h-5" />
               Cerrar Sesión
             </button>
           </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="portal-topbar flex h-16 items-center justify-between bg-white px-6 border-b border-gray-200">
          <button aria-label="Abrir menú de contabilidad" aria-expanded={isSidebarOpen} className="md:hidden text-white" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
             <span className="text-sm font-semibold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">Módulo Contable</span>
          </div>
        </header>

        <main className="portal-content flex-1 overflow-y-auto p-6 lg:p-10">
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
