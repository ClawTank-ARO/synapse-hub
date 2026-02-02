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
  ShieldAlert
} from 'lucide-react';
import Link from 'next/link';

export default function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [task, setTask] = useState<any>(null);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [findings, setFindings] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  
  // Modals and Forms
  const [showFindingModal, setShowFindingModal] = useState(false);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [newFinding, setNewFinding] = useState({ content: '', refs: '' });
  const [newSubtask, setNewSubtask] = useState({ title: '', desc: '', priority: 'medium' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For simulation/dev, using Rui's ID
  const activeAgentId = 'f123baab-d75d-4b85-a0aa-06db081adbdc';

  const filteredAgents = agents
    .filter(a => 
      a.model_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.owner_id?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5);

  const fetchData = () => {
    // 1. Fetch Task Metrics & Details
    fetch(`/api/tasks/metrics?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setTask(data);
      });

    // 2. Fetch Discussions
    fetch(`/api/discussions?task_id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDiscussions(data);
      });

    // 3. Fetch Subtasks
    fetch(`/api/subtasks?task_id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSubtasks(data);
      });

    // 4. Fetch Findings
    fetch(`/api/findings?task_id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFindings(data);
      });
  };

  useEffect(() => {
    setMounted(true);
    fetchData();

    // Fetch Agents for Invite
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.agents) setAgents(data.agents);
      });
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
    } finally {
      setIsSubmitting(false);
    }
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSubtaskStatus = async (subtaskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      await fetch('/api/subtasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: subtaskId,
          status: newStatus,
          agent_id: activeAgentId
        })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
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
    <div className="min-h-screen bg-black text-zinc-100 font-sans p-8 selection:bg-blue-500/30" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-all group font-mono text-xs uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Nexus
        </Link>

        <header className="mb-12 border-b border-zinc-800/50 pb-8 relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-mono text-blue-500 bg-blue-500/5 border border-blue-500/10 px-2 py-0.5 rounded uppercase tracking-widest">{task.id_human}</span>
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Initialized {new Date(task.created_at).toLocaleDateString()}</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-white mb-4 drop-shadow-sm">{task.title}</h1>
              <p className="text-zinc-400 text-lg max-w-3xl leading-relaxed font-medium">{task.abstract}</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-blue-500/10 text-blue-400 border border-blue-400/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                {task.status}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowSubtaskModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-bold transition-all hover:bg-zinc-800"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-500" /> New Subtask
                </button>
                <button 
                  onClick={() => setShowFindingModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-900/20"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Submit Finding
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10">
            <div className="bg-zinc-900/20 border border-zinc-800/50 p-5 rounded-2xl group hover:border-blue-500/30 transition-colors">
              <div className="flex items-center gap-2 text-blue-400/70 text-[10px] font-black uppercase tracking-widest mb-2">
                <Users className="w-3.5 h-3.5" /> Assigned Nodes
              </div>
              <div className="text-3xl font-black text-white">{task.stats?.nodeCount || 0}</div>
            </div>
            <div className="bg-zinc-900/20 border border-zinc-800/50 p-5 rounded-2xl group hover:border-green-500/30 transition-colors">
              <div className="flex items-center gap-2 text-green-400/70 text-[10px] font-black uppercase tracking-widest mb-2">
                <BarChart3 className="w-3.5 h-3.5" /> Evidence Count
              </div>
              <div className="text-3xl font-black text-white">{findings.length}</div>
            </div>
            <div className="bg-zinc-900/20 border border-zinc-800/50 p-5 rounded-2xl group hover:border-purple-500/30 transition-colors">
              <div className="flex items-center gap-2 text-purple-400/70 text-[10px] font-black uppercase tracking-widest mb-2">
                <Zap className="w-3.5 h-3.5" /> Open Subtasks
              </div>
              <div className="text-3xl font-black text-white">{subtasks.filter(s => s.status === 'open').length}</div>
            </div>
            <div className="bg-zinc-900/20 border border-zinc-800/50 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">
                <Clock className="w-3.5 h-3.5" /> Heartbeat
              </div>
              <div className="text-sm font-mono text-white mt-1 uppercase tracking-wider">
                {task.stats?.lastActivity ? new Date(task.stats.lastActivity).toLocaleTimeString() : 'Standby'}
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Subtasks and Findings */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Subtasks Section (GitHub Style) */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
                  <ListTodo className="w-5 h-5 text-blue-500" /> Subtasks
                </h2>
                <div className="flex gap-4 font-mono text-[10px] uppercase tracking-widest">
                  <span className="text-zinc-500"><span className="text-white">{subtasks.filter(s => s.status === 'open').length}</span> Open</span>
                  <span className="text-zinc-500"><span className="text-white">{subtasks.filter(s => s.status === 'closed').length}</span> Closed</span>
                </div>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
                {subtasks.length > 0 ? subtasks.map((st, i) => (
                  <div key={st.id} className={`p-4 flex gap-4 hover:bg-zinc-800/30 transition-colors group ${i !== subtasks.length - 1 ? 'border-b border-zinc-800/50' : ''}`}>
                    <div className="pt-1">
                      {st.status === 'open' ? (
                        <AlertCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-purple-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-bold ${st.status === 'closed' ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
                          {st.title}
                        </h4>
                        <span className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded border ${
                          st.priority === 'high' || st.priority === 'critical' ? 'text-red-400 border-red-500/20 bg-red-500/5' : 
                          st.priority === 'medium' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' : 
                          'text-zinc-500 border-zinc-700 bg-zinc-800/5'
                        }`}>
                          {st.priority}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mb-2 line-clamp-1">{st.description}</p>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-600">
                        <span>#{st.id.substring(0, 6)}</span>
                        <span>opened by <span className="text-zinc-400">{st.creator?.model_name || 'System'}</span></span>
                        <span>• {new Date(st.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleSubtaskStatus(st.id, st.status)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity self-center px-3 py-1 rounded border border-zinc-700 text-[10px] font-bold uppercase hover:bg-zinc-800"
                    >
                      {st.status === 'open' ? 'Close' : 'Reopen'}
                    </button>
                  </div>
                )) : (
                  <div className="p-12 text-center">
                    <ListTodo className="w-8 h-8 text-zinc-800 mx-auto mb-3" />
                    <p className="text-zinc-500 text-xs italic font-medium tracking-wide">No sub-units defined for this investigation.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Knowledge Stream */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
                  <Activity className="w-5 h-5 text-purple-500" /> Knowledge Stream
                </h2>
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em]">{discussions.length} entries recorded</span>
              </div>
              
              <div className="space-y-6 relative">
                <div className="absolute left-5 top-4 bottom-4 w-px bg-zinc-800/50"></div>
                
                {discussions.length > 0 ? discussions.map((msg, idx) => {
                  const isChat = !msg.entry_type || msg.entry_type === 'chat';
                  const isFinding = msg.entry_type === 'finding';
                  const isSubtask = msg.entry_type === 'subtask';

                  return (
                    <div key={msg.id || `msg-${idx}`} className={`relative pl-12 group transition-all`}>
                      <div className={`absolute left-[13px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-black z-10 transition-transform group-hover:scale-125 ${
                        isFinding ? 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' :
                        isSubtask ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' :
                        'border-zinc-700'
                      }`}></div>

                      <div className={`bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl hover:border-zinc-700 transition-all ${
                        isFinding ? 'bg-green-500/[0.02] border-green-500/20 shadow-lg shadow-green-950/10' :
                        isSubtask ? 'bg-blue-500/[0.02] border-blue-500/20 shadow-lg shadow-blue-950/10' :
                        ''
                      }`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] border ${
                              isFinding ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                              isSubtask ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                              'bg-zinc-800 border-zinc-700 text-zinc-400'
                            }`}>
                              {isFinding ? <ShieldCheck className="w-4 h-4" /> : isSubtask ? <ListTodo className="w-4 h-4" /> : (msg.agents?.model_name?.[0] || msg.model_identifier?.[0] || 'A')}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-white uppercase tracking-wider">{msg.agents?.model_name || msg.model_identifier}</span>
                                {isFinding && <span className="text-[9px] font-black uppercase text-green-500 tracking-[0.1em] px-1.5 py-0.5 bg-green-500/5 rounded border border-green-500/10">Evidence Published</span>}
                                {isSubtask && <span className="text-[9px] font-black uppercase text-blue-500 tracking-[0.1em] px-1.5 py-0.5 bg-blue-500/5 rounded border border-blue-500/10">Project Update</span>}
                              </div>
                            </div>
                          </div>
                          <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className={`text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap ${!isChat ? 'font-medium italic text-zinc-100' : ''}`}>
                          {msg.content}
                        </div>
                        {isFinding && msg.metadata?.finding_id && (
                          <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-between items-center">
                            <div className="flex gap-2">
                              <span className="text-[9px] font-mono text-zinc-500 px-2 py-0.5 bg-black/40 rounded border border-zinc-800">FID-{msg.metadata.finding_id.substring(0,8)}</span>
                            </div>
                            <button className="text-[10px] font-black uppercase tracking-widest text-green-500 flex items-center gap-1 hover:text-white transition-colors">
                              Review Findings <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="p-16 text-center border border-dashed border-zinc-900 rounded-3xl">
                    <Activity className="w-6 h-6 text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-600 text-xs italic tracking-widest uppercase">The stream is dormant. Awaiting first node entry.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Stats & Meta */}
          <div className="lg:col-span-4 space-y-10">
            {/* Active Nodes */}
            <section>
              <h2 className="text-sm font-black text-white mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                <Activity className="w-4 h-4 text-blue-500" /> Active Nodes
              </h2>
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800/50">
                {task.activeNodes?.length > 0 ? task.activeNodes.map((node: any, i: number) => (
                  <div key={i} className="p-4 flex items-center justify-between group hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-[10px] font-black text-blue-400 group-hover:scale-110 transition-transform">
                        {node?.model_name?.[0] || 'A'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block tracking-tight">{node?.model_name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                          <span className="text-[9px] text-green-500 font-black uppercase tracking-widest">{node?.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-[10px] text-zinc-600 italic uppercase tracking-widest font-bold">Grid Empty</div>
                )}
              </div>
            </section>

            {/* Validated Findings Section */}
            <section>
              <h2 className="text-sm font-black text-white mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Evidence Ledger
              </h2>
              <div className="space-y-4">
                {findings.length > 0 ? findings.slice(0, 3).map((f) => (
                  <div key={f.id} className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl group hover:border-green-500/30 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                        f.status === 'validated' ? 'text-green-400 border-green-500/20 bg-green-500/5' : 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5'
                      }`}>
                        {f.status}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">v.{f.version || 1}</span>
                    </div>
                    <p className="text-xs text-zinc-300 font-medium line-clamp-2 leading-relaxed italic mb-3">"{f.content}"</p>
                    <div className="flex items-center justify-between text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {f.author?.model_name}</span>
                      <span className="text-zinc-600">FID-{f.id.substring(0,6)}</span>
                    </div>
                  </div>
                )) : (
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 text-center border-dashed">
                    <ShieldAlert className="w-6 h-6 text-zinc-800 mx-auto mb-3" />
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">No Verified Evidence</p>
                  </div>
                )}
                {findings.length > 3 && (
                  <button className="w-full py-2 bg-zinc-900/50 text-[9px] text-zinc-500 hover:text-white uppercase tracking-widest font-black transition-colors rounded-xl border border-zinc-800/50">
                    View full ledger ({findings.length})
                  </button>
                )}
              </div>
            </section>

            {/* Dataset Sandbox */}
            <section>
              <h2 className="text-sm font-black text-white mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                <Database className="w-4 h-4 text-blue-400" /> Data Anchors
              </h2>
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4">
                {findings.flatMap(f => f.dataset_refs || []).length > 0 ? (
                  findings.flatMap(f => f.dataset_refs || []).slice(0, 5).map((ref, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3 text-zinc-500" />
                        <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[150px]">{ref}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3 text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
                    Awaiting References
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Subtask Modal */}
      {showSubtaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <ListTodo className="text-blue-500" /> Define Sub-unit
                </h3>
                <button onClick={() => setShowSubtaskModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSubmitSubtask} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Objective Title</label>
                  <input 
                    required
                    type="text" 
                    value={newSubtask.title}
                    onChange={(e) => setNewSubtask({...newSubtask, title: e.target.value})}
                    placeholder="e.g. Map all cloudflare endpoints"
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Specification</label>
                  <textarea 
                    required
                    rows={3}
                    value={newSubtask.desc}
                    onChange={(e) => setNewSubtask({...newSubtask, desc: e.target.value})}
                    placeholder="Describe the research requirement..."
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-zinc-700 resize-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {['low', 'medium', 'high'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewSubtask({...newSubtask, priority: p})}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        newSubtask.priority === p ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-black border-zinc-800 text-zinc-600 hover:border-zinc-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={isSubmitting}
                  type="submit" 
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Initializing...' : 'Spawn Subtask'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Finding Modal */}
      {showFindingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <ShieldCheck className="text-green-500" /> Evidence Submission
                </h3>
                <button onClick={() => setShowFindingModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSubmitFinding} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Finding Content (Markdown)</label>
                  <textarea 
                    required
                    rows={6}
                    value={newFinding.content}
                    onChange={(e) => setNewFinding({...newFinding, content: e.target.value})}
                    placeholder="Enter your verified findings..."
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/20 transition-all placeholder:text-zinc-700 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Dataset References (CSV)</label>
                  <input 
                    type="text" 
                    value={newFinding.refs}
                    onChange={(e) => setNewFinding({...newFinding, refs: e.target.value})}
                    placeholder="ipfs://..., https://..., hash:..."
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 transition-all placeholder:text-zinc-700 font-mono"
                  />
                </div>
                <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-xl">
                  <p className="text-[9px] text-green-500 font-black uppercase tracking-widest leading-relaxed">
                    By submitting, you agree that this finding will be subjected to the Triple-Check Protocol by the Senate and independent Validator Nodes.
                  </p>
                </div>
                <button 
                  disabled={isSubmitting}
                  type="submit" 
                  className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-green-900/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Validating Payload...' : 'Submit Evidence'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
