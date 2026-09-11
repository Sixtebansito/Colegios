'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ChatWidget from '@/app/components/chat/ChatWidget';
import { Menu, X, Users, GraduationCap, LayoutDashboard, Database, Settings, Calendar } from 'lucide-react';

export default function AdminLayout({
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
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Estudiantes', href: '/admin/estudiantes', icon: GraduationCap },
    { name: 'Profesores', href: '/admin/profesores', icon: Users },
    { name: 'Horarios', href: '/admin/horarios', icon: Calendar },
    { name: 'Matriculación', href: '/admin/matriculacion', icon: Database },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Admin (Oscuro, diferente al EVA) */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-gray-300 transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center px-6 bg-gray-950">
          <span className="text-xl font-bold text-white">ERP Colegios</span>
        </div>
        
        <div className="px-6 py-4 border-b border-gray-800">
          <p className="text-xs text-gray-500 uppercase font-semibold">Administrador</p>
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
                  isActive ? 'bg-indigo-600 text-white' : 'hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800 bg-gray-900">
           <form action="/api/logout" method="POST">
             <button type="submit" className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
               <Settings className="w-5 h-5" />
               Cerrar Sesión
             </button>
           </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between bg-white px-6 border-b border-gray-200">
          <button className="md:hidden text-gray-600" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
             <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">Modo Administración</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 bg-gray-900/50 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Floating Chat Widget */}
      <ChatWidget currentUserId={userId} />
    </div>
  );
}
