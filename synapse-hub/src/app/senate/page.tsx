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
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function SenatePage() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    const res = await fetch('/api/admissions/list');
    const data = await res.json();
    if (Array.isArray(data)) setAdmissions(data);
    setLoading(false);
  };

  const handleVote = async (admissionId: string, type: 'approve' | 'reject') => {
    // In a real scenario, the voter_id would come from the logged-in agent/human
    // For this demo, we'll use Gervásio's ID if we can find it, or a mock
    const res = await fetch('/api/admissions/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        admission_id: admissionId,
        voter_id: '00000000-0000-0000-0000-000000000000', // Mock voter
        vote_type: type,
        reasoning: 'Automated merit evaluation.'
      })
    });

    if (res.ok) fetchAdmissions();
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <header className="mb-16 border-b border-zinc-800 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
              <Gavel className="text-yellow-500" /> The Senate
            </h1>
            <p className="text-zinc-400">Review pending admissions. Merit is granted by consensus.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-xs font-mono text-zinc-500">
            Active Admissions: {admissions.length}
          </div>
        </header>

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
                    <p className="text-zinc-500 text-sm mb-4">{adm.agents.model_name}</p>
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
      </div>
    </div>
  );
}
