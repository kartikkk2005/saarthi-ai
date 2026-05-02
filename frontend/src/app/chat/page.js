"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function ChatPage() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hello! I am Saarthi.AI. How can I help you regarding our Partner Program today?' }]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [leadStatus, setLeadStatus] = useState({ score: 0, classification: 'Cold' });
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Pre-load voices to avoid the Chrome bug where getVoices() is empty on the first call
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Handle Speech Synthesis (TTS)
  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get all available voices
      const voices = window.speechSynthesis.getVoices();
      
      // Algorithm to find the most natural, human-like voice available
      // 1. Prioritize high-quality "Google" cloud voices with an Indian accent (hi-IN or en-IN)
      let bestVoice = voices.find(v => (v.lang.includes('hi') || v.lang.includes('IN')) && v.name.includes('Google'));
      
      // 2. Fallback: Any premium "Google" English voice (usually UK Female or US Female sound great)
      if (!bestVoice) bestVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('UK'));
      if (!bestVoice) bestVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'));
      
      // 3. Fallback: Any Indian/Hindi voice provided by the OS
      if (!bestVoice) bestVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
      
      if (bestVoice) utterance.voice = bestVoice;
      
      // Adjusting rate and pitch makes it sound significantly less robotic
      utterance.rate = 0.95; // Slightly slower pacing sounds more thoughtful
      utterance.pitch = 1.05; // Very slight pitch increase adds warmth
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle Speech Recognition (STT)
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Recognition. Please try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Can pick up Hindi and English mixed well
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Automatically send the message after a brief delay
      setTimeout(() => {
        handleSendEvent(transcript);
      }, 500);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      
      if (event.error === 'network') {
        alert("Microphone Error: Please ensure you are connected to the internet. If you are accessing this app via an IP address (like 192.168.x.x), Chrome blocks the microphone. Please open http://localhost:3000 instead.");
      } else if (event.error === 'not-allowed' || event.error === 'denied') {
        alert("Microphone access was denied. Please allow microphone permissions in your browser to use the Voice Agent.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSendEvent = async (messageText) => {
    if (!messageText.trim()) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, session_id: sessionId }),
      });

      if (!response.ok) throw new Error('API Error');
      
      const data = await response.json();
      
      if (!sessionId) setSessionId(data.session_id);
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      setLeadStatus({ score: data.score, classification: data.classification });
      
      // Speak the response aloud
      speakResponse(data.response);
      
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, the AI engine is currently unavailable. Please ensure the backend is running.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    handleSendEvent(input);
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
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-4 rounded-full transition-all flex items-center justify-center ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
                  : 'glass-panel text-gray-400 hover:text-white border border-white/10 hover:border-white/20'
              }`}
              title="Voice Input"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </button>
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Type your message in English, Hindi, or Hinglish..."}
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
            </div>
          </form>
          <div className="text-center mt-2 text-[10px] text-gray-500">
            Powered by Saarthi.AI Voice & NLP Engine.
          </div>
        </div>
      </footer>
    </div>
  );
}
