'use client';

import React, { useState } from 'react';
import SidebarRooms from '@/app/components/chat/SidebarRooms';
import ChatWindow from '@/app/components/chat/ChatWindow';

export default function ChatPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  
  // Hardcoded for testing since we don't have auth context connected here yet
  const currentUserId = 1; 

  return (
    <div className="flex h-screen bg-gray-100 p-4">
      <div className="flex w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border">
        <SidebarRooms 
          currentUserId={currentUserId} 
          onSelectRoom={setSelectedRoomId} 
          selectedRoomId={selectedRoomId || undefined} 
        />
        
        <div className="flex-1">
          {selectedRoomId ? (
            <ChatWindow roomId={selectedRoomId} currentUserId={currentUserId} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-gray-50">
              <p className="text-lg mb-2">Selecciona un chat para comenzar a enviar mensajes</p>
              <p className="text-sm">Puedes comunicarte con profesores y grupos asignados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
