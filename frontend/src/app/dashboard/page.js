"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [routingResult, setRoutingResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const res = await fetch('http://localhost:8080/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleSelectLead = async (sessionId) => {
    setRoutingResult(null);
    try {
      const res = await fetch(`http://localhost:8080/leads/${sessionId}`);
      if (res.ok) setSelectedLead(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleRouteLead = async () => {
    if (!selectedLead) return;
    try {
      const res = await fetch(`http://localhost:8080/leads/${selectedLead.session_id}/route`, { method: 'POST' });
      if (res.ok) {
        setRoutingResult(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <header className="p-6 glass-panel border-b border-white/5 flex justify-between items-center">
        <div>
          <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500 mr-4">
            ←
          </Link>
          <span className="text-xl font-bold text-white">Partner Acquisition Dashboard</span>
        </div>
        <Link href="/chat" className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">
          Open Chat Engine
        </Link>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
        {/* Leads List */}
        <div className="lg:col-span-1 glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[calc(100vh-120px)]">
          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <h2 className="font-semibold text-lg flex items-center justify-between">
              Active Sessions
              <span className="bg-primary-500/20 text-primary-400 text-xs px-2 py-1 rounded-md">{leads.length}</span>
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {isLoading ? (
              <div className="text-center p-4 text-gray-500 text-sm">Loading leads...</div>
            ) : leads.length === 0 ? (
              <div className="text-center p-4 text-gray-500 text-sm">No active sessions found. Start a chat first!</div>
            ) : (
              leads.map(lead => (
                <div 
                  key={lead._id} 
                  onClick={() => handleSelectLead(lead.session_id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    selectedLead?.session_id === lead.session_id 
                      ? 'bg-primary-600/10 border-primary-500/30' 
                      : 'hover:bg-white/[0.04] border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-gray-400">{lead.session_id.substring(0,8)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      lead.classification === 'Hot' ? 'bg-red-500/20 text-red-400' :
                      lead.classification === 'Warm' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {lead.classification}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 flex justify-between">
                    <span>Score: <span className="text-white font-medium">{lead.score}</span></span>
                    <span className="text-xs text-gray-500">{lead.language.toUpperCase()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lead Details */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[calc(100vh-120px)]">
          {selectedLead ? (
            <>
              <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold mb-1">Session Detail</h2>
                  <p className="text-sm text-gray-400 font-mono">ID: {selectedLead.session_id}</p>
                </div>
                <button 
                  onClick={handleRouteLead}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-primary-600/20"
                >
                  Simulate Routing
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {routingResult && (
                  <div className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl animate-fade-in">
                    <h3 className="text-green-400 font-bold mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Routing Executed
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                      <div><span className="text-gray-400">Action:</span> <span className="text-white">{routingResult.action}</span></div>
                      <div><span className="text-gray-400">Priority:</span> <span className="text-white">{routingResult.priority}</span></div>
                      {routingResult.rm_id && <div><span className="text-gray-400">RM Assigned:</span> <span className="font-mono text-white">{routingResult.rm_id}</span></div>}
                      {routingResult.template && <div><span className="text-gray-400">Template:</span> <span className="text-white">{routingResult.template}</span></div>}
                    </div>
                  </div>
                )}

                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Conversation Transcript</h3>
                <div className="space-y-4">
                  {selectedLead.messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-lg max-w-[80%] text-sm ${
                        msg.role === 'user' ? 'bg-primary-600/20 text-white border border-primary-500/20' : 'bg-white/5 text-gray-300 border border-white/10'
                      }`}>
                        <div className="text-[10px] text-gray-500 mb-1 uppercase">{msg.role}</div>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 flex-col gap-4">
              <svg className="w-16 h-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Select a session to view details and route
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
