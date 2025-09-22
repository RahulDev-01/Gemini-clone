import React, { createContext, useEffect, useMemo, useState } from 'react';
import geminiGenerate from '../config/gemini';

// Named export so components can use: useContext(Context)
export const Context = createContext({});

// Default export used in main.jsx as a provider wrapper
const ContextProvider = ({ children }) => {
  const [input, setInput] = useState('');
  // Conversations: [{ id, title, messages: [{id, role, content}] }]
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]); // mirror of active conversation messages for compatibility
  const [recentPrompt, setRecentPrompt] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(''); // HTML string for assistant's rendered content

  // Load persisted conversations from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('gc.conversations');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setConversations(parsed);
          setActiveId(parsed[0].id);
          setMessages(parsed[0].messages || []);
        }
      }
    } catch (e) {
      console.warn('Failed to load conversations from storage:', e);
    }
  }, []);

  // Persist whenever conversations change
  useEffect(() => {
    try {
      localStorage.setItem('gc.conversations', JSON.stringify(conversations));
    } catch (e) {
      console.warn('Failed to save conversations to storage:', e);
    }
  }, [conversations]);

  const activeConversation = useMemo(
    () => conversations.find(c => c.id === activeId) || null,
    [conversations, activeId]
  );

  // Keep messages mirror in sync for existing UI components
  useEffect(() => {
    setMessages(activeConversation?.messages || []);
  }, [activeConversation]);

  const openConversation = (id) => {
    setActiveId(id);
    const conv = conversations.find(c => c.id === id);
    setMessages(conv?.messages || []);
    setShowResult(false);
    setResultData('');
  };

  const newChat = () => {
    const id = `c-${Date.now()}`;
    const conv = { id, title: 'New Chat', messages: [] };
    setConversations(prev => [conv, ...prev]);
    setActiveId(id);
    setMessages([]);
    setShowResult(false);
    setResultData('');
    setInput('');
  };

  const onSent = async (promptArg) => {
    const prompt = promptArg ?? input;
    if (!prompt) return;

    setLoading(true);
    setShowResult(true);
    setRecentPrompt(prompt);
    // Ensure there is an active conversation
    let targetId = activeId;
    if (!targetId) {
      const id = `c-${Date.now()}`;
      const conv = { id, title: prompt.slice(0, 30) || 'New Chat', messages: [] };
      setConversations(prev => [conv, ...prev]);
      targetId = id;
      setActiveId(id);
    }
    const userMsg = { id: `${Date.now()}-u`, role: 'user', content: prompt };
    setConversations(prev => prev.map(c => c.id === targetId ? { ...c, title: c.messages.length === 0 ? (prompt.slice(0, 30) || 'New Chat') : c.title, messages: [...c.messages, userMsg] } : c));
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      // Call Gemini config to generate a real response
      const aiText = await geminiGenerate(prompt, /*downloadImage*/ false);
      const responseHtml = aiText || 'No response received.';
      setResultData(responseHtml);
      const assistantMsg = { id: `${Date.now()}-a`, role: 'assistant', content: responseHtml };
      setConversations(prev => prev.map(c => c.id === (activeId || targetId) ? { ...c, messages: [...c.messages, assistantMsg] } : c));
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const fallback = 'Failed to get a response from Gemini. Please check your API key and network, then try again.';
      setResultData(fallback);
      const assistantMsg = { id: `${Date.now()}-a`, role: 'assistant', content: fallback };
      setConversations(prev => prev.map(c => c.id === (activeId || targetId) ? { ...c, messages: [...c.messages, assistantMsg] } : c));
      setMessages(prev => [...prev, assistantMsg]);
      console.error('onSent error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setConversations([]);
    setActiveId(null);
    setMessages([]);
    setRecentPrompt('');
    setResultData('');
    setShowResult(false);
  };

  return (
    <Context.Provider
      value={{
        onSent,
        recentPrompt,
        showResult,
        loading,
        resultData,
        setInput,
        input,
        messages,
        conversations,
        activeConversation,
        activeId,
        openConversation,
        clearHistory,
        newChat,
        setRecentPrompt,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;

