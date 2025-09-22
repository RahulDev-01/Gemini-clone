import React, { createContext, useState } from 'react';
import geminiGenerate from '../config/gemini';

// Named export so components can use: useContext(Context)
export const Context = createContext({});

// Default export used in main.jsx as a provider wrapper
const ContextProvider = ({ children }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); // {id, role: 'user' | 'assistant', content}
  const [previousPrompt, setPrevPrompts] = useState([]);
  const [recentPrompt, setRecentPrompt] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(''); // HTML string for assistant's rendered content

  const onSent = async (promptArg) => {
    const prompt = promptArg ?? input;
    if (!prompt) return;

    setLoading(true);
    setShowResult(true);
    setRecentPrompt(prompt);
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-u`, role: 'user', content: prompt },
    ]);
    setPrevPrompts((prev) => [prompt, ...prev]);
    setInput('');

    try {
      // Call Gemini config to generate a real response
      const aiText = await geminiGenerate(prompt, /*downloadImage*/ false);
      const responseHtml = aiText || 'No response received.';
      setResultData(responseHtml);
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-a`, role: 'assistant', content: responseHtml },
      ]);
    } catch (err) {
      const fallback = 'Failed to get a response from Gemini. Please check your API key and network, then try again.';
      setResultData(fallback);
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-a`, role: 'assistant', content: fallback },
      ]);
      console.error('onSent error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setPrevPrompts([]);
    setRecentPrompt('');
    setResultData('');
    setShowResult(false);
  };

  const newChat = () => {
    setShowResult(false);
    setResultData('');
    setInput('');
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
        clearHistory,
        newChat,
        previousPrompt,
        setPrevPrompts,
        setRecentPrompt,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;

