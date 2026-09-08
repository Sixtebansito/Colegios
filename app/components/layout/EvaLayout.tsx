'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, X, Menu } from 'lucide-react';
// We'll import the Chat components dynamically or just render them here if they are client components
import SidebarRooms from '@/app/components/chat/SidebarRooms';
import ChatWindow from '@/app/components/chat/ChatWindow';

export default function EvaLayout({
  children,
  userRole,
  userName,
  userId,
}: {
  children: React.ReactNode;
  userRole: string; // 'admin', 'profesor', 'alumno'
  userName: string;
  userId: number;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const pathname = usePathname();

  const navLinks = {
    admin: [
      { name: 'Inicio', href: '/admin' },
      { name: 'Estudiantes', href: '/admin/estudiantes' },
      { name: 'Profesores', href: '/admin/profesores' },
      { name: 'Matriculación', href: '/admin/matriculacion' },
    ],
    profesor: [
      { name: 'Inicio', href: '/profesor' },
      { name: 'Mis Tareas', href: '/profesor/tareas' },
      { name: 'Calificaciones', href: '/profesor/calificaciones' },
    ],
    alumno: [
      { name: 'Inicio', href: '/alumno' },
      { name: 'Mis Tareas', href: '/alumno/tareas' },
      { name: 'Mis Notas', href: '/alumno/notas' },
    ],
  }[userRole] || [];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6f8]">
      {/* Top Navbar PUCE Style */}
      <header className="fixed top-0 inset-x-0 h-16 flex items-center justify-between bg-[#004a8f] text-white px-4 sm:px-6 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <button className="text-white hover:bg-white/10 p-2 rounded-md transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-lg font-bold tracking-wide">PUCE EVA</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-medium transition-colors"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="hidden sm:inline">Mensajes</span>
          </button>
          <div className="h-8 w-8 rounded-full bg-white text-[#004a8f] flex items-center justify-center font-bold text-sm">
            {userName.charAt(0)}
          </div>
        </div>
      </header>

      {/* Sidebar Izquierdo (Menú) - Ahora debajo del navbar */}
      <aside className={`fixed inset-y-0 top-16 left-0 z-40 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out md:relative md:top-0 md:mt-16 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-[#e6f0fa] text-[#004a8f] font-bold border-l-4 border-[#004a8f]' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            {/* Botón de Chat en el Sidebar */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="w-full text-left group flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Chat de la Plataforma
            </button>
          </nav>

          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500 uppercase mt-1">{userRole}</p>
            <form action="/api/logout" method="POST" className="mt-4">
              <button type="submit" className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors">
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden pt-16">
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Sidebar Derecho (Chat Global) */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          isChatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b bg-gray-50 px-4">
          <h2 className="text-lg font-semibold text-gray-900">Mensajes</h2>
          <button onClick={() => setIsChatOpen(false)} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {!selectedRoomId ? (
            <SidebarRooms
              currentUserId={userId}
              onSelectRoom={setSelectedRoomId}
            />
          ) : (
            <div className="flex flex-col h-full">
              <div className="bg-gray-100 p-2 text-sm">
                <button onClick={() => setSelectedRoomId(null)} className="text-indigo-600 hover:underline">
                  &larr; Volver a salas
                </button>
              </div>
              <ChatWindow
                roomId={selectedRoomId}
                currentUserId={userId}
              />
            </div>
          )}
        </div>
      </aside>

      {/* Overlay para móviles */}
      {(isMobileMenuOpen || isChatOpen) && (
        <div 
          className="fixed inset-0 z-30 bg-gray-900/50 md:hidden" 
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsChatOpen(false);
          }}
        />
      )}
    </div>
  );
}
