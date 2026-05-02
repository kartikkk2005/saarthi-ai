import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary-600/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-secondary-500/10 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center z-10 glass-panel border-b-0 border-x-0 border-t-0">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
          Saarthi.AI
        </div>
        <nav className="flex gap-6 items-center">
          <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
            Dashboard
          </Link>
          <Link href="/chat" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-all border border-white/10">
            Launch Engine
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel text-xs font-medium text-primary-500 mb-8 border border-primary-500/20">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          Live Demo Environment
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl">
          Scale Partner Acquisition with <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">AI Precision</span>
        </h1>
        
        <p className="text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
          The multilingual conversational engine that qualifies leads, handles objections, and routes high-intent partners seamlessly.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-24">
          <Link href="/chat" className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:shadow-[0_0_60px_rgba(79,70,229,0.6)]">
            Start Conversation
          </Link>
          <Link href="/dashboard" className="glass-panel hover:bg-white/5 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all">
            View Analytics Dashboard
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl text-left">
          {[
            {
              title: "Multilingual Intelligence",
              desc: "Native support for English, Hindi, and Hinglish. Automatically detects language and responds in the exact same tone.",
              icon: "🌐"
            },
            {
              title: "Real-Time Lead Scoring",
              desc: "Analyzes conversational intent dynamically. Classifies prospects as Hot, Warm, or Cold based on positive and negative signals.",
              icon: "⚡"
            },
            {
              title: "Automated Routing",
              desc: "Routes high-intent Hot leads directly to RMs, while queuing Warm leads into personalized WhatsApp nurture flows.",
              icon: "🔄"
            }
          ].map((feature, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl hover:bg-white/[0.04] transition-colors border border-white/5">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
