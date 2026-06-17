import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '@/components/app/AppShell';
import { useChatbot } from '@/components/Chatbot/useChatbot';
import { ChatMessage } from '@/components/Chatbot/ChatMessage';
import { ChatInput } from '@/components/Chatbot/ChatInput';

export default function Ask() {
  const navigate = useNavigate();
  const { messages, loading, sendMessage, handleAction } = useChatbot();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const check = () => {
      if (window.innerWidth >= 768) navigate('/dashboard', { replace: true });
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const lastMessage = messages[messages.length - 1];
  const suggestedActions = lastMessage?.suggestedActions;

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-var(--header-h,57px)-80px)] md:h-[calc(100vh-var(--header-h,57px))] max-w-2xl mx-auto w-full">

        <div className="px-4 pt-6 pb-4 border-b border-border bg-page shrink-0">
          <h1 className="text-2xl font-bold text-anthracite">Ask</h1>
          <p className="text-secondary text-sm mt-0.5">Votre assistant Comutitres</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2 bg-page">
          {messages.map((message) => (
            <div key={message.id}>
              <ChatMessage message={message} onActionClick={handleAction} />
              {message.recommendations && message.recommendations.length > 0 && (
                <div className="mb-4 flex flex-col gap-2">
                  {message.recommendations.map((forfait, idx) => (
                    <div key={idx} className="p-3 bg-blue-light border border-brand/20 rounded-xl">
                      <p className="text-sm font-semibold text-anthracite">{forfait}</p>
                      <button className="mt-2 text-xs px-3 py-1 bg-brand text-white rounded-full hover:bg-brand-focus transition-colors">
                        Voir détails
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 items-center">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-brand to-brand-focus flex items-center justify-center shrink-0">
                <span className="text-white text-sm">💬</span>
              </div>
              <div className="flex gap-1 px-3 py-2 bg-white rounded-2xl border border-border">
                <div className="w-2 h-2 bg-secondary/40 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-secondary/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-secondary/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="shrink-0 border-t border-border bg-white">
          <ChatInput
            onSend={sendMessage}
            loading={loading}
            suggestedActions={suggestedActions}
            onActionClick={handleAction}
          />
        </div>
      </div>
    </AppShell>
  );
}
