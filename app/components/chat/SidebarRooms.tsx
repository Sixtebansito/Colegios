'use client';

import React, { useEffect, useState } from 'react';
import { Users, User, Plus, X, MessageSquare } from 'lucide-react';

interface Room {
  RoomID: number;
  Name: string | null;
  Type: string;
  _count: { Messages: number };
}

interface ChatUser {
  id: number;
  name: string;
}

interface SidebarRoomsProps {
  currentUserId: number;
  onSelectRoom: (roomId: number) => void;
  selectedRoomId?: number;
}

export default function SidebarRooms({ currentUserId, onSelectRoom, selectedRoomId }: SidebarRoomsProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
  const [search, setSearch] = useState('');

  const fetchRooms = () => {
    fetch(`/api/chat/rooms?userId=${currentUserId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRooms(data);
        else console.error('Expected array, got:', data);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchRooms();
  }, [currentUserId]);

  const openNewChatModal = () => {
    setIsModalOpen(true);
    fetch(`/api/chat/users?excludeId=${currentUserId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailableUsers(data);
      });
  };

  const createChat = async (targetUserId: number) => {
    const res = await fetch('/api/chat/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Type: 'DIRECT',
        MemberIds: [currentUserId, targetUserId]
      })
    });
    
    if (res.ok) {
      const newRoom = await res.json();
      setIsModalOpen(false);
      fetchRooms();
      onSelectRoom(newRoom.RoomID);
    }
  };

  const filteredUsers = availableUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-full sm:w-96 bg-white flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h2 className="font-semibold text-gray-800">Mensajes</h2>
        <button 
          onClick={openNewChatModal}
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" 
          title="Nueva Conversación"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {rooms.map(room => (
          <button
            key={room.RoomID}
            onClick={() => onSelectRoom(room.RoomID)}
            className={`w-full flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition text-left
              ${selectedRoomId === room.RoomID ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}
            `}
          >
            <div className={`p-3 rounded-full flex-shrink-0 ${room.Type === 'DIRECT' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
              {room.Type === 'DIRECT' ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">
                {room.Name || 'Chat Privado'}
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {room._count?.Messages} mensajes en esta sala
              </p>
            </div>
          </button>
        ))}
        {rooms.length === 0 && (
          <div className="p-8 text-sm text-gray-500 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-gray-400" />
            </div>
            No tienes chats activos. Inicia uno nuevo.
          </div>
        )}
      </div>

      {/* Modal para Nuevo Chat */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col">
          <div className="p-4 border-b flex items-center gap-3 bg-gray-50">
            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-semibold text-gray-900">Nuevo Chat</h3>
          </div>
          <div className="p-4 border-b">
            <input 
              type="text"
              placeholder="Buscar contactos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl transition-all"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredUsers.map(user => (
              <button 
                key={user.id}
                onClick={() => createChat(user.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="font-medium text-sm text-gray-900">{user.name}</span>
              </button>
            ))}
            {filteredUsers.length === 0 && (
              <p className="text-center text-gray-500 text-sm mt-4">No se encontraron usuarios.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
