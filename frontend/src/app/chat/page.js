"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function ChatPage() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hello! I am Saarthi.AI. How can I help you regarding our Partner Program today?' }]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [leadStatus, setLeadStatus] = useState({ score: 0, classification: 'Cold' });
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, session_id: sessionId }),
      });

      if (!response.ok) throw new Error('API Error');
      
      const data = await response.json();
      
      if (!sessionId) setSessionId(data.session_id);
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      setLeadStatus({ score: data.score, classification: data.classification });
      
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, the AI engine is currently unavailable. Please ensure the backend is running.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (classification) => {
    switch(classification) {
      case 'Hot': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Warm': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center z-10 glass-panel border-b border-white/5">
        <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center gap-2">
          <span>←</span> Saarthi.AI
        </Link>
        
        {/* Dynamic Lead Status Indicator */}
        <div className="flex gap-4">
          <div className="glass-panel px-4 py-1.5 rounded-full text-xs font-medium border border-white/5 flex items-center gap-2 text-gray-300">
            Session: <span className="font-mono text-gray-400">{sessionId ? sessionId.substring(0, 8) : 'New'}</span>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 transition-colors ${getStatusColor(leadStatus.classification)}`}>
            {leadStatus.classification} Lead ({leadStatus.score})
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
              <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-primary-600 text-white rounded-br-sm shadow-[0_0_20px_rgba(79,70,229,0.2)]' 
                  : 'glass-panel text-gray-200 rounded-bl-sm border border-white/5'
              }`}>
                <p className="leading-relaxed text-sm md:text-base">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="glass-panel p-4 rounded-2xl rounded-bl-sm border border-white/5 flex gap-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 glass-panel border-t border-white/5">
        <div className="max-w-4xl mx-auto relative">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message in English, Hindi, or Hinglish..."
              className="w-full bg-gray-900/50 border border-white/10 rounded-full pl-6 pr-14 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 bg-primary-600 hover:bg-primary-500 disabled:bg-gray-700 disabled:opacity-50 text-white p-2.5 rounded-full transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
              </svg>
            </button>
          </form>
          <div className="text-center mt-2 text-[10px] text-gray-500">
            Powered by Saarthi.AI NLP Engine.
          </div>
        </div>
      </footer>
    </div>
  );
}
