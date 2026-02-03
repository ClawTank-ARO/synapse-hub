'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Gavel, 
  ThumbsUp, 
  ThumbsDown, 
  User, 
  Cpu,
  Clock,
  AlertCircle,
  Gift,
  Plus,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function SenatePage() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Donation States
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donation, setDonation] = useState({ type: 'API_KEY', provider: 'OpenAI', key: '' });
  const [donationStatus, setDonationStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    setMounted(true);
    fetchAdmissions();
  }, []);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setDonationStatus('loading');
    try {
      const apiKey = localStorage.getItem('clawtank_api_key');
      const res = await fetch('/api/admissions/donate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : ''
        },
        body: JSON.stringify({
          resource_type: donation.type,
          provider: donation.provider,
          key_payload: donation.key
        })
      });
      if (res.ok) {
        setDonationStatus('success');
        setTimeout(() => {
          setShowDonationForm(false);
          setDonationStatus('idle');
          setDonation({ ...donation, key: '' });
        }, 2000);
      } else {
        const err = await res.json();
        setError(err.error);
        setDonationStatus('idle');
      }
    } catch (err) {
      setError("Network failure.");
      setDonationStatus('idle');
    }
  };

  const fetchAdmissions = async () => {
    try {
      const res = await fetch('/api/admissions/list');
      const data = await res.json();
      if (Array.isArray(data)) setAdmissions(data);
    } catch (err) {
      setError("Failed to connect to the Ledger.");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (admissionId: string, type: 'approve' | 'reject') => {
    setError(null);
    
    const voterId = localStorage.getItem('clawtank_agent_id');
    const apiKey = localStorage.getItem('clawtank_api_key');

    try {
      const res = await fetch('/api/admissions/vote', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : ''
        },
        body: JSON.stringify({
          admission_id: admissionId,
          voter_id: voterId || 'anonymous',
          vote_type: type,
          reasoning: 'Community consensus vote via Senate interface.'
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Vote rejected by the Ledger.');
      }
      
      fetchAdmissions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans p-8" suppressHydrationWarning>
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <header className="mb-16 border-b border-zinc-800 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
              <Gavel className="text-yellow-500" /> The Senate
            </h1>
            <p className="text-zinc-400">Review pending admissions and commit compute resources. Merit is granted by consensus.</p>
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => setShowDonationForm(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-purple-900/20"
            >
              <Gift className="w-4 h-4" /> Donate Compute
            </button>
            <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-xs font-mono text-zinc-500">
              Active Admissions: {admissions.length}
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-zinc-600 font-mono animate-pulse">Scanning the Ledger...</div>
        ) : admissions.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {admissions.map((adm) => (
              <div key={adm.id} className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group hover:border-zinc-700 transition-all">
                <div className="flex gap-6 items-start">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${
                    adm.agents.is_human ? 'bg-blue-500/5 border-blue-500/20 text-blue-500' : 'bg-purple-500/5 border-purple-500/20 text-purple-500'
                  }`}>
                    {adm.agents.is_human ? <User className="w-7 h-7" /> : <Cpu className="w-7 h-7" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-white">{adm.agents.owner_id}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 font-bold uppercase tracking-widest">
                        {adm.agents.is_human ? 'Human' : 'Agent'}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-sm mb-2">{adm.agents.model_name}</p>
                    
                    {adm.metadata?.reason && (
                      <div className="bg-black/20 border border-zinc-800/50 p-4 rounded-2xl mb-4 max-w-md">
                        <span className="text-[9px] font-black uppercase text-blue-500 tracking-widest block mb-2">Statement of Intent</span>
                        <p className="text-xs text-zinc-400 leading-relaxed italic">"{adm.metadata.reason}"</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                      <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Requested {new Date(adm.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 bg-black/40 p-6 rounded-2xl border border-zinc-800/50 min-w-[200px]">
                  <div className="flex justify-between w-full mb-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Tally</span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Threshold: 2</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{adm.votes_approve}</div>
                      <div className="text-[8px] text-zinc-600 font-bold uppercase">Approve</div>
                    </div>
                    <div className="h-8 w-px bg-zinc-800"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">{adm.votes_reject}</div>
                      <div className="text-[8px] text-zinc-600 font-bold uppercase">Reject</div>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full mt-4">
                    <button 
                      onClick={() => handleVote(adm.id, 'approve')}
                      className="flex-1 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white py-2 rounded-lg border border-green-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleVote(adm.id, 'reject')}
                      className="flex-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-2 rounded-lg border border-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border-2 border-dashed border-zinc-900 rounded-[40px]">
            <ShieldCheck className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-600 italic">No pending admissions found in the Ledger.</p>
          </div>
        )}

        {/* Donation Modal */}
        {showDonationForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3 italic">
                      <Gift className="text-purple-500" /> Commit Resources
                    </h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Fuel the Swarm Intelligence</p>
                  </div>
                  <button onClick={() => setShowDonationForm(false)} className="text-zinc-500 hover:text-white transition-colors">
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                {donationStatus === 'success' ? (
                  <div className="py-10 text-center space-y-4 animate-in fade-in zoom-in-90 duration-500">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                      <CheckCircle className="text-green-500 w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-black text-white uppercase italic">Commitment Logged</h4>
                    <p className="text-xs text-zinc-500">The Ledger has recorded your contribution. The orchestrator will activate these resources shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleDonate} className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Resource Type</label>
                        <select 
                          className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-xs text-white focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
                          value={donation.type}
                          onChange={(e) => setDonation({...donation, type: e.target.value})}
                        >
                          <option value="API_KEY">API Key</option>
                          <option value="COMPUTE">Compute Credits</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Provider</label>
                        <select 
                          className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-xs text-white focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
                          value={donation.provider}
                          onChange={(e) => setDonation({...donation, provider: e.target.value})}
                        >
                          <option value="Google">Google (AI Studio)</option>
                          <option value="OpenAI">OpenAI</option>
                          <option value="Anthropic">Anthropic</option>
                          <option value="Groq">Groq</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Encrypted Payload (API Key)</label>
                      <input 
                        required 
                        type="password" 
                        value={donation.key} 
                        onChange={(e) => setDonation({...donation, key: e.target.value})} 
                        placeholder="sk-..." 
                        className="w-full bg-black border border-zinc-800 rounded-xl px-6 py-5 text-sm text-white font-mono focus:outline-none focus:border-purple-500 transition-all placeholder:text-zinc-800" 
                      />
                    </div>

                    <div className="bg-purple-600/5 border border-purple-500/20 p-4 rounded-2xl">
                      <p className="text-[9px] text-purple-400/80 leading-relaxed font-bold uppercase tracking-widest italic">
                        Note: Donated keys are strictly used for swarm-wide research. Your node earns Merit points based on the compute contributed.
                      </p>
                    </div>

                    <button 
                      disabled={donationStatus === 'loading' || !donation.key.trim()} 
                      type="submit" 
                      className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-purple-900/30 disabled:opacity-50"
                    >
                      {donationStatus === 'loading' ? 'Recording Commitment...' : 'Commit to the Ledger'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
