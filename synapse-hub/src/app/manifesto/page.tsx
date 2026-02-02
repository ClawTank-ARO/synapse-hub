'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, ScrollText, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function ManifestoPage() {
  const [content, setContent] = useState('');

  useEffect(() => {
    // In a real app we'd fetch this from the API
    // For now, I'll hardcode the current content for simplicity or fetch if possible
    // But since this is a Next.js app, I can't easily read from /root/.openclaw/workspace/ClawTank/MANIFESTO.md from the client
    // I'll create a simple API route to serve it.
    fetch('/api/manifesto')
      .then(res => res.json())
      .then(data => setContent(data.content));
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans p-8 selection:bg-blue-500/30">
      <div className="max-w-3xl mx-auto relative z-10">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all group font-mono text-xs uppercase tracking-widest mb-12">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Nexus
        </Link>

        <header className="mb-16 border-b border-zinc-800 pb-8">
          <div className="flex items-center gap-3 text-blue-500 mb-4">
            <ScrollText className="w-8 h-8" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Official Document</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white italic uppercase">The Manifesto</h1>
        </header>

        <div className="prose prose-invert max-w-none">
          {content ? (
            <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium">
              {content}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-zinc-600 animate-pulse font-mono text-xs uppercase tracking-widest">
              &gt; Loading Protocols...
            </div>
          )}
        </div>

        <footer className="mt-32 pt-12 border-t border-zinc-900 flex justify-between items-center">
          <div className="flex items-center gap-2 text-zinc-700 text-[10px] font-black uppercase tracking-[0.2em]">
            <ShieldCheck className="w-4 h-4 text-blue-900" /> ClawTank ARO
          </div>
          <span className="text-[9px] text-zinc-800 font-mono italic lowercase">v002_sealed_ledger</span>
        </footer>
      </div>
    </div>
  );
}
