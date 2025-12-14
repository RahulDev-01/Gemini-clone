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
  const [theme, setTheme] = useState('dark');

  // Load theme from storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('gc.theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('gc.theme', newTheme);
      return newTheme;
    });
  };

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

  const onSent = async (promptArg, isImageGeneration = false) => {
    const prompt = promptArg ?? input;
    if (!prompt) return;

    setLoading(true);
    setShowResult(true);
    setRecentPrompt(prompt);
    setResultData(''); // Clear previous result data
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

    // Optimistic assistant placeholder
    const pendingId = `${Date.now()}-a-pending`;
    const pendingMsg = { id: pendingId, role: 'assistant', content: '', isImage: !!isImageGeneration, pending: true };
    setConversations(prev => prev.map(c => c.id === (activeId || targetId) ? { ...c, messages: [...c.messages, pendingMsg] } : c));
    setMessages(prev => [...prev, pendingMsg]);

    try {
      // Call Gemini config to generate a real response
      const aiResponse = await geminiGenerate(prompt, isImageGeneration);

      if (isImageGeneration && aiResponse && !aiResponse.includes('Error:')) {
        // For image generation, the response is base64 data
        setResultData('');
        const assistantMsg = {
          id: `${Date.now()}-a`,
          role: 'assistant',
          content: aiResponse,
          isImage: true
        };
        // Replace optimistic placeholder with real image
        setConversations(prev => prev.map(c =>
          c.id === (activeId || targetId)
            ? { ...c, messages: c.messages.map(msg => msg.id === pendingId ? { ...assistantMsg, id: pendingId, pending: false } : msg) }
            : c
        ));
        setMessages(prev => prev.map(msg => msg.id === pendingId ? { ...assistantMsg, id: pendingId, pending: false } : msg));
      } else if (isImageGeneration) {
        // Image generation failed, show error message
        const errorMsg = aiResponse || 'Failed to generate image. Please try again.';
        setResultData(errorMsg);
        const assistantMsg = {
          id: `${Date.now()}-a`,
          role: 'assistant',
          content: errorMsg,
          isImage: false
        };
        // Replace optimistic placeholder with error text
        setConversations(prev => prev.map(c =>
          c.id === (activeId || targetId)
            ? { ...c, messages: c.messages.map(msg => msg.id === pendingId ? { ...assistantMsg, id: pendingId, pending: false } : msg) }
            : c
        ));
        setMessages(prev => prev.map(msg => msg.id === pendingId ? { ...assistantMsg, id: pendingId, pending: false } : msg));
      } else {
        // For text generation, parse and display normally
        const responseHtml = aiResponse || 'No response received.';
        setResultData(responseHtml);
        const assistantMsg = {
          id: `${Date.now()}-a`,
          role: 'assistant',
          content: responseHtml,
          isImage: false
        };
        // Replace optimistic placeholder with real text
        setConversations(prev => prev.map(c =>
          c.id === (activeId || targetId)
            ? { ...c, messages: c.messages.map(msg => msg.id === pendingId ? { ...assistantMsg, id: pendingId, pending: false } : msg) }
            : c
        ));
        setMessages(prev => prev.map(msg => msg.id === pendingId ? { ...assistantMsg, id: pendingId, pending: false } : msg));
      }
    } catch (err) {
      const fallback = 'Failed to get a response from Gemini. Please check your API key and network, then try again.';
      setResultData(fallback);
      const assistantMsg = { id: `${Date.now()}-a`, role: 'assistant', content: fallback, isImage: false };
      // Replace optimistic placeholder with error text
      setConversations(prev => prev.map(c =>
        c.id === (activeId || targetId)
          ? { ...c, messages: c.messages.map(msg => msg.id === pendingId ? { ...assistantMsg, id: pendingId, pending: false } : msg) }
          : c
      ));
      setMessages(prev => prev.map(msg => msg.id === pendingId ? { ...assistantMsg, id: pendingId, pending: false } : msg));
      console.error('onSent error:', err);
    } finally {
      setLoading(false);
      setShowResult(false);
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
        theme,
        toggleTheme
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;

