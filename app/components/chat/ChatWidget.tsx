'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import SidebarRooms from './SidebarRooms';
import ChatWindow from './ChatWindow';

export default function ChatWidget({ currentUserId }: { currentUserId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function checkUnread() {
      try {
        const res = await fetch('/api/chat/unread');
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (e) {
        // ignore
      }
    }
    checkUnread();
    
    // Poll every 30s
    const interval = setInterval(checkUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen && selectedRoomId) {
      setTimeout(async () => {
        try {
          const res = await fetch('/api/chat/unread');
          if (res.ok) {
            const data = await res.json();
            setUnreadCount(data.unreadCount || 0);
          }
        } catch (e) {}
      }, 2000);
    }
  }, [isOpen, selectedRoomId]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-indigo-600 p-4 text-white shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105"
      >
        <MessageSquare className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b bg-gray-50 px-4">
          <h2 className="text-lg font-semibold text-gray-900">Mensajes</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {!selectedRoomId ? (
            <SidebarRooms
              currentUserId={currentUserId}
              onSelectRoom={setSelectedRoomId}
            />
          ) : (
            <div className="flex flex-col h-full">
              <div className="bg-gray-100 p-2 text-sm border-b">
                <button onClick={() => setSelectedRoomId(null)} className="text-indigo-600 hover:text-indigo-800 font-medium">
                  &larr; Volver a salas
                </button>
              </div>
              <ChatWindow
                roomId={selectedRoomId}
                currentUserId={currentUserId}
              />
            </div>
          )}
        </div>
      </aside>

      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
