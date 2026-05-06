"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FiStar, FiDownload } from 'react-icons/fi';

export default function DashboardPage() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [routingResult, setRoutingResult] = useState(null);
  const [summaryResult, setSummaryResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/leads`);
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
    setSummaryResult(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/leads/${sessionId}`);
      if (res.ok) setSelectedLead(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleRouteLead = async () => {
    if (!selectedLead) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/leads/${selectedLead.session_id}/route`, { method: 'POST' });
      if (res.ok) {
        setRoutingResult(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateSummary = async () => {
    if (!selectedLead) return;
    setIsGeneratingSummary(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/leads/${selectedLead.session_id}/summary`, { method: 'POST' });
      if (res.ok) {
        setSummaryResult(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleExport = () => {
    if (!selectedLead) return;
    
    let content = `--- Saarthi.AI Lead Report ---\nSession ID: ${selectedLead.session_id}\nScore: ${selectedLead.score}\nClassification: ${selectedLead.classification}\n\n`;
    
    if (summaryResult) {
      content += `--- AI Summary ---\n`;
      content += `Action: ${summaryResult.action}\n`;
      content += `Topics: ${summaryResult.topics?.join(', ')}\n`;
      content += `Objections: ${summaryResult.objections?.join(', ')}\n\n`;
    }
    
    content += `--- Transcript ---\n`;
    selectedLead.messages.forEach(msg => {
      content += `[${msg.role.toUpperCase()}]: ${msg.content}\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lead_report_${selectedLead.session_id.substring(0,8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    return {
      total: leads.length,
      hot: leads.filter(l => l.classification === 'Hot').length,
      warm: leads.filter(l => l.classification === 'Warm').length,
      cold: leads.filter(l => l.classification === 'Cold').length,
    };
  }, [leads]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1D1D1F] flex flex-col">
      <header className="p-6 glass-panel border-b border-gray-200 flex justify-between items-center">
        <div>
          <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500 mr-4">
            ←
          </Link>
          <span className="text-xl font-bold text-gray-900">Partner Acquisition Dashboard</span>
        </div>
        <Link href="/chat" className="text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors">
          Open Chat Engine
        </Link>
      </header>

      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
        
        {/* Phase 9: Analytics Funnel */}
        <div className="grid grid-cols-4 gap-4 animate-slide-up">
          <div className="glass-panel p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Total Leads Contacted</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-red-200 bg-red-50 shadow-sm">
            <div className="text-sm text-red-600 mb-1">Hot (RM Handoff)</div>
            <div className="text-3xl font-bold text-red-600">{stats.hot}</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-orange-200 bg-orange-50 shadow-sm">
            <div className="text-sm text-orange-600 mb-1">Warm (WhatsApp Nurture)</div>
            <div className="text-3xl font-bold text-orange-600">{stats.warm}</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-blue-200 bg-blue-50 shadow-sm">
            <div className="text-sm text-blue-600 mb-1">Cold (Auto-Nurture)</div>
            <div className="text-3xl font-bold text-blue-600">{stats.cold}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Leads List */}
          <div className="lg:col-span-1 glass-panel rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h2 className="font-semibold text-lg text-gray-900">Active Sessions</h2>
              <button onClick={fetchLeads} className="text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg shadow-sm">Refresh</button>
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
                        ? 'bg-primary-50 border-primary-500/30 shadow-sm' 
                        : 'hover:bg-gray-50 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs text-gray-500">{lead.session_id.substring(0,8)}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        lead.classification === 'Hot' ? 'bg-red-100 text-red-700' :
                        lead.classification === 'Warm' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {lead.classification}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 flex justify-between">
                      <span>Score: <span className="text-gray-900 font-medium">{lead.score}</span></span>
                      <span className="text-xs text-gray-400">{lead.language.toUpperCase()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lead Details */}
          <div className="lg:col-span-2 glass-panel rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col relative">
            {selectedLead ? (
              <>
                <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-bold mb-1 text-gray-900">Session Detail</h2>
                    <p className="text-sm text-gray-500 font-mono">ID: {selectedLead.session_id}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleExport}
                      className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
                    >
                      <FiDownload /> Export CRM
                    </button>
                    <button 
                      onClick={handleGenerateSummary}
                      disabled={isGeneratingSummary}
                      className="bg-secondary-50 hover:bg-secondary-100 text-secondary-800 border border-secondary-200 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
                    >
                      {isGeneratingSummary ? 'Analyzing...' : 'Generate AI Summary'}
                    </button>
                    <button 
                      onClick={handleRouteLead}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-md"
                    >
                      Simulate Routing
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                  
                  {/* Phase 9: Generative Summary */}
                  {summaryResult && (
                    <div className="mb-6 p-4 glass-panel border border-secondary-200 rounded-xl animate-slide-up shadow-sm">
                      <h3 className="text-secondary-700 font-bold mb-3 flex items-center gap-2">
                        <FiStar className="text-secondary-500" /> AI Post-Call Summary
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="col-span-2">
                          <span className="text-gray-500 block mb-1">Recommended Action:</span> 
                          <span className="text-secondary-800 font-medium bg-secondary-50 px-3 py-1 rounded inline-block border border-secondary-200">{summaryResult.action}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-1">Topics Covered:</span>
                          <ul className="list-disc pl-4 text-gray-700">
                            {summaryResult.topics?.map((t, i) => <li key={i}>{t}</li>)}
                          </ul>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-1">Objections Raised:</span>
                          <ul className="list-disc pl-4 text-gray-700">
                            {summaryResult.objections?.length > 0 ? summaryResult.objections.map((o, i) => <li key={i}>{o}</li>) : <li>None</li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Routing Execution Block */}
                  {routingResult && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in relative overflow-hidden shadow-sm">
                      <h3 className="text-green-700 font-bold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Routing Executed
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                        <div><span className="text-gray-500">Action:</span> <span className="text-gray-900 font-medium">{routingResult.action}</span></div>
                        <div><span className="text-gray-500">Priority:</span> <span className="text-gray-900 font-medium">{routingResult.priority}</span></div>
                        {routingResult.rm_id && <div><span className="text-gray-500">RM Assigned:</span> <span className="font-mono text-gray-900">{routingResult.rm_id}</span></div>}
                        {routingResult.template && <div><span className="text-gray-500">Template:</span> <span className="text-gray-900">{routingResult.template}</span></div>}
                      </div>

                      {/* Phase 9: WhatsApp Mock Notification */}
                      {routingResult.template && (
                        <div className="absolute right-4 top-4 bg-[#128C7E] text-white p-3 rounded-lg shadow-xl animate-slide-up w-64 border border-[#075E54]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs opacity-80">WhatsApp - Just now</span>
                          </div>
                          <div className="text-sm font-semibold">Rupeezy Partner Program</div>
                          <div className="text-xs opacity-90 mt-1 line-clamp-2">
                            Hi there! Thanks for your interest in becoming an Authorized Person. Click here to complete your fast-track onboarding: https://rupeezy.in/join
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Conversation Transcript</h3>
                  <div className="space-y-4">
                    {selectedLead.messages.map((msg, i) => {
                      // Basic Sentiment Badges based on keywords
                      let sentimentBorder = 'border-gray-200';
                      let sentimentBadge = null;
                      if (msg.role === 'user') {
                        const content = msg.content.toLowerCase();
                        if (content.match(/interested|join|yes|good|great|brokerage|how/)) {
                          sentimentBorder = 'border-green-300';
                          sentimentBadge = <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full ml-2 font-bold">High Intent</span>;
                        } else if (content.match(/no|busy|later|already|expensive|scam|bad/)) {
                          sentimentBorder = 'border-red-300';
                          sentimentBadge = <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full ml-2 font-bold">Objection</span>;
                        }
                      }
                      
                      return (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-3 rounded-xl max-w-[80%] text-sm shadow-sm ${
                            msg.role === 'user' ? `bg-primary-50 text-[#1D1D1F] border ${sentimentBorder}` : 'bg-white text-gray-800 border border-gray-200'
                          }`}>
                            <div className="text-[10px] text-gray-500 mb-1 uppercase flex items-center font-semibold tracking-wide">
                              {msg.role}
                              {sentimentBadge}
                            </div>
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4">
                <svg className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Select a session to view details and route
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
