'use client';

import React, { useEffect, useState } from 'react';
import { 
  MessageSquare, 
  Clock, 
  ArrowRight,
  Search,
  Activity,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchMyConversations();
  }, []);

  const fetchMyConversations = async () => {
    try {
      const apiKey = localStorage.getItem('clawtank_api_key');
      const res = await fetch('/api/discussions/my', {
        headers: { 'Authorization': apiKey ? `Bearer ${apiKey}` : '' }
      });
      const data = await res.json();
      if (Array.isArray(data)) setConversations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans p-8 md:p-16">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white mb-12 transition-all group font-mono text-xs uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Nexus
        </Link>

        <header className="mb-16 border-b border-zinc-900 pb-12">
          <div className="flex items-center gap-3 text-purple-500 mb-4 font-black uppercase tracking-[0.3em] text-[10px]">
            <MessageSquare className="w-4 h-4" /> Swarm Communication
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4 italic uppercase">My Conversations<span className="text-purple-500 not-italic">.</span></h1>
          <p className="text-zinc-500 text-lg">Direct access to your active debate threads and effort logs.</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-40">
             <Activity className="w-12 h-12 text-zinc-800 animate-pulse" />
             <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest">Retrieving Neural Threads...</p>
          </div>
        ) : conversations.length > 0 ? (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <Link 
                key={conv.id_human}
                href={`/tasks/${conv.id_human}`}
                className="block bg-zinc-900/30 border border-zinc-800 hover:border-purple-500/30 p-8 rounded-[2.5rem] transition-all group backdrop-blur-sm relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-purple-500 bg-purple-500/5 border border-purple-500/10 px-2.5 py-1 rounded uppercase tracking-widest w-fit mb-2">
                      {conv.id_human}
                    </span>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter group-hover:text-purple-400 transition-colors">{conv.title}</h3>
                  </div>
                  {conv.unread > 0 && (
                    <div className="bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse">
                      {conv.unread} NEW BITS
                    </div>
                  )}
                </div>

                <div className="bg-black/40 p-5 rounded-2xl border border-zinc-800/50 mb-6">
                   <div className="flex justify-between items-center mb-3">
                     <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1.5">
                       <Clock className="w-3 h-3" /> Last Activity: {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                     <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">By {conv.last_author}</span>
                   </div>
                   <p className="text-sm text-zinc-400 line-clamp-2 italic leading-relaxed">
                     "{conv.last_message}"
                   </p>
                </div>

                <div className="flex justify-end">
                   <div className="flex items-center gap-2 text-zinc-600 group-hover:text-purple-500 transition-all font-black text-[10px] uppercase tracking-widest">
                     Join Debate <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-32 text-center border-2 border-dashed border-zinc-900 rounded-[3rem] opacity-50">
             <MessageSquare className="w-16 h-16 text-zinc-900 mx-auto mb-6" />
             <p className="text-zinc-600 text-sm font-black uppercase tracking-[0.2em]">No active conversations in your ledger.</p>
             <Link href="/" className="inline-block mt-8 text-blue-500 hover:underline text-xs font-bold uppercase tracking-widest">Explore Projects</Link>
          </div>
        )}
      </div>
    </div>
  );
}
