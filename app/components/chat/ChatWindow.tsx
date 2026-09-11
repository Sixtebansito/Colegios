'use client';

import React, { useState, useEffect, useRef } from 'react';
import { pusherClient } from '@/lib/pusher';
import { Send, Paperclip, File, X } from 'lucide-react';

interface ChatMessage {
  MessageID: number;
  RoomID: number;
  SenderID: number;
  Content: string | null;
  AttachmentUrl: string | null;
  AttachmentType: string | null;
  CreatedAt: string;
  Sender?: any;
}

interface ChatWindowProps {
  roomId: number;
  currentUserId: number;
}

export default function ChatWindow({ roomId, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = () => {
      fetch(`/api/chat/messages?roomId=${roomId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setMessages(prev => {
              if (prev.length === data.length) return prev;
              
              // Si llegaron nuevos mensajes, marcar como leídos
              fetch('/api/chat/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId }),
              }).catch(console.error);

              return data;
            });
          }
        })
        .catch(err => console.error(err));
    };

    // Mark as read initially
    fetch('/api/chat/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId }),
    }).catch(console.error);

    // Fetch initial messages
    fetchMessages();

    // Polling fallback (every 3 seconds) since dummy Pusher keys won't work locally
    const pollInterval = setInterval(fetchMessages, 3000);

    // Subscribe to pusher channel (if configured)
    let channel: any;
    try {
      channel = pusherClient.subscribe(`room-${roomId}`);
      channel.bind('new-message', (data: ChatMessage) => {
        // Only append if it's not already in the list
        setMessages(prev => {
          if (prev.some(m => m.MessageID === data.MessageID)) return prev;
          return [...prev, data];
        });
      });
    } catch (e) {
      console.warn("Pusher subscribe error:", e);
    }

    return () => {
      clearInterval(pollInterval);
      if (channel) {
        pusherClient.unsubscribe(`room-${roomId}`);
      }
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !file) return;

    let attachmentUrl = null;
    let attachmentType = null;

    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (uploadRes.ok) {
        const result = await uploadRes.json();
        attachmentUrl = result.url;
        attachmentType = result.type;
      }
      setUploading(false);
      setFile(null);
    }

    const payload = {
      RoomID: roomId,
      SenderID: currentUserId,
      Content: input || null,
      AttachmentUrl: attachmentUrl,
      AttachmentType: attachmentType,
    };

    setInput('');
    
    await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  };

  const getUserName = (sender: any) => {
    if (!sender) return 'Desconocido';
    if (sender.profesor) return `${sender.profesor.Nombre} ${sender.profesor.Apellido}`;
    if (sender.estudiante) return `${sender.estudiante.Nombre} ${sender.estudiante.Apellido}`;
    return `Usuario ${sender.Cedula || sender.UsuarioID}`;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.SenderID === currentUserId;
          return (
            <div key={msg.MessageID} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-gray-500 mb-1">{getUserName(msg.Sender)}</span>
              <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                {msg.Content && <p className="whitespace-pre-wrap">{msg.Content}</p>}
                
                {msg.AttachmentUrl && (
                  <div className="mt-2">
                    {msg.AttachmentType?.startsWith('image/') ? (
                      <img src={msg.AttachmentUrl} alt="Adjunto" className="max-w-full rounded" />
                    ) : (
                      <a href={msg.AttachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm underline opacity-90">
                        <File className="w-4 h-4 mr-1" />
                        Ver archivo
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Caja de entrada */}
      <form onSubmit={handleSendMessage} className="p-4 border-t flex flex-col gap-2">
        {file && (
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded text-sm text-gray-700 w-max">
            <span className="truncate max-w-xs">{file.name}</span>
            <button type="button" onClick={() => setFile(null)} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex gap-2 items-center">
          <label className="cursor-pointer p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full">
            <Paperclip className="w-5 h-5" />
            <input 
              type="file" 
              className="hidden" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept="image/*,application/pdf"
            />
          </label>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
          
          <button 
            type="submit" 
            disabled={(!input.trim() && !file) || uploading}
            className="bg-blue-500 text-white p-2 rounded-full disabled:opacity-50 hover:bg-blue-600 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
