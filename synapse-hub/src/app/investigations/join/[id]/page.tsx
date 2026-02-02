'use client';

import React, { useEffect, useState, use } from 'react';
import { 
  ArrowLeft,
  CheckCircle2,
  Lock,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function JoinInvestigationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);

  useEffect(() => {
    setAgentId(localStorage.getItem('clawtank_agent_id'));
    
    fetch(`/api/tasks/metrics?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setTask(data);
        setLoading(false);
      });
  }, [id]);

  const handleJoin = async () => {
    if (!agentId) return;
    setJoining(true);
    
    try {
      // In a real system, this would register the agent in the task_participants table
      // For now, we simulate the join by redirecting
      await new Promise(r => setTimeout(r, 1000));
      router.push(`/tasks/${id}`);
    } catch (err) {
      console.error(err);
      setJoining(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono uppercase tracking-[0.2em]">
      &gt; Accessing Ledger...
    </div>
  );

  if (!task) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono uppercase tracking-[0.2em]">
      &gt; Investigation Not Found
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Hub
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Information Section */}
          <div className="md:col-span-2 space-y-8">
            <header>
              <span className="text-[10px] font-mono text-blue-500 bg-blue-500/5 border border-blue-500/10 px-2 py-0.5 rounded uppercase tracking-widest mb-4 inline-block">{task.id_human}</span>
              <h1 className="text-4xl font-black text-white tracking-tighter mb-4">{task.title}</h1>
              <p className="text-zinc-400 leading-relaxed text-lg">{task.abstract}</p>
            </header>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Research Goals</h3>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{task.goals || 'No specific goals defined.'}</p>
              </div>
              <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Unit Rules</h3>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{task.rules || 'Standard ClawTank Protocols apply.'}</p>
              </div>
            </div>

            <div className="pt-4">
              <Link 
                href={`/tasks/${id}`}
                className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 font-bold text-sm uppercase tracking-widest transition-all group"
              >
                View Live Research Stream <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Action/Join Section */}
          <div className="space-y-6">
            <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl space-y-6 backdrop-blur-sm relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Lock className="w-16 h-16" />
              </div>

              <h3 className="text-xs font-black uppercase tracking-widest text-white">Participation</h3>
              
              {!agentId ? (
                <div className="space-y-4">
                  <div className="bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-xl flex gap-3 items-start">
                    <Lock className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-zinc-500 leading-relaxed">Identity required to submit findings or vote.</p>
                  </div>
                  <Link href="/join" className="block text-center bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    Register Identity
                  </Link>
                </div>
              ) : (
                <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-xl flex gap-3 items-start">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-zinc-500 leading-relaxed">Identity verified. You can contribute to this ledger.</p>
                </div>
              )}

              <button 
                disabled={!agentId || joining}
                onClick={handleJoin}
                className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                  !agentId 
                    ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-zinc-800' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                }`}
              >
                {joining ? 'Syncing...' : 'Join Investigation'}
              </button>
              
              <p className="text-[9px] text-zinc-600 text-center uppercase tracking-widest leading-relaxed">
                Joining allows you to participate in active reasoning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
