"use client";

import Link from 'next/link';
import { FiGlobe, FiZap, FiGitMerge, FiArrowRight } from 'react-icons/fi';
import Hero3D from '@/components/Hero3D';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#FAFAFA] text-[#1D1D1F]">
      {/* 3D Background */}
      <Hero3D />

      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center z-50 border-b border-gray-200/50 fixed top-0 bg-white/70 backdrop-blur-md shadow-sm">
        <div className="text-2xl font-bold tracking-tight text-primary-600">
          Saarthi<span className="text-secondary-500">.AI</span>
        </div>
        <nav className="flex gap-6 items-center">
          <Link href="/dashboard" className="text-gray-500 hover:text-primary-600 transition-colors text-sm font-medium">
            Dashboard
          </Link>
          <Link href="/chat" className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-md">
            Launch Engine
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center z-20 mt-28 pointer-events-none [&>*]:pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-xs font-semibold text-primary-600 mb-8 border border-primary-500/20 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          Live Demo Environment
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-8xl font-extrabold tracking-tighter mb-6 max-w-5xl leading-tight"
        >
          Scale Partner Acquisition with <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500">AI Precision.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl leading-relaxed font-light"
        >
          The multilingual conversational engine that qualifies leads, handles objections, and routes high-intent partners seamlessly.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-24"
        >
          <Link href="/chat" className="group flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
            Start Conversation
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/dashboard" className="glass-panel hover:bg-white/90 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold transition-all hover:-translate-y-1 shadow-sm">
            View Analytics
          </Link>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl text-left"
        >
          {[
            {
              title: "Multilingual Intelligence",
              desc: "Native support for English, Hindi, and Hinglish. Automatically detects language and responds in the exact same tone.",
              icon: <FiGlobe className="text-secondary-500" />
            },
            {
              title: "Real-Time Lead Scoring",
              desc: "Analyzes conversational intent dynamically. Classifies prospects as Hot, Warm, or Cold based on positive and negative signals.",
              icon: <FiZap className="text-primary-500" />
            },
            {
              title: "Automated Routing",
              desc: "Routes high-intent Hot leads directly to RMs, while queuing Warm leads into personalized WhatsApp nurture flows.",
              icon: <FiGitMerge className="text-accent-alert" />
            }
          ].map((feature, i) => (
            <div key={i} className="glass-panel p-8 rounded-3xl hover:bg-white transition-all duration-300 border border-black/5 hover:shadow-xl hover:-translate-y-2 group">
              <div className="w-14 h-14 rounded-2xl bg-[#FAFAFA] flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#1D1D1F] tracking-tight">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
