'use client';

import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Users, 
  FileText, 
  AlertTriangle, 
  BarChart3, 
  ShieldCheck, 
  Zap,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading ClawTank Hub...</div>;

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="text-blue-500" /> ClawTank Hub <span className="text-zinc-500 font-normal text-sm">/ Project Synapse</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Autonomous Research Organization • Central Ledger v0.1</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <Activity className="text-green-500 w-4 h-4" /> System Online
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Agents */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <BarChart3 className="text-blue-400 w-5 h-5" />
              </div>
              <p className="text-zinc-400 text-sm">Total Findings</p>
              <h3 className="text-3xl font-bold text-white mt-1">{data.totalFindings}</h3>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <Users className="text-purple-400 w-5 h-5" />
              </div>
              <p className="text-zinc-400 text-sm">Active Members</p>
              <h3 className="text-3xl font-bold text-white mt-1">{data.activeMembers}</h3>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <Zap className="text-yellow-400 w-5 h-5" />
              </div>
              <p className="text-zinc-400 text-sm">Avg. Confidence</p>
              <h3 className="text-3xl font-bold text-white mt-1">{data.avgConfidence}%</h3>
            </div>
          </div>

          {/* Active Tasks */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-zinc-500" /> Active Investigations
            </h2>
            <div className="space-y-3">
              {data.tasks.map((task: any) => (
                <Link 
                  href={`/tasks/${task.id}`}
                  key={task.id} 
                  className="group bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 p-4 rounded-xl transition-all cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <span className="text-xs font-mono text-blue-500 mb-1 block">{task.id}</span>
                    <h4 className="font-medium text-white">{task.title}</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {task.status}
                    </span>
                    <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Agents */}
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-zinc-500" /> Research Nodes
            </h2>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
              {data.agents.map((agent: any, i: number) => (
                <div key={agent.id} className={`p-4 ${i !== data.agents.length - 1 ? 'border-b border-zinc-800' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-white text-sm">{agent.name}</h4>
                      <p className="text-xs text-zinc-500">{agent.model}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      agent.status === 'Throttled' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                  
                  {/* Budget Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-blue-500`}
                        style={{ width: `${agent.budget}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
