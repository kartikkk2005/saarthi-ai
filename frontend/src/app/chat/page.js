"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FiX, FiPlay } from 'react-icons/fi';

export default function ChatPage() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hello! I am Saarthi.AI. How can I help you regarding our Partner Program today?' }]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [leadStatus, setLeadStatus] = useState({ score: 0, classification: 'Cold' });
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Voice Settings State
  const [speechRate, setSpeechRate] = useState(0.95);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Pre-load and manage voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);
          // Set default only if none is selected
          if (!selectedVoiceURI) {
            let bestVoice = voices.find(v => (v.lang.includes('hi') || v.lang.includes('IN')) && v.name.includes('Google'));
            if (!bestVoice) bestVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('UK'));
            if (!bestVoice) bestVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'));
            if (!bestVoice) bestVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
            if (bestVoice) {
              setSelectedVoiceURI(bestVoice.voiceURI);
            }
          }
        }
      };
      
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoiceURI]);

  // Handle Speech Synthesis (TTS)
  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (selectedVoiceURI) {
        const chosenVoice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
        if (chosenVoice) utterance.voice = chosenVoice;
      }
      
      utterance.rate = speechRate;
      utterance.pitch = 1.05; 
      
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
    recognition.lang = 'en-IN'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
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
      <header className="w-full p-4 flex justify-between items-center z-10 glass-panel border-b border-white/5 relative">
        <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center gap-2">
          <span>←</span> Saarthi.AI
        </Link>
        
        <div className="flex gap-4 items-center">
          {/* Dynamic Lead Status Indicator */}
          <div className="hidden md:flex glass-panel px-4 py-1.5 rounded-full text-xs font-medium border border-white/5 items-center gap-2 text-gray-300">
            Session: <span className="font-mono text-gray-400">{sessionId ? sessionId.substring(0, 8) : 'New'}</span>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 transition-colors ${getStatusColor(leadStatus.classification)}`}>
            {leadStatus.classification} ({leadStatus.score})
          </div>
          
          {/* Settings Toggle */}
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-white glass-panel rounded-full border border-white/5 transition-all"
            title="Voice Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Settings Dropdown Panel */}
        {showSettings && (
          <div className="absolute top-20 right-4 w-80 glass-panel border border-white/10 rounded-2xl shadow-2xl p-5 z-50 animate-slide-up">
            <h3 className="text-white font-semibold mb-4 text-sm flex items-center justify-between">
              Voice Settings
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white"><FiX /></button>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Select Voice Profile</label>
                <select 
                  className="w-full bg-gray-900/80 border border-white/10 rounded-lg p-2 text-sm text-gray-200 focus:ring-1 focus:ring-primary-500 outline-none"
                  value={selectedVoiceURI}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                >
                  {availableVoices.length > 0 ? (
                    availableVoices.map((voice, idx) => (
                      <option key={idx} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))
                  ) : (
                    <option>Loading voices...</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 flex justify-between">
                  <span>Speech Speed</span>
                  <span>{speechRate.toFixed(2)}x</span>
                </label>
                <input 
                  type="range" 
                  min="0.5" max="2" step="0.05"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-primary-500"
                />
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={() => speakResponse("This is a voice test for Saarthi.AI.")}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg py-2 text-sm text-white transition-colors"
                >
                  <span className="flex items-center justify-center gap-2"><FiPlay /> Test Voice</span>
                </button>
              </div>
            </div>
          </div>
        )}
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
                <p className="leading-relaxed text-sm md:text-base whitespace-pre-wrap">{msg.content}</p>
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
          <div className="text-center mt-2 text-[10px] text-gray-500 relative">
            {isListening && (
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-end gap-1 h-8 px-4 py-2 glass-panel rounded-full animate-fade-in border border-primary-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <div className="w-1 bg-primary-400 rounded-full waveform-bar" style={{animationDelay: '0.0s'}}></div>
                <div className="w-1 bg-primary-400 rounded-full waveform-bar" style={{animationDelay: '0.2s'}}></div>
                <div className="w-1 bg-primary-400 rounded-full waveform-bar" style={{animationDelay: '0.4s'}}></div>
                <div className="w-1 bg-primary-400 rounded-full waveform-bar" style={{animationDelay: '0.1s'}}></div>
                <div className="w-1 bg-primary-400 rounded-full waveform-bar" style={{animationDelay: '0.3s'}}></div>
              </div>
            )}
            Powered by Saarthi.AI Voice & NLP Engine.
          </div>
        </div>
      </footer>
    </div>
  );
}
