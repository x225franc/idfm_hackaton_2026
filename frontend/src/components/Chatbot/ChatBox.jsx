import { useState, useEffect, useRef } from 'react';
import { IconX } from '@tabler/icons-react';
import { useChatbot } from './useChatbot';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import './ChatBox.css';

export const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, loading, sendMessage, handleAction } = useChatbot();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const lastMessage = messages[messages.length - 1];
  const suggestedActions = lastMessage?.suggestedActions;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chatbot-floating-btn"
          aria-label="Ouvrir le chatbot"
        >
          <span className="text-2xl">💬</span>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-container">
          {/* Header */}
          <div className="chatbot-header">
            <div>
              <h3 className="font-bold text-white">Assistant IDFM</h3>
              <p className="text-xs text-blue-100">Toujours disponible</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <IconX size={20} className="text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id}>
                <ChatMessage
                  message={message}
                  onActionClick={handleAction}
                />
                {message.recommendations && message.recommendations.length > 0 && (
                  <div className="mb-4 flex flex-col gap-2">
                    {message.recommendations.map((forfait, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg"
                      >
                        <p className="text-sm font-semibold text-orange-900">{forfait}</p>
                        <button className="mt-2 text-xs px-3 py-1 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors">
                          Voir détails
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                  <span className="text-white text-sm">💬</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput
            onSend={sendMessage}
            loading={loading}
            suggestedActions={suggestedActions}
            onActionClick={handleAction}
          />
        </div>
      )}
    </>
  );
};

export default ChatBox;
