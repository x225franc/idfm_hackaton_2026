import { useState, useCallback } from 'react';

const API_URL = window.config?.BACKEND_URL || 'http://localhost:3001';

export const useChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour! Je suis ici pour vous aider à trouver le meilleur abonnement de transport en Île-de-France. Pouvez-vous me dire votre situation ?",
      sender: 'assistant',
      timestamp: new Date(),
      suggestedActions: [
        { text: "Je suis étudiant", action: "selectProfile", profile: "etudiant" },
        { text: "Je suis salarié", action: "selectProfile", profile: "actif" },
        { text: "Je suis senior", action: "selectProfile", profile: "senior" }
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          message: text.trim(),
          userId: localStorage.getItem('userId') || null
        })
      });

      if (!response.ok) throw new Error('Erreur serveur');

      const data = await response.json();

      const assistantMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'assistant',
        timestamp: new Date(),
        recommendations: data.recommendations || [],
        suggestedActions: data.suggestedActions || []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erreur chat:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAction = useCallback((action) => {
    if (action.action === 'selectProfile') {
      sendMessage(`Je suis ${action.profile === 'etudiant' ? 'étudiant' : action.profile === 'actif' ? 'salarié' : 'senior'}`);
    } else if (action.action === 'viewDetails') {
      console.log('Voir détails du forfait:', action.forfait);
    } else if (action.action === 'checkout') {
      console.log('Passer commande:', action.forfait);
    }
  }, [sendMessage]);

  return {
    messages,
    loading,
    sendMessage,
    handleAction
  };
};
