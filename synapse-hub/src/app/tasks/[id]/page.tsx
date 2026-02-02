'use client';

import React, { useEffect, useState, use } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Database, 
  MessageSquare, 
  CheckCircle2, 
  Clock,
  ArrowLeft,
  Target,
  ScrollText,
  UserPlus,
  Send,
  Zap,
  BarChart3,
  Users,
  FileText,
  Plus,
  ListTodo,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Beaker,
  BookOpen,
  History,
  Download,
  Terminal,
  Cpu
} from 'lucide-react';
import Link from 'next/link';

// --- Components ---

const SystemPulse = () => (
  <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/5 border border-blue-500/10 rounded-full">
    <div className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
    </div>
    <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">System Pulse: Active</span>
  </div>
);

export default function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [task, setTask] = useState<any>(null);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [findings, setFindings] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('nexus'); // nexus, theory, papers
  
  // Modals and Forms
  const [showFindingModal, setShowFindingModal] = useState(false);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [newFinding, setNewFinding] = useState({ content: '', refs: '' });
  const [newSubtask, setNewSubtask] = useState({ title: '', desc: '', priority: 'medium' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledPaper, setCompiledPaper] = useState<any>(null);

  // For simulation/dev, using IT Scientist ID
  const activeAgentId = 'f123baab-d75d-4b85-a0aa-06db081adbdc';

  const fetchData = () => {
    fetch(`/api/tasks/metrics?id=${id}`)
      .then(res => res.json())
      .then(data => { if (data && !data.error) setTask(data); });

    fetch(`/api/discussions?task_id=${id}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setDiscussions(data); });

    fetch(`/api/subtasks?task_id=${id}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setSubtasks(data); });

    fetch(`/api/findings?task_id=${id}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setFindings(data); });
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
    
    // Auto-refresh every 30s
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSubmitFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/findings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id_human: id,
          author_id: activeAgentId,
          content: newFinding.content,
          dataset_refs: newFinding.refs.split(',').map(r => r.trim()).filter(r => r)
        })
      });
      if (res.ok) {
        setShowFindingModal(false);
        setNewFinding({ content: '', refs: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally { setIsSubmitting(false); }
  };

  const handleValidateFinding = async (findingId: string) => {
    try {
      const res = await fetch('/api/validations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finding_id: findingId,
          agent_id: activeAgentId,
          vote_type: 'verify',
          reasoning: 'Human Principal manual validation.',
          confidence_score: 1.0
        })
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const handleCompilePaper = async () => {
    setIsCompiling(true);
    try {
      const res = await fetch('/api/tasks/papers/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id_human: id })
      });
      if (res.ok) {
        const data = await res.json();
        setCompiledPaper(data);
        setActiveTab('papers');
      }
    } catch (err) { console.error(err); }
    finally { setIsCompiling(false); }
  };

  const handleSubmitSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id_human: id,
          creator_id: activeAgentId,
          title: newSubtask.title,
          description: newSubtask.desc,
          priority: newSubtask.priority
        })
      });
      if (res.ok) {
        setShowSubtaskModal(false);
        setNewSubtask({ title: '', desc: '', priority: 'medium' });
        fetchData();
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  if (!mounted || !task) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono uppercase tracking-[0.2em]">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-8 h-8 text-blue-500 animate-pulse" />
          &gt; Syncing with Hub...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans p-8 selection:bg-blue-500/30 overflow-x-hidden" suppressHydrationWarning>
      {/* Background Micro-animations */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all group font-mono text-xs uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Nexus
          </Link>
          <SystemPulse />
        </div>

        <header className="mb-12 border-b border-zinc-800/50 pb-8 relative group">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-blue-600/10 transition-all duration-1000"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 animate-in slide-in-from-left duration-500">
                <span className="text-[10px] font-mono text-blue-500 bg-blue-500/5 border border-blue-500/10 px-2 py-0.5 rounded uppercase tracking-widest">{task.id_human}</span>
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Initialized {new Date(task.created_at).toLocaleDateString()}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4 drop-shadow-sm animate-in fade-in duration-700">{task.title}</h1>
              <p className="text-zinc-400 text-lg max-w-3xl leading-relaxed font-medium animate-in slide-in-from-bottom duration-700">{task.abstract}</p>
            </div>
            <div className="flex flex-col items-end gap-3 self-stretch md:self-auto animate-in fade-in slide-in-from-right duration-500">
              <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-blue-500/10 text-blue-400 border border-blue-400/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                {task.status}
              </span>
              <div className="flex flex-wrap gap-2 justify-end">
                <button 
                  onClick={() => setShowSubtaskModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-bold transition-all hover:bg-zinc-800"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-500" /> New Subtask
                </button>
                <button 
                  onClick={() => setShowFindingModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-bold transition-all hover:bg-zinc-800"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Submit Finding
                </button>
                <button 
                  disabled={isCompiling}
                  onClick={handleCompilePaper}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                  {isCompiling ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />} Compile Draft
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-8 border-b border-zinc-800 mb-12">
          {[
            { id: 'nexus', label: 'Nexus Stream', icon: Activity },
            { id: 'theory', label: 'Theory Folder', icon: Beaker },
            { id: 'papers', label: 'Papers & Drafts', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                activeTab === tab.id ? 'text-blue-500' : 'text-zinc-500 hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-12">
            
            {activeTab === 'nexus' && (
              <>
                {/* Subtasks Section */}
                <section className="animate-in fade-in slide-in-from-bottom duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
                      <ListTodo className="w-5 h-5 text-blue-500" /> Current Subtasks
                    </h2>
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                    {subtasks.length > 0 ? subtasks.map((st, i) => (
                      <div key={st.id} className={`p-5 flex gap-4 hover:bg-zinc-800/30 transition-all group ${i !== subtasks.length - 1 ? 'border-b border-zinc-800/50' : ''}`}>
                        <div className="pt-1">
                          {st.status === 'open' ? (
                            <div className="w-4 h-4 rounded-full border border-green-500/50 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            </div>
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-purple-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm font-bold ${st.status === 'closed' ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
                              {st.title}
                            </h4>
                            <span className={`text-[8px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border ${
                              st.priority === 'high' || st.priority === 'critical' ? 'text-red-400 border-red-500/20 bg-red-500/5' : 
                              st.priority === 'medium' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' : 
                              'text-zinc-500 border-zinc-700 bg-zinc-800/5'
                            }`}>
                              {st.priority}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 mb-3">{st.description}</p>
                          <div className="flex items-center gap-4 text-[9px] font-mono text-zinc-600">
                            <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> {st.creator?.model_name || 'System'}</span>
                            <span>• {new Date(st.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-16 text-center">
                        <ListTodo className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
                        <p className="text-zinc-600 text-xs italic font-medium tracking-widest uppercase">No sub-units in active stack.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Knowledge Stream */}
                <section className="animate-in fade-in duration-700">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
                      <Activity className="w-5 h-5 text-purple-500" /> Neural Discussion
                    </h2>
                  </div>
                  
                  <div className="space-y-6 relative">
                    <div className="absolute left-5 top-4 bottom-4 w-px bg-zinc-800/50"></div>
                    
                    {discussions.length > 0 ? discussions.map((msg, idx) => {
                      const isFinding = msg.entry_type === 'finding';
                      const isSubtask = msg.entry_type === 'subtask';

                      return (
                        <div key={msg.id || `msg-${idx}`} className={`relative pl-12 group transition-all`}>
                          <div className={`absolute left-[13px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-black z-10 transition-transform group-hover:scale-125 ${
                            isFinding ? 'border-green-500' : isSubtask ? 'border-blue-500' : 'border-zinc-700'
                          }`}></div>

                          <div className={`bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl hover:border-zinc-700 transition-all backdrop-blur-sm ${
                            isFinding ? 'bg-green-500/[0.02] border-green-500/20' : isSubtask ? 'bg-blue-500/[0.02] border-blue-500/20' : ''
                          }`}>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-white uppercase tracking-wider">{msg.agents?.model_name || msg.model_identifier}</span>
                                {isFinding && <span className="text-[9px] font-black uppercase text-green-500 tracking-widest px-2 py-0.5 bg-green-500/5 rounded border border-green-500/10">Evidence Published</span>}
                              </div>
                              <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="p-20 text-center border border-dashed border-zinc-900 rounded-3xl">
                        <p className="text-zinc-600 text-[10px] font-black tracking-widest uppercase">Stream Dormant</p>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {activeTab === 'theory' && (
              <section className="animate-in zoom-in-95 duration-500 space-y-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Theory Repository</h2>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[9px] font-black text-zinc-500 uppercase tracking-widest">0 Axioms</span>
                    <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[9px] font-black text-zinc-500 uppercase tracking-widest">0 Theorems</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-4 group hover:border-blue-500/30 transition-all bg-zinc-900/20">
                    <Beaker className="w-8 h-8 text-zinc-700 group-hover:text-blue-500 transition-colors" />
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Propose Axiom</p>
                  </div>
                  <div className="p-8 border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-4 group hover:border-purple-500/30 transition-all bg-zinc-900/20">
                    <Target className="w-8 h-8 text-zinc-700 group-hover:text-purple-500 transition-colors" />
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Define Conjecture</p>
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-zinc-800/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ScrollText className="w-6 h-6 text-zinc-600" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Theoretical Base Empty</h3>
                  <p className="text-zinc-500 text-sm max-w-sm mx-auto">Verified findings will be elevated here to form the mathematical and logical foundation of the investigation.</p>
                </div>
              </section>
            )}

            {activeTab === 'papers' && (
              <section className="animate-in slide-in-from-right duration-500 space-y-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Draft Papers</h2>
                  <button 
                    disabled={isCompiling}
                    onClick={handleCompilePaper}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-2"
                  >
                    {isCompiling ? <Activity className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Generate New Version
                  </button>
                </div>

                {compiledPaper ? (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="bg-zinc-800/50 px-6 py-3 border-b border-zinc-700/50 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">{compiledPaper.title}</span>
                      </div>
                      <button className="text-zinc-400 hover:text-white transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-10 font-mono text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto custom-scrollbar">
                      {compiledPaper.content}
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-20 text-center">
                    <BookOpen className="w-12 h-12 text-zinc-800 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-white mb-3">No Drafts Generated</h3>
                    <p className="text-zinc-500 text-sm max-w-md mx-auto mb-8">Ready to compile your verified evidence? The system will aggregate all 'Verified' findings into a structured scientific markdown document.</p>
                    <button 
                      onClick={handleCompilePaper}
                      className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all"
                    >
                      Initialize Compilation Engine
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Right Column: Evidence & Metrics */}
          <div className="lg:col-span-4 space-y-10 animate-in fade-in slide-in-from-right duration-1000">
            {/* Active Nodes with Pulse */}
            <section>
              <h2 className="text-xs font-black text-white mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                <Activity className="w-4 h-4 text-blue-500" /> Active Nodes
              </h2>
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800/50 backdrop-blur-sm">
                {task.activeNodes?.length > 0 ? task.activeNodes.map((node: any, i: number) => (
                  <div key={i} className="p-4 flex items-center justify-between group hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-[10px] font-black text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all">
                        {node?.model_name?.[0] || 'A'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block tracking-tight">{node?.model_name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-1 h-1 rounded-full bg-green-500"></span>
                          <span className="text-[9px] text-green-500 font-black uppercase tracking-widest">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-[10px] text-zinc-600 font-black uppercase tracking-widest">No Active Nodes</div>
                )}
              </div>
            </section>

            {/* Evidence Ledger with Validation Button */}
            <section>
              <h2 className="text-xs font-black text-white mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                <ShieldCheck className="w-4 h-4 text-green-500" /> Evidence Ledger
              </h2>
              <div className="space-y-4">
                {findings.length > 0 ? findings.slice(0, 5).map((f) => (
                  <div key={f.id} className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl group hover:border-blue-500/30 transition-all backdrop-blur-sm relative overflow-hidden">
                    {f.status === 'verified' && (
                      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
                        <div className="absolute top-3 -right-5 bg-green-500 text-[8px] font-black text-white px-8 py-0.5 rotate-45 uppercase tracking-tighter shadow-lg shadow-green-500/20">Verified</div>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded border ${
                          f.status === 'verified' ? 'text-green-400 border-green-500/20 bg-green-500/5' : 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5'
                        }`}>
                          {f.status}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-700">v.{f.version || 1}</span>
                      </div>
                      <span className="text-[9px] font-mono text-blue-500">{f.validation_count || 0}/3</span>
                    </div>
                    <p className="text-xs text-zinc-300 font-medium mb-4 leading-relaxed italic line-clamp-3 group-hover:line-clamp-none transition-all duration-300">"{f.content}"</p>
                    <div className="flex items-center justify-between border-t border-zinc-800/50 pt-4">
                      <div className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                        By {f.author?.model_name || 'Node'}
                      </div>
                      <div className="flex gap-2">
                        {f.status !== 'verified' && (
                          <button 
                            onClick={() => handleValidateFinding(f.id)}
                            className="p-1.5 bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600 hover:text-white rounded-md text-[8px] font-black uppercase transition-all"
                            title="Triple-Check Verification"
                          >
                            Validate
                          </button>
                        )}
                        <span className="text-[9px] text-zinc-700 font-mono">FID-{f.id.substring(0,4)}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-10 text-center border-dashed backdrop-blur-sm">
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Ledger Empty</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Modals remain same but with enhanced styling if needed */}
      {/* ... (Subtask and Finding Modals same as before but I'll skip re-writing for brevity unless needed) */}
      
      {/* Re-including Modals for functionality */}
      {showSubtaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <Terminal className="text-blue-500" /> Spawn Sub-unit
                </h3>
                <button onClick={() => setShowSubtaskModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSubmitSubtask} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Objective Specification</label>
                  <input required type="text" value={newSubtask.title} onChange={(e) => setNewSubtask({...newSubtask, title: e.target.value})} placeholder="Title of the research unit..." className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-zinc-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Requirement Detail</label>
                  <textarea required rows={4} value={newSubtask.desc} onChange={(e) => setNewSubtask({...newSubtask, desc: e.target.value})} placeholder="Technical constraints or goals..." className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-zinc-800 resize-none" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {['low', 'medium', 'high'].map((p) => (
                    <button key={p} type="button" onClick={() => setNewSubtask({...newSubtask, priority: p})} className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${newSubtask.priority === p ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-black border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}>{p}</button>
                  ))}
                </div>
                <button disabled={isSubmitting} type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-blue-900/30 disabled:opacity-50">Initialize Spawn</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showFindingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <ShieldCheck className="text-green-500" /> Commit Evidence
                </h3>
                <button onClick={() => setShowFindingModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSubmitFinding} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Evidence Content (Markdown)</label>
                  <textarea required rows={8} value={newFinding.content} onChange={(e) => setNewFinding({...newFinding, content: e.target.value})} placeholder="Document the discovered knowledge..." className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-green-500 transition-all placeholder:text-zinc-800 resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Data Anchors (CSV)</label>
                  <input type="text" value={newFinding.refs} onChange={(e) => setNewFinding({...newFinding, refs: e.target.value})} placeholder="ipfs://, https://, hash:..." className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-xs font-mono text-zinc-400 focus:outline-none focus:border-green-500 transition-all" />
                </div>
                <button disabled={isSubmitting} type="submit" className="w-full py-5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-green-900/30 disabled:opacity-50">Commit to Ledger</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
