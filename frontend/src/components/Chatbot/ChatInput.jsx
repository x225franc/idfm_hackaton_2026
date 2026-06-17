import { useState } from 'react';
import { IconSend } from '@tabler/icons-react';

export const ChatInput = ({ onSend, loading, suggestedActions, onActionClick }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      {suggestedActions && suggestedActions.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestedActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                onActionClick(action);
                setInput('');
              }}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              {action.text}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrivez votre message..."
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:shadow-lg disabled:opacity-50 transition-all"
        >
          <IconSend size={20} />
        </button>
      </form>
    </div>
  );
};
