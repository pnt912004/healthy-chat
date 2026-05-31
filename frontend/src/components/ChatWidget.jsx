import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToAdmin, getChatHistory, getUserUnreadCount, markUserChatAsRead } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('admin');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState({
    ai: [{ sender: 'ai', text: 'Tính năng AI đang bảo trì.' }],
    admin: []
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const messagesEndRef = useRef(null);

  const adminSessionId = `admin_${user?.id}`;

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && activeTab === 'admin') {
      markUserChatAsRead(adminSessionId).then(() => setUnreadCount(0)).catch(() => {});
    }
  };

  const loadAdminHistory = async () => {
    if (!isAuthenticated) return;
    try {
      const history = await getChatHistory(adminSessionId);
      const formatted = history.map(m => ({
        sender: m.role,
        text: m.content
      }));
      setMessages(prev => ({ ...prev, admin: formatted }));
    } catch (error) {
      console.error("Lỗi khi tải lịch sử:", error);
    }
  };

  const checkUnread = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await getUserUnreadCount();
      setUnreadCount(res.unread_count);
    } catch (error) {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminHistory();
      checkUnread();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let interval;
    if (isAuthenticated) {
      interval = setInterval(() => {
        if (isOpen && activeTab === 'admin') {
          loadAdminHistory();
          markUserChatAsRead(adminSessionId).then(() => setUnreadCount(0)).catch(() => {});
        } else {
          checkUnread();
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAuthenticated, isOpen, activeTab]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  const handleSend = async () => {
    if (!input.trim() || !isAuthenticated) return;
    
    const userText = input;
    setInput('');
    
    const newMessage = { sender: 'user', text: userText };
    setMessages((prev) => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newMessage]
    }));

    try {
      if (activeTab === 'admin') {
        await sendMessageToAdmin(userText);
        // Will be updated by polling or we can call loadAdminHistory
        loadAdminHistory();
      } else {
        // AI logic
      }
    } catch (error) {
      console.error("Lỗi khi gửi:", error);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
      {isOpen && (
        <div className="w-80 sm:w-96 h-[400px] mb-4 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-medium flex flex-col overflow-hidden animate-slide-up pointer-events-auto">
          <div className="bg-primary text-on-primary flex flex-col">
            <div className="flex justify-between items-center p-3">
              <h3 className="font-semibold m-0 text-white">Hỗ trợ trực tuyến</h3>
              <button onClick={toggleChat} className="text-white hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex bg-primary-container/20">
              <button
                className={`flex-1 py-2 text-sm font-semibold transition-colors relative ${activeTab === 'admin' ? 'bg-primary-container text-on-primary-container' : 'text-white hover:bg-white/10'}`}
                onClick={() => {
                  setActiveTab('admin');
                  markUserChatAsRead(adminSessionId).then(() => setUnreadCount(0)).catch(() => {});
                }}
              >
                Chat với Admin
                {unreadCount > 0 && activeTab !== 'admin' && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'ai' ? 'bg-primary-container text-on-primary-container' : 'text-white hover:bg-white/10'}`}
                onClick={() => setActiveTab('ai')}
              >
                Chat với AI
              </button>
            </div>
          </div>

          <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 bg-surface dark:bg-on-surface">
            {messages[activeTab].map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-primary text-white chat-bubble-user' : 'bg-surface-container-high dark:bg-surface-variant text-on-surface dark:text-inverse-on-surface chat-bubble-ai'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant dark:border-outline flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-surface-container dark:bg-surface-variant text-on-surface dark:text-inverse-on-surface rounded-full px-4 py-2 text-sm outline-none border border-transparent focus:border-primary transition-colors"
            />
            <button onClick={handleSend} className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors">
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={toggleChat}
        className="relative w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform pointer-events-auto"
      >
        <span className="material-symbols-outlined text-[28px]">{isOpen ? 'close' : 'chat'}</span>
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
