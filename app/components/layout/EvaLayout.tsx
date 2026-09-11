'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MessageSquare, X, Menu } from 'lucide-react';
// We'll import the Chat components dynamically or just render them here if they are client components
import SidebarRooms from '@/app/components/chat/SidebarRooms';
import ChatWindow from '@/app/components/chat/ChatWindow';

// Lee `?chat=<roomId>` (agregado por ej. al crear una solicitud de recalificación)
// y le avisa a EvaLayout que abra el chat en esa sala, luego limpia la URL para
// que un refresh no la vuelva a abrir. Aislado en su propio componente + Suspense
// porque useSearchParams lo exige como buena práctica en el App Router.
function ChatAutoOpener({ onOpen }: { onOpen: (roomId: number) => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const chatParam = searchParams.get('chat');

  useEffect(() => {
    if (!chatParam) return;
    const roomId = parseInt(chatParam, 10);
    if (Number.isNaN(roomId)) return;

    onOpen(roomId);
    router.replace(pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatParam]);

  return null;
}

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
  const [unreadCount, setUnreadCount] = useState(0);
  const [availableRoles, setAvailableRoles] = useState<{name: string, href: string}[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    // Fetch user's extra roles (Inspector, Rector)
    fetch('/api/user/roles').then(res => res.json()).then(data => {
      if (data.roles) setAvailableRoles(data.roles);
    });

    // Fetch unread messages count initially and every 30 seconds
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/chat/unread');
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (err) {}
    };
    
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  // When chat is open, we can optionally re-fetch or clear if they view a room
  useEffect(() => {
    if (isChatOpen && selectedRoomId) {
      // Small timeout to allow the chat window to mark as read
      setTimeout(async () => {
        try {
          const res = await fetch('/api/chat/unread');
          if (res.ok) {
            const data = await res.json();
            setUnreadCount(data.unreadCount || 0);
          }
        } catch (err) {}
      }, 2000);
    }
  }, [selectedRoomId, isChatOpen]);

  const navLinks = {
    admin: [
      { name: 'Inicio', href: '/admin' },
      { name: 'Estudiantes', href: '/admin/estudiantes' },
      { name: 'Profesores', href: '/admin/profesores' },
      { name: 'Matriculación', href: '/admin/matriculacion' },
      { name: 'Horarios', href: '/admin/horarios' },
    ],
    profesor: [
      { name: 'Inicio', href: '/profesor' },
      { name: 'Horario', href: '/profesor/horario' },
      { name: 'Mis Tareas', href: '/profesor/tareas' },
      { name: 'Calificaciones', href: '/profesor/calificaciones' },
      { name: 'Recalificaciones', href: '/profesor/recalificaciones' },
      { name: 'Nómina / Sueldos', href: '/profesor/sueldos' },
    ],
    alumno: [
      { name: 'Inicio', href: '/alumno' },
      { name: 'Horario', href: '/alumno/horario' },
      { name: 'Mis Tareas', href: '/alumno/tareas' },
      { name: 'Mis Notas', href: '/alumno/notas' },
      { name: 'Recalificaciones', href: '/alumno/recalificaciones' },
      { name: 'Pagos y Pensiones', href: '/alumno/pagos' },
    ],
    rector: [
      { name: 'Inicio', href: '/rector' },
      { name: 'Gestión de Horarios', href: '/admin/horarios' },
      { name: 'Asignación de Cursos', href: '/admin/cursos' },
    ],
    inspector: [
      { name: 'Inicio', href: '/inspector' },
    ],
  }[userRole] || [];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6f8]">
      <Suspense fallback={null}>
        <ChatAutoOpener
          onOpen={(roomId) => {
            setSelectedRoomId(roomId);
            setIsChatOpen(true);
          }}
        />
      </Suspense>

      {/* Top Navbar PUCE Style */}
      <header className="fixed top-0 inset-x-0 h-16 flex items-center justify-between bg-[#004a8f] text-white px-4 sm:px-6 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <button className="text-white hover:bg-white/10 p-2 rounded-md transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="h-6 w-6" />
          </button>
          <Link href={`/${userRole}`} className="text-lg font-bold tracking-wide hover:text-gray-200 transition-colors">
            EVA COLEGIOS
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="relative flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-medium transition-colors"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="hidden sm:inline">Mensajes</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-[#004a8f]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <Link href={`/${userRole}/perfil`} className="h-8 w-8 rounded-full bg-white text-[#004a8f] flex items-center justify-center font-bold text-sm hover:ring-2 hover:ring-white transition-all cursor-pointer">
            {userName.charAt(0)}
          </Link>
        </div>
      </header>

      {/* Sidebar Izquierdo (Menú) - Ahora debajo del navbar */}
      <aside className={`fixed inset-y-0 top-16 left-0 z-40 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out md:relative md:top-0 md:mt-16 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navLinks.map((link) => {
              const isBaseRolePath = ['/admin', '/profesor', '/alumno', '/inspector', '/rector'].includes(link.href);
              const isActive = isBaseRolePath 
                ? pathname === link.href 
                : (pathname === link.href || pathname.startsWith(link.href + '/'));
              
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
            
            {/* Cambio de Rol (Si aplica) */}
            {availableRoles.length > 1 && (
              <div className="pt-6 mt-6 border-t border-gray-200">
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cambiar Perfil</p>
                {availableRoles.map(r => (
                  <Link
                    key={r.name}
                    href={r.href}
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    {r.name}
                  </Link>
                ))}
              </div>
            )}
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

      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-30 bg-gray-900/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

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
