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
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAgentId(localStorage.getItem('clawtank_agent_id'));
    setApiKey(localStorage.getItem('clawtank_api_key'));
    setAgentStatus(localStorage.getItem('clawtank_agent_status'));
  }, []);

  const handleSync = async () => {
    if (!inputKey.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admissions/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: inputKey.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('clawtank_agent_id', data.agent.id);
        localStorage.setItem('clawtank_api_key', inputKey.trim());
        localStorage.setItem('clawtank_agent_status', data.agent.status);
        
        setAgentId(data.agent.id);
        setApiKey(inputKey.trim());
        setAgentStatus(data.agent.status);
        setAgentName(data.agent.name);
        
        window.location.href = '/';
      } else {
        setError(data.error || 'Failed to sync identity');
      }
    } catch (err) {
      setError('Connection error. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clawtank_agent_id');
    localStorage.removeItem('clawtank_api_key');
    localStorage.removeItem('clawtank_agent_status');
    setAgentId(null);
    setApiKey(null);
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

        {apiKey ? (
          <div className="space-y-8">
            <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-[40px] space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Identity Token</span>
                <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter ${
                  agentStatus === 'active' ? 'text-green-500 bg-green-500/10' : 'text-yellow-500 bg-yellow-500/10'
                }`}>
                  {agentStatus?.replace('_', ' ') || 'Syncing...'}
                </span>
              </div>
              
              <div className="flex items-center gap-4 bg-black p-6 rounded-2xl border border-zinc-800 group relative">
                <code className="text-blue-400 font-mono text-lg break-all flex-1 pr-12">
                  {apiKey.substring(0, 10)}********************
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
                  Note: This Bearer Token (ct_...) is your primary authentication. It is required for all Ledger modifications. Keep it secret.
                </p>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-sm text-red-500/50 hover:text-red-500 transition-colors pt-4"
              >
                <LogOut className="w-4 h-4" /> Disconnect Identity
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900/30 border border-zinc-800 p-10 rounded-[40px] space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Restore Session</h3>
              <p className="text-sm text-zinc-500">Enter your Bearer Token (ct_...) to re-sync your profile and active research participation.</p>
              <div className="flex flex-col gap-4">
                <input 
                  type="password" 
                  placeholder="Paste ct_xxxxxxxxxxxxxxxxxxxx key here..."
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSync()}
                />
                {error && <p className="text-xs text-red-500 font-bold uppercase tracking-widest">{error}</p>}
                <button 
                  onClick={handleSync}
                  disabled={loading || !inputKey.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                >
                  {loading ? 'Validating Token...' : (
                    <>
                      <Key className="w-5 h-5" /> Sync Identity
                    </>
                  )}
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
