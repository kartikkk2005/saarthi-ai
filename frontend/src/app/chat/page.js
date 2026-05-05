"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FiX, FiPlay, FiMic } from 'react-icons/fi';

export default function ChatPage() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'System Initialized. I am Saarthi.AI. How can I assist you today?' }]);
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
  
  // STT Language Selection
  const [sttLanguage, setSttLanguage] = useState('en-IN');
  const sttLanguageOptions = [
    { id: 'en-IN', code: 'en-IN', label: 'English (IN)' },
    { id: 'hi-IN', code: 'hi-IN', label: 'Hindi' },
    { id: 'hinglish', code: 'hi-IN', label: 'Hinglish' }, // Unique ID, but uses hi-IN code for recognition
    { id: 'kn-IN', code: 'kn-IN', label: 'Kannada (ಕನ್ನಡ)' },
    { id: 'ta-IN', code: 'ta-IN', label: 'Tamil' },
    { id: 'te-IN', code: 'te-IN', label: 'Telugu' },
    { id: 'mr-IN', code: 'mr-IN', label: 'Marathi' },
    { id: 'gu-IN', code: 'gu-IN', label: 'Gujarati' },
    { id: 'bn-IN', code: 'bn-IN', label: 'Bengali' },
  ];
  
  // Emotion Radar State
  const [emotion, setEmotion] = useState({ scores: { excited: 10, curious: 10, skeptical: 10, frustrated: 10, neutral: 40 }, dominant: 'neutral' });
  
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
      
      const hasKannada = /[\u0C80-\u0CFF]/.test(text);
      const hasHindi = /[\u0900-\u097F]/.test(text);
      
      if (hasKannada) {
        utterance.lang = 'kn-IN';
        const knVoice = availableVoices.find(v => v.lang.includes('kn') || v.name.toLowerCase().includes('kannada'));
        if (knVoice) utterance.voice = knVoice;
      } else if (hasHindi) {
        utterance.lang = 'hi-IN';
        const hiVoice = availableVoices.find(v => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi'));
        if (hiVoice) utterance.voice = hiVoice;
      } else if (selectedVoiceURI) {
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
    const selectedOption = sttLanguageOptions.find(opt => opt.id === sttLanguage);
    recognition.lang = selectedOption ? selectedOption.code : 'en-IN';
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
        alert("Microphone Error: Please ensure you are connected to the internet.");
      } else if (event.error === 'not-allowed' || event.error === 'denied') {
        alert("Microphone access was denied. Please allow microphone permissions.");
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
      
      if (data.emotion && data.emotion.scores) {
        setEmotion(data.emotion);
      }
      
      speakResponse(data.response);
      
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection to core server lost. Retrying...' }]);
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
      case 'Hot': return 'text-red-600 font-bold';
      case 'Warm': return 'text-orange-600 font-bold';
      default: return 'text-blue-600 font-bold';
    }
  };

  // SVG Radar Chart helper
  const getRadarPoints = (values, cx, cy, maxR) => {
    return values.map((val, i) => {
      const angle = (Math.PI * 2 * i / values.length) - Math.PI / 2;
      const r = (val / 100) * maxR;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');
  };

  // Background Neural Nodes Generation (deterministic to avoid SSR hydration mismatch)
  const nodes = useMemo(() => {
    // Simple seeded pseudo-random to produce identical values on server & client
    const seed = (s) => {
      let v = s;
      return () => {
        v = (v * 16807 + 0) % 2147483647;
        return (v - 1) / 2147483646;
      };
    };
    const rng = seed(42);
    return Array.from({ length: 20 }).map(() => ({
      x: rng() * 100,
      y: rng() * 100,
      size: rng() * 4 + 2,
      delay: rng() * 5
    }));
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FAFAFA] text-[#1D1D1F] relative flex flex-col font-sans">
      
      {/* Neural Network Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
        <svg className="w-full h-full absolute">
          {nodes.map((node, i) => {
            // Draw lines to a few next nodes to simulate network
            const nextNode1 = nodes[(i + 1) % nodes.length];
            const nextNode2 = nodes[(i + 3) % nodes.length];
            return (
              <g key={i}>
                <line x1={`${node.x}%`} y1={`${node.y}%`} x2={`${nextNode1.x}%`} y2={`${nextNode1.y}%`} stroke="rgba(214, 169, 157, 0.2)" strokeWidth="1" />
                <line x1={`${node.x}%`} y1={`${node.y}%`} x2={`${nextNode2.x}%`} y2={`${nextNode2.y}%`} stroke="rgba(242, 208, 169, 0.1)" strokeWidth="1" />
              </g>
            );
          })}
        </svg>
        {nodes.map((node, i) => (
          <div 
            key={i} 
            className="absolute rounded-full bg-primary-400 animate-pulse-core"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: `${node.size}px`,
              height: `${node.size}px`,
              animationDelay: `${node.delay}s`,
              boxShadow: '0 0 10px #FFEDE1'
            }}
          />
        ))}
      </div>

      {/* Central AI Core Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none flex items-center justify-center">
        <div className={`w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 backdrop-blur-3xl flex items-center justify-center transition-all duration-700 ${isListening || isLoading ? 'animate-core-active scale-110' : 'animate-pulse-core'}`}>
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-tr from-primary-400/40 to-transparent flex items-center justify-center">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary-300/30 blur-md"></div>
          </div>
        </div>
      </div>

      {/* Top Bar */}
      <header className="w-full p-6 flex justify-between items-center z-50 relative bg-white/60 backdrop-blur-md border-b border-gray-200/50">
        <Link href="/" className="text-2xl font-bold tracking-widest text-primary-600 flex items-center gap-3">
          <span className="text-xl">Saarthi.AI</span>
          <div className="h-1 w-1 rounded-full bg-primary-500 animate-pulse"></div>
        </Link>
        
        <div className="flex gap-6 items-center">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-semibold">System Status</span>
            <span className="text-xs font-mono text-gray-800 font-bold">
              {isListening ? 'LISTENING_AUDIO...' : isLoading ? 'PROCESSING_DATA...' : 'AWAITING_INPUT'}
            </span>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg text-xs font-mono border border-gray-300 flex items-center gap-3 shadow-sm">
            <span className="text-gray-600 font-semibold">LEAD_CLASS:</span>
            <span className={`tracking-wider ${getStatusColor(leadStatus.classification)} ${leadStatus.classification === 'Hot' ? 'animate-glitch' : ''}`}>
              {leadStatus.classification.toUpperCase()} [{leadStatus.score}]
            </span>
          </div>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-primary-600 hover:text-primary-800 glass-panel rounded-lg border border-primary-500/30 transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-24 right-6 w-80 bg-white/90 backdrop-blur-xl border border-gray-300 rounded-2xl p-5 z-50 animate-slide-left shadow-2xl">
            <h3 className="text-gray-900 font-mono mb-4 text-xs tracking-widest flex items-center justify-between border-b border-gray-200 pb-2 font-bold">
              SYSTEM_PREFERENCES
              <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-900 transition-colors"><FiX /></button>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-700 mb-2 font-semibold">Voice_Matrix</label>
                <select 
                  className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm"
                  value={selectedVoiceURI}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                >
                  {availableVoices.length > 0 ? (
                    availableVoices.map((voice, idx) => (
                      <option key={idx} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>
                    ))
                  ) : <option>LOADING_MODULES...</option>}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-700 mb-2 flex justify-between font-semibold">
                  <span>Output_Speed</span>
                  <span className="text-primary-600 font-bold">{speechRate.toFixed(2)}x</span>
                </label>
                <input 
                  type="range" min="0.5" max="2" step="0.05"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-primary-600"
                />
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-700 mb-2 font-semibold">STT_Language</label>
                <select 
                  className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm"
                  value={sttLanguage}
                  onChange={(e) => setSttLanguage(e.target.value)}
                >
                  {sttLanguageOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3">
                <button 
                  onClick={() => speakResponse("System audio sequence initiated. All modules nominal.")}
                  className="w-full bg-primary-50 hover:bg-primary-100 border border-primary-300 rounded-lg py-2.5 text-xs tracking-widest text-primary-700 font-bold transition-colors shadow-sm"
                >
                  <span className="flex items-center justify-center gap-2"><FiPlay /> RUN_DIAGNOSTIC</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto flex justify-between px-6 pb-24 z-10 h-full overflow-hidden">
        
        {/* Left Side: Conversation Stream */}
        <div className="w-full md:w-1/3 h-full flex flex-col justify-end pb-10">
          <div className="overflow-y-auto pr-4 scroll-smooth space-y-6 flex-1 flex flex-col justify-end pb-4" style={{maskImage: 'linear-gradient(to bottom, transparent, black 15%, black)'}}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end animate-slide-left' : 'justify-start animate-slide-right'}`}>
                <div className={`relative max-w-[90%] p-4 rounded-lg text-sm md:text-base border shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary-50 text-[#1D1D1F] border-primary-500/30' 
                    : 'bg-white text-[#1D1D1F] border-gray-200'
                }`}>
                  {/* Glowing connector line */}
                  <div className={`absolute top-1/2 -translate-y-1/2 w-8 h-[1px] ${msg.role === 'user' ? 'bg-primary-500/50 -right-8' : 'bg-white/20 -left-8'}`} />
                  <div className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${msg.role === 'user' ? 'bg-primary-400 -right-8 shadow-[0_0_5px_#FFEDE1]' : 'bg-white/50 -left-8'}`} />
                  
                  {msg.role === 'assistant' && msg.content.includes('High Intent') && (
                    <span className="absolute -top-3 left-2 bg-accent-success/20 border border-accent-success text-accent-success text-[9px] uppercase px-2 py-0.5 rounded tracking-widest animate-glitch">
                      High_Intent_Detected
                    </span>
                  )}
                  {msg.role === 'assistant' && msg.content.includes('Objection') && (
                    <span className="absolute -top-3 left-2 bg-accent-alert/20 border border-accent-alert text-accent-alert text-[9px] uppercase px-2 py-0.5 rounded tracking-widest animate-glitch">
                      Objection_Logged
                    </span>
                  )}
                  
                  <p className="leading-relaxed whitespace-pre-wrap font-light">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="glass-panel p-4 rounded-lg border border-primary-500/30 flex gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Right Side: Emotion Radar */}
        <div className="hidden lg:flex w-1/4 h-full flex-col justify-center items-end pr-10">
          <div className="glass-panel rounded-xl border border-primary-500/20 p-6 w-full max-w-sm relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50"></div>
            
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-primary-600 text-center mb-6 font-mono flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded bg-primary-400 animate-pulse"></span>
              Neural_State_Analysis
            </h3>
            
            <svg viewBox="0 0 200 200" className="w-full drop-shadow-md">
              {/* Radar Grids */}
              {[1, 0.66, 0.33].map((scale, si) => (
                <polygon key={si} points={getRadarPoints(Array(5).fill(scale * 100), 100, 100, 70)} fill="none" stroke="rgba(214, 169, 157, 0.3)" strokeWidth="1" />
              ))}
              {/* Axes */}
              {[0,1,2,3,4].map(i => {
                const angle = (Math.PI * 2 * i / 5) - Math.PI / 2;
                const x = 100 + 70 * Math.cos(angle);
                const y = 100 + 70 * Math.sin(angle);
                return <line key={i} x1="100" y1="100" x2={x} y2={y} stroke="rgba(214, 169, 157, 0.4)" strokeWidth="1" />;
              })}
              
              {/* Emotion Polygon */}
              <polygon
                points={getRadarPoints([
                  emotion.scores.excited,
                  emotion.scores.curious,
                  emotion.scores.neutral,
                  emotion.scores.skeptical,
                  emotion.scores.frustrated
                ], 100, 100, 70)}
                fill="rgba(214, 169, 157, 0.25)"
                stroke="#D6A99D"
                strokeWidth="1.5"
                className="transition-all duration-700"
                style={{ filter: 'drop-shadow(0 0 5px rgba(214, 169, 157, 0.4))' }}
              />
              
              {/* Data Points & Labels */}
              {[
                { val: emotion.scores.excited, label: 'EXCITED' },
                { val: emotion.scores.curious, label: 'CURIOUS' },
                { val: emotion.scores.neutral, label: 'NEUTRAL' },
                { val: emotion.scores.skeptical, label: 'SKEPTICAL' },
                { val: emotion.scores.frustrated, label: 'FRUSTRATED' }
              ].map((item, i) => {
                const angle = (Math.PI * 2 * i / 5) - Math.PI / 2;
                const r = (item.val / 100) * 70;
                const px = 100 + r * Math.cos(angle);
                const py = 100 + r * Math.sin(angle);
                const lx = 100 + 85 * Math.cos(angle);
                const ly = 100 + 85 * Math.sin(angle);
                return (
                  <g key={i}>
                    <circle cx={px} cy={py} r="2.5" fill="#D6A99D" className="transition-all duration-700 shadow-sm" />
                    <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="#1D1D1F" fontSize="8" fontWeight="bold" fontFamily="monospace" letterSpacing="1">{item.label}</text>
                  </g>
                );
              })}
            </svg>
            
            <div className="text-center mt-6">
              <span className={`text-[10px] uppercase font-mono tracking-widest px-3 py-1.5 rounded-lg border font-bold ${
                emotion.dominant === 'excited' ? 'bg-green-50 text-green-700 border-green-300' :
                emotion.dominant === 'curious' ? 'bg-primary-50 text-primary-700 border-primary-300' :
                emotion.dominant === 'skeptical' ? 'bg-orange-50 text-orange-700 border-orange-300' :
                emotion.dominant === 'frustrated' ? 'bg-red-50 text-red-700 border-red-300' :
                'bg-gray-100 text-gray-700 border-gray-300'
              }`}>
                DOMINANT_STATE: {emotion.dominant}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Bar: Voice Interaction */}
      <footer className="absolute bottom-0 w-full p-6 z-20 flex flex-col items-center justify-end bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/90 to-transparent h-48">
        
        {/* Waveform Visualizer */}
        <div className="h-12 flex items-end gap-1 mb-4 opacity-80">
          {(isListening || isLoading) && Array.from({length: 15}).map((_, i) => (
            <div 
              key={i} 
              className={`w-1 rounded-t-sm ${isListening ? 'bg-accent-alert shadow-[0_0_10px_#9F8772]' : 'bg-primary-400 shadow-[0_0_10px_#D6A99D]'} waveform-bar`} 
              style={{ animationDelay: `${i * 0.1}s`, height: isListening ? '8px' : '4px' }}
            />
          ))}
        </div>

        <div className="w-full max-w-3xl relative flex items-center justify-center gap-4">
          <form onSubmit={handleSend} className="w-full relative flex items-center group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="DATA_INPUT_STREAM..."
              className="w-full bg-white border border-primary-500/30 rounded-l-full rounded-r-full py-4 px-8 text-sm font-mono text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-md pr-32"
              disabled={isLoading}
            />
            
            {/* Language selector pill next to mic */}
            <select
              className="absolute right-28 bg-white/90 border border-primary-300/50 rounded-full px-2 py-1.5 text-[10px] font-mono text-gray-700 outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer shadow-sm"
              value={sttLanguage}
              onChange={(e) => setSttLanguage(e.target.value)}
              title="Speech Recognition Language"
            >
              {sttLanguageOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={toggleListening}
              className={`absolute right-14 w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                isListening 
                  ? 'bg-accent-alert text-white animate-pulse shadow-[0_0_15px_rgba(159,135,114,0.5)]' 
                  : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              }`}
            >
              <FiMic />
            </button>
            
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 bg-primary-600 hover:bg-primary-500 disabled:bg-gray-800 disabled:text-gray-500 text-white w-10 h-10 rounded-full transition-colors flex items-center justify-center neon-border"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-0.5">
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
              </svg>
            </button>
          </form>
        </div>
        
        <div className="text-[9px] uppercase tracking-widest text-gray-500 font-mono mt-4 font-bold">
          SAARTHI.AI // NEURAL_LINK_ACTIVE
        </div>
      </footer>
    </div>
  );
}
