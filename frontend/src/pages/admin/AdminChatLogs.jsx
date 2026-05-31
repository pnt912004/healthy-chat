import React, { useEffect, useState, useRef } from 'react';
import { getAdminChats, getAdminChatHistory, replyToUserChat, markAdminChatAsRead } from '../../services/adminService';
import dayjs from 'dayjs';

const AdminChatLogs = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => {
      fetchSessions();
      if (selectedSession) {
        refreshMessages(selectedSession.session_id);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedSession]);

  const fetchSessions = async () => {
    try {
      const data = await getAdminChats();
      setSessions(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách chat:", error);
    }
  };

  const refreshMessages = async (sessionId) => {
    try {
      const data = await getAdminChatHistory(sessionId);
      setMessages(data);
    } catch (error) {}
  };

  const selectSession = async (session) => {
    setSelectedSession(session);
    setLoading(true);
    try {
      await markAdminChatAsRead(session.session_id);
      await fetchSessions(); // Update unread badge immediately
      const data = await getAdminChatHistory(session.session_id);
      setMessages(data);
    } catch (error) {
      console.error("Lỗi khi tải tin nhắn:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleReply = async () => {
    if (!input.trim() || !selectedSession) return;
    
    const userIdMatch = selectedSession.session_id.match(/^admin_(\d+)/);
    const userId = userIdMatch ? parseInt(userIdMatch[1]) : 0;

    try {
      const newMsg = await replyToUserChat(selectedSession.session_id, input, userId);
      setMessages([...messages, newMsg]);
      setInput('');
      fetchSessions(); 
    } catch (error) {
      console.error("Lỗi khi trả lời:", error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-160px)] -m-6 border-t border-outline-variant dark:border-outline">
      <div className="w-1/3 min-w-[250px] max-w-[350px] border-r border-outline-variant dark:border-outline bg-surface-container-lowest dark:bg-inverse-surface flex flex-col overflow-hidden">
        <div className="p-4 border-b border-outline-variant dark:border-outline">
          <h2 className="text-h3 font-semibold text-on-surface dark:text-white m-0">Tin nhắn từ User</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-4 text-center text-on-surface-variant dark:text-slate-400">Không có đoạn chat nào.</div>
          ) : (
            sessions.map((sess) => (
              <div 
                key={sess.session_id} 
                onClick={() => selectSession(sess)}
                className={`p-4 border-b border-outline-variant dark:border-outline cursor-pointer hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors ${selectedSession?.session_id === sess.session_id ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-primary' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-on-surface dark:text-white text-sm flex items-center gap-2">
                    {sess.session_id.substring(0, 15)}...
                    {sess.unread_count > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {sess.unread_count}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-on-surface-variant dark:text-slate-400">
                    {dayjs(sess.created_at.endsWith('Z') ? sess.created_at : sess.created_at + 'Z').format('HH:mm DD/MM')}
                  </span>
                </div>
                <p className={`text-sm line-clamp-1 m-0 ${sess.unread_count > 0 ? 'text-on-surface dark:text-white font-semibold' : 'text-on-surface-variant dark:text-slate-300'}`}>
                  {sess.preview}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 bg-surface dark:bg-on-surface flex flex-col relative">
        {selectedSession ? (
          <>
            <div className="p-4 border-b border-outline-variant dark:border-outline bg-surface-container-lowest dark:bg-inverse-surface">
              <h3 className="font-semibold text-on-surface dark:text-white m-0">
                Mã Chat: {selectedSession.session_id}
              </h3>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              {loading ? (
                <div className="text-center text-on-surface-variant dark:text-slate-400">Đang tải...</div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg text-sm ${msg.role === 'admin' ? 'bg-primary text-white chat-bubble-user' : 'bg-surface-container-high dark:bg-surface-variant text-on-surface dark:text-white chat-bubble-ai'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant dark:border-outline flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                placeholder="Nhập câu trả lời cho user..."
                className="flex-1 bg-surface-container dark:bg-surface-variant text-on-surface dark:text-inverse-on-surface rounded-full px-4 py-2 outline-none border border-transparent focus:border-primary transition-colors"
              />
              <button 
                onClick={handleReply}
                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-on-surface-variant dark:text-slate-400">
            Chọn một đoạn chat bên trái để xem và trả lời
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatLogs;
