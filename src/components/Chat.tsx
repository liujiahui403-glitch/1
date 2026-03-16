import React, { useState, useEffect, useRef } from 'react';
import { db, auth, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, getDocs, doc, updateDoc } from '../firebase';
import { ChatRoom, Message, User } from '../types';
import { Send, MessageSquare, ArrowUp, ArrowDown, User as UserIcon, Settings2, GripVertical, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence, Reorder } from 'motion/react';

export default function Chat() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const roomsData = await Promise.all(snapshot.docs.map(async (d) => {
        const data = d.data() as ChatRoom;
        const otherUserId = data.participants.find(p => p !== auth.currentUser?.uid);
        // Simplified: In real app, fetch other user profile
        return { id: d.id, ...data, otherUser: { displayName: `用户 ${otherUserId?.slice(0, 4)}` } as User };
      }));
      setRooms(roomsData.sort((a, b) => (b.order || 0) - (a.order || 0)));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    const q = query(
      collection(db, `chatRooms/${activeRoom.id}/messages`),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    });
    return () => unsubscribe();
  }, [activeRoom]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom || !auth.currentUser) return;

    await addDoc(collection(db, `chatRooms/${activeRoom.id}/messages`), {
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || 'Anonymous',
      text: newMessage,
      timestamp: new Date().toISOString()
    });

    await updateDoc(doc(db, 'chatRooms', activeRoom.id), {
      lastMessage: newMessage,
      lastTimestamp: new Date().toISOString()
    });

    setNewMessage('');
  };

  const changeOrder = async (room: ChatRoom, delta: number) => {
    await updateDoc(doc(db, 'chatRooms', room.id), {
      order: (room.order || 0) + delta
    });
  };

  const handleReorder = (newOrder: ChatRoom[]) => {
    setRooms(newOrder);
    // In a real app, you'd update the 'order' field in Firestore for each room
    // For now, we'll just update the local state for immediate feedback
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col md:flex-row bg-white border border-zinc-200 rounded-[40px] overflow-hidden shadow-2xl">
      {/* Sidebar */}
      <div className={`${activeRoom ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-zinc-100 flex-col bg-zinc-50/50`}>
        <div className="p-8 flex items-center justify-between">
          <h2 className="text-2xl font-black text-zinc-900 tracking-tighter">消息中心</h2>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2 rounded-xl transition-all ${isEditing ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-500 border border-zinc-200 hover:border-zinc-900'}`}
          >
            <Settings2 size={18} />
          </button>
        </div>
        <Reorder.Group axis="y" values={rooms} onReorder={handleReorder} className="flex-1 overflow-y-auto px-4 space-y-2">
          {rooms.map(room => (
            <Reorder.Item
              key={room.id}
              value={room}
              dragListener={isEditing}
              onClick={() => !isEditing && setActiveRoom(room)}
              className={`p-4 rounded-3xl cursor-pointer flex items-center gap-4 transition-all ${activeRoom?.id === room.id ? 'bg-white shadow-lg border border-zinc-100' : 'hover:bg-white/60'}`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-zinc-200 rounded-2xl flex items-center justify-center text-zinc-500 overflow-hidden">
                  <UserIcon size={24} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-zinc-900 truncate text-sm">{room.otherUser?.displayName}</h4>
                  {isEditing ? (
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); changeOrder(room, 1); }} className="p-1 bg-zinc-100 rounded-md text-zinc-400 hover:text-zinc-900"><ArrowUp size={12} /></button>
                      <button onClick={(e) => { e.stopPropagation(); changeOrder(room, -1); }} className="p-1 bg-zinc-100 rounded-md text-zinc-400 hover:text-zinc-900"><ArrowDown size={12} /></button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-400 font-bold">12:30</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 truncate mt-0.5">{room.lastMessage || '点击开始聊天'}</p>
              </div>
              {isEditing && <GripVertical size={16} className="text-zinc-300" />}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      {/* Chat Area */}
      <div className={`${!activeRoom ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white`}>
        {activeRoom ? (
          <>
            <div className="p-8 border-b border-zinc-100 flex items-center gap-4">
              <button onClick={() => setActiveRoom(null)} className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-zinc-900">
                <ChevronRight className="rotate-180" size={24} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400">
                  <UserIcon size={20} />
                </div>
                <div>
                  <h3 className="font-black text-zinc-900 tracking-tight">{activeRoom.otherUser?.displayName}</h3>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">正在线上</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-zinc-50/30">
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex ${msg.senderId === auth.currentUser?.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] p-4 rounded-3xl text-sm leading-relaxed ${msg.senderId === auth.currentUser?.uid ? 'bg-zinc-900 text-white rounded-tr-none shadow-xl shadow-zinc-900/10' : 'bg-white border border-zinc-200 text-zinc-900 rounded-tl-none shadow-sm'}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={scrollRef} />
            </div>
            <form onSubmit={sendMessage} className="p-8 bg-white border-t border-zinc-100 flex gap-4">
              <input
                type="text"
                placeholder="输入消息..."
                className="flex-1 px-6 py-4 bg-zinc-100 border-none rounded-2xl focus:ring-2 focus:ring-zinc-900 text-sm font-medium"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="p-4 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 active:scale-95">
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 space-y-6">
            <div className="w-24 h-24 bg-zinc-50 rounded-[32px] flex items-center justify-center text-zinc-200">
              <MessageSquare size={48} strokeWidth={1.5} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-zinc-900 font-black text-lg tracking-tight">开启一段职业对话</p>
              <p className="text-sm font-medium text-zinc-400">选择左侧联系人，开始您的职业交流</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
