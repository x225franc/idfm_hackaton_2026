export const ChatMessage = ({ message, onActionClick }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">A</span>
        </div>
      )}

      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
        isUser
          ? 'bg-blue-600 text-white rounded-br-none'
          : 'bg-gray-100 text-gray-800 rounded-bl-none'
      }`}>
        <p className="text-sm leading-relaxed">{message.text}</p>
        <span className="text-xs opacity-70 mt-1 block">
          {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm">U</span>
        </div>
      )}
    </div>
  );
};
