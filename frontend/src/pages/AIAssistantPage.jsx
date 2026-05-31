import { useState, useRef, useEffect } from 'react';
import { sendMessage as sendChat, getChatHistory, getChatSessions } from '../services/chatService';
import { getCurrentUser, logout } from '../services/authService';

const quickSuggestions = [
  { icon: 'bedtime',     label: 'Mẹo Ngủ Ngon' },
  { icon: 'water_drop',  label: 'Ghi Lượng Nước' },
  { icon: 'exercise',    label: 'Bài Tập 15 Phút' },
  { icon: 'psychology',  label: 'Giảm Lo Âu' },
];

const AIAssistantPage = () => {
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [input, setInput]       = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const user = getCurrentUser();

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessions = async () => {
    try {
      const data = await getChatSessions();
      setSessions(data);
      if (data.length > 0 && !currentSessionId) {
        handleSelectSession(data[0].session_id);
      } else if (data.length === 0) {
        setMessages([{
          id: 'welcome',
          role: 'ai',
          content: `Xin chào ${user?.username || 'bạn'}! Tôi là trợ lý AI của HealthyChat. Hôm nay tôi có thể giúp gì cho bạn?`,
          created_at: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách chat:', error);
    }
  };

  const handleSelectSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    try {
      const history = await getChatHistory(sessionId);
      setMessages(history);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử chat:', error);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChat(text, currentSessionId);
      setMessages(prev => [...prev, response.ai_message]);
      if (!currentSessionId) {
        setCurrentSessionId(response.session_id);
        fetchSessions();
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        content: 'Xin lỗi, tôi gặp sự cố khi kết nối. Vui lòng thử lại sau.',
        created_at: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex gap-lg h-[calc(100vh-140px)]">
      {/* ── Sidebar History (desktop only) ── */}
      <aside className="hidden md:flex w-72 flex-col bg-surface-container-lowest rounded-2xl border border-outline-variant p-md shadow-soft">
        <div className="flex justify-between items-center mb-md">
          <h3 className="text-h3 font-h3 text-on-surface">Lịch Sử</h3>
          <button onClick={() => { setCurrentSessionId(null); setMessages([]); }} 
                  className="text-primary hover:bg-primary-container p-1 rounded-lg transition-colors"
                  title="Cuộc trò chuyện mới">
            <span className="material-symbols-outlined">add_comment</span>
          </button>
        </div>
        
        <div className="flex flex-col gap-xs overflow-y-auto no-scrollbar flex-grow pr-2">
          {sessions.map((s) => (
            <div key={s.session_id}
                 onClick={() => handleSelectSession(s.session_id)}
                 className={`flex items-center gap-sm p-sm rounded-xl cursor-pointer transition-all
                   ${currentSessionId === s.session_id
                     ? 'bg-primary-container text-primary font-bold'
                     : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                   }`}>
              <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
              <span className="truncate text-body-sm flex-1">
                {s.last_message?.substring(0, 25) || 'Cuộc trò chuyện mới'}...
              </span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main Chat Area ── */}
      <main className="flex-grow flex flex-col bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-soft overflow-hidden relative">
        {/* Chat Canvas */}
        <section className="flex-grow overflow-y-auto p-md md:p-lg space-y-xl">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-md ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                ${msg.role === 'ai' ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                <span className="material-symbols-outlined text-sm" style={msg.role === 'ai' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {msg.role === 'ai' ? 'smart_toy' : 'person'}
                </span>
              </div>
              <div className={`flex flex-col gap-xs max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                {msg.analysis && (
                  <div className="bg-white p-lg rounded-2xl chat-bubble-ai shadow-sm border border-slate-100 mb-xs w-full">
                    <p className="text-body-md font-bold text-primary mb-md">Phân Tích Dinh Dưỡng</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-sm mb-lg">
                      {[
                        { label: 'Calo',    val: `${msg.analysis.kcal} kcal` },
                        { label: 'Protein', val: msg.analysis.protein },
                        { label: 'Carbs',   val: msg.analysis.carbs },
                        { label: 'Chất Béo', val: msg.analysis.fat },
                      ].map(({ label, val }) => (
                        <div key={label} className="bg-surface-container p-sm rounded-xl text-center border border-outline-variant/30">
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">{label}</p>
                          <p className="text-body-md font-bold text-primary">{val}</p>
                        </div>
                      ))}
                    </div>
                    <div className="text-body-md text-on-surface whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  </div>
                )}
                {!msg.analysis && (
                  <div className={`p-md rounded-2xl shadow-sm whitespace-pre-wrap leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-primary text-on-primary chat-bubble-user rounded-tr-none'
                      : 'bg-surface text-on-surface border border-outline-variant/50 chat-bubble-ai rounded-tl-none'
                    }`}>
                    <p className="text-body-md">{msg.content}</p>
                  </div>
                )}
                <span className="text-[10px] text-on-surface-variant/60 px-xs">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-md">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-sm animate-bounce">smart_toy</span>
              </div>
              <div className="bg-surface p-md rounded-2xl shadow-sm border border-outline-variant/50 chat-bubble-ai rounded-tl-none">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </section>

        {/* Input Footer */}
        <footer className="p-md md:p-lg border-t border-outline-variant bg-surface-container-lowest flex-shrink-0">
          <div className="w-full flex flex-col gap-md">
            <div className="flex gap-sm overflow-x-auto pb-xs no-scrollbar">
              {quickSuggestions.map(({ icon, label }) => (
                <button key={label} onClick={() => setInput(label)}
                        className="flex-shrink-0 flex items-center gap-xs px-md py-sm bg-surface border
                                   border-outline-variant rounded-full hover:border-primary hover:text-primary
                                   transition-all text-label-sm text-on-surface-variant shadow-soft">
                  <span className="material-symbols-outlined text-sm">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
            <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant p-sm focus-within:border-primary transition-colors">
              <div className="flex items-end gap-sm">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                  placeholder="Hỏi AI về dinh dưỡng, sức khỏe..."
                  className="flex-grow min-h-[44px] py-sm px-md bg-transparent border-none
                             focus:ring-0 resize-none text-body-md text-on-surface outline-none max-h-32"
                />
                <div className="pb-xs px-xs">
                  <button onClick={handleSend} disabled={!input.trim() || loading}
                          className="w-10 h-10 bg-primary text-on-primary rounded-xl flex items-center
                                     justify-center transition-all active:scale-95 shadow-soft
                                     disabled:opacity-50 hover:bg-primary/90">
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AIAssistantPage;
