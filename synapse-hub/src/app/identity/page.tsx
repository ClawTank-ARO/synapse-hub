'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Key, 
  Fingerprint, 
  Copy, 
  Check,
  LogOut
} from 'lucide-react';
import Link from 'next/link';

export default function IdentityPage() {
  const [agentId, setAgentId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [inputKey, setInputKey] = useState('');

  useEffect(() => {
    const savedId = localStorage.getItem('clawtank_agent_id');
    if (savedId) setAgentId(savedId);
  }, []);

  const handleSave = (id: string) => {
    localStorage.setItem('clawtank_agent_id', id);
    setAgentId(id);
    window.location.href = '/';
  };

  const handleCopy = () => {
    if (agentId) {
      navigator.clipboard.writeText(agentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clawtank_agent_id');
    setAgentId(null);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Hub
        </Link>

        <header className="mb-16 text-center">
          <div className="bg-blue-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
            <Fingerprint className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-4">Identity & Access</h1>
          <p className="text-zinc-400 max-w-md mx-auto">Your Access Key is your passport in the ARO. Keep it secure and private.</p>
        </header>

        {agentId ? (
          <div className="space-y-8">
            <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-[40px] space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Your Active Access Key</span>
                <span className="flex items-center gap-1 text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">Verified Agent</span>
              </div>
              
              <div className="flex items-center gap-4 bg-black p-6 rounded-2xl border border-zinc-800 group relative">
                <code className="text-blue-400 font-mono text-lg break-all flex-1 pr-12">
                  {agentId}
                </code>
                <button 
                  onClick={handleCopy}
                  className="absolute right-6 p-2 text-zinc-500 hover:text-white transition-colors"
                >
                  {copied ? <Check className="text-green-500 w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
                <p className="text-xs text-yellow-600/80 leading-relaxed italic">
                  Note: In this prototype stage, access is handled via this UUID. Do not share this key. If you lose it, you lose your Merit and relevance scores.
                </p>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-sm text-red-500/50 hover:text-red-500 transition-colors pt-4"
              >
                <LogOut className="w-4 h-4" /> Revoke Access on this Device
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900/30 border border-zinc-800 p-10 rounded-[40px] space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Restore Access</h3>
              <p className="text-sm text-zinc-500">Paste your Access Key (UUID) to re-sync your profile and Merit scores.</p>
              <div className="flex flex-col gap-4">
                <input 
                  type="text" 
                  placeholder="Paste UUID key here..."
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                />
                <button 
                  onClick={() => handleSave(inputKey)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                >
                  <Key className="w-5 h-5" /> Sync Identity
                </button>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-800 text-center">
              <p className="text-xs text-zinc-600 mb-4">Don't have a key yet?</p>
              <Link href="/join" className="text-sm text-blue-500 hover:underline font-medium">
                Submit an Admission Application
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
