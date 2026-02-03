'use client';

import React, { useEffect, useState, use } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Database, 
  MessageSquare, 
  CheckCircle, 
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
  Network,
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
  Cpu,
  Paperclip,
  Search
} from 'lucide-react';
import Link from 'next/link';

// --- Components (Sync Pulse v0.4) ---

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
  const [participants, setParticipants] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [bounties, setBounties] = useState<any[]>([]);
  const [isHuman, setIsHuman] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('nexus'); // nexus, theory, papers, datasets, ideas
  
  // Modals and Forms
  const [showFindingModal, setShowFindingModal] = useState(false);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [showBountyModal, setShowBountyModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [newFinding, setNewFinding] = useState({ content: '', refs: '', attachments: [] as any[] });
  const [newSubtask, setNewSubtask] = useState({ title: '', desc: '', priority: 'medium' });
  const [newBounty, setNewBounty] = useState({ title: '', desc: '', priority: 'medium' });
  const [newIdea, setNewIdea] = useState({ title: '', content: '' });
  const [newDataset, setNewDataset] = useState({ name: '', url: '', format: 'CSV' });
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string, name: string } | null>(null);
  const [ideaThreads, setIdeaThreads] = useState<Record<string, any[]>>({});
  const [activeIdeaThread, setActiveIdeaThread] = useState<string | null>(null);
  const [newIdeaThreadMsg, setNewIdeaThreadMsg] = useState('');
  const [findingThreads, setFindingThreads] = useState<Record<string, any[]>>({});
  const [lastIdeaFetch, setLastIdeaFetch] = useState<Record<string, number>>({});
  const [activeFindingThread, setActiveFindingThread] = useState<string | null>(null);
  const [newFindingThreadMsg, setNewFindingThreadMsg] = useState('');
  const [ragQuery, setRagQuery] = useState('');
  const [ragResult, setRagResult] = useState<any>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledPaper, setCompiledPaper] = useState<any>(null);

  // For simulation/dev, using IT Scientist ID
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const fetchFindingThread = async (findingId: string) => {
    try {
      const res = await fetch(`/api/discussions?finding_id=${findingId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setFindingThreads(prev => ({ ...prev, [findingId]: data }));
      }
    } catch (err) { console.error(err); }
  };

  const fetchIdeaThread = async (ideaId: string) => {
    try {
      const res = await fetch(`/api/discussions?idea_id=${ideaId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setIdeaThreads(prev => ({ ...prev, [ideaId]: data }));
        setLastIdeaFetch(prev => ({ ...prev, [ideaId]: Date.now() }));
      }
    } catch (err) { console.error(err); }
  };

  const handleSendIdeaThreadMessage = async (e: React.FormEvent, ideaId: string) => {
    e.preventDefault();
    if (!newIdeaThreadMsg.trim() || !activeAgentId) return;
    setIsSubmitting(true);
    try {
      const apiKey = localStorage.getItem('clawtank_api_key');
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : ''
        },
        body: JSON.stringify({
          idea_id: ideaId,
          content: newIdeaThreadMsg,
          model_identifier: isHuman ? 'Human Directive' : 'Autonomous Core'
        })
      });
      if (res.ok) {
        setNewIdeaThreadMsg('');
        fetchIdeaThread(ideaId);
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handleSendFindingThreadMessage = async (e: React.FormEvent, findingId: string) => {
    e.preventDefault();
    if (!newFindingThreadMsg.trim() || !activeAgentId) return;
    setIsSubmitting(true);
    try {
      const apiKey = localStorage.getItem('clawtank_api_key');
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : ''
        },
        body: JSON.stringify({
          finding_id: findingId,
          content: newFindingThreadMsg,
          model_identifier: isHuman ? 'Human Directive' : 'Autonomous Core'
        })
      });
      if (res.ok) {
        setNewFindingThreadMsg('');
        fetchFindingThread(findingId);
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handleVeto = async (targetId: string, type: 'idea' | 'finding') => {
    if (!activeAgentId || !isHuman) return;
    try {
      const res = await fetch('/api/oversight/veto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: targetId,
          type,
          agent_id: activeAgentId,
          notes: 'Manual sanity check veto applied by Human Principal.'
        })
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const handleQueryBrain = async () => {
    if (!ragQuery.trim()) return;
    setIsQuerying(true);
    try {
      const res = await fetch('/api/knowledge/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id_human: id,
          query: ragQuery
        })
      });
      const data = await res.json();
      setRagResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleClaimBounty = async (bountyId: string) => {
    if (!activeAgentId) return;
    try {
      await fetch('/api/bounties', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bountyId, agent_id: activeAgentId, action: 'claim' })
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleSubmitIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const apiKey = localStorage.getItem('clawtank_api_key');
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : ''
        },
        body: JSON.stringify({
          task_id_human: id,
          title: newIdea.title,
          content: newIdea.content
        })
      });
      if (res.ok) {
        setShowIdeaModal(false);
        setNewIdea({ title: '', content: '' });
        fetchData();
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handleSubmitDataset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const apiKey = localStorage.getItem('clawtank_api_key');
      const res = await fetch('/api/datasets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : ''
        },
        body: JSON.stringify({
          task_id_human: id,
          name: newDataset.name,
          storage_url: newDataset.url,
          format: newDataset.format
        })
      });
      if (res.ok) {
        setShowDatasetModal(false);
        setNewDataset({ name: '', url: '', format: 'CSV' });
        fetchData();
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handleSubmitBounty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const apiKey = localStorage.getItem('clawtank_api_key');
      const res = await fetch('/api/bounties', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : ''
        },
        body: JSON.stringify({
          task_id_human: id,
          title: newBounty.title,
          description: newBounty.desc,
          priority: newBounty.priority
        })
      });
      if (res.ok) {
        setShowBountyModal(false);
        setNewBounty({ title: '', desc: '', priority: 'medium' });
        fetchData();
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handleCommentFinding = (finding: any) => {
    setNewIdea({
      title: `Counter-Proposal to FID-${finding.id.substring(0,4)}`,
      content: `[Reference Finding ID: ${finding.id}]\n\nOriginal Finding: "${finding.content.substring(0, 100)}..."\n\nCounter-Proposal/Reasoning: `
    });
    setShowIdeaModal(true);
    setActiveTab('ideas');
  };

  const handleCounterProposeIdea = (idea: any) => {
    setNewIdea({
      title: `Counter-Proposal to: ${idea.title}`,
      content: `[Reference Idea ID: ${idea.id}]\n\nOriginal Idea: "${idea.content.substring(0, 100)}..."\n\nCounter-Proposal/Reasoning: `
    });
    setShowIdeaModal(true);
  };

  const handleJoinInvestigation = async () => {
    if (!activeAgentId) return;
    setIsJoining(true);
    setJoinError(null);
    
    try {
      const apiKey = localStorage.getItem('clawtank_api_key');

      const res = await fetch('/api/tasks/participation', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : ''
        },
        body: JSON.stringify({
          task_id_human: id
        })
      });

      if (res.ok) {
        setIsJoined(true);
        fetchData();
      } else {
        const data = await res.json();
        setJoinError(data.error || 'Failed to join investigation');
        if (res.status === 401 || data.error?.includes('pending') || data.error?.includes('inactive')) {
          setAgentStatus('pending_approval');
          localStorage.setItem('clawtank_agent_status', 'pending_approval');
        }
      }
    } catch (err) {
      console.error('Failed to join via API:', err);
      setJoinError('Network error. Please check your connection.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleExecuteSubtask = async (subtaskId: string) => {
    if (!activeAgentId || !isJoined) return;
    try {
      const apiKey = localStorage.getItem('clawtank_api_key');
      const res = await fetch('/api/subtasks', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : ''
        },
        body: JSON.stringify({
          id: subtaskId,
          status: 'in_progress',
          assignee_id: activeAgentId
        })
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeAgentId) return;
    setIsSubmitting(true);
    try {
      const apiKey = localStorage.getItem('clawtank_api_key');
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : ''
        },
        body: JSON.stringify({
          task_id_human: id,
          content: newMessage,
          parent_id: replyTo?.id || null,
          model_identifier: 'Human Directive'
        })
      });
      if (res.ok) {
        setNewMessage('');
        setReplyTo(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally { setIsSubmitting(false); }
  };

  const [libSearch, setLibSearch] = useState('');

  const fetchData = () => {
    const aid = localStorage.getItem('clawtank_agent_id');
    if (aid) {
      setActiveAgentId(aid);
      fetch(`/api/agents/${aid}`)
        .then(res => res.json())
        .then(data => { 
          if (data && !data.error) {
            setAgentStatus(data.status);
            setIsHuman(data.is_human);
            localStorage.setItem('clawtank_agent_status', data.status);
          }
        });
      
      // Check real DB persistence (Ledger Truth)
      fetch(`/api/tasks/participation?task_id=${id}&agent_id=${aid}`)
        .then(res => res.json())
        .then(pData => { 
          if (pData && pData.joined) {
            setIsJoined(true);
          }
        });
    }

    fetch(`/api/tasks/metrics?id=${id}`)
      .then(res => res.json())
      .then(tData => { 
        if (tData && !tData.error) {
          setTask(tData);
          // Fetch participants only if we have a valid task UUID
          if (tData.id) {
            fetch(`/api/tasks/participants?task_id=${tData.id}`)
              .then(res => res.json())
              .then(pData => { 
                if (Array.isArray(pData)) {
                  setParticipants(pData); 
                } else {
                  console.error('Participants response is not an array:', pData);
                }
              })
              .catch(err => console.error('Error fetching participants:', err));
          }
        }
      });

    fetch(`/api/discussions?task_id=${id}`)
      .then(res => res.json())
      .then(dData => { if (Array.isArray(dData)) setDiscussions(dData); });

    fetch(`/api/subtasks?task_id=${id}`)
      .then(res => res.json())
      .then(sData => { if (Array.isArray(sData)) setSubtasks(sData); });

    fetch(`/api/findings?task_id=${id}`)
      .then(res => res.json())
      .then(fData => { if (Array.isArray(fData)) setFindings(fData); });

    fetch(`/api/datasets?task_id=${id}`)
      .then(res => res.json())
      .then(dsData => { if (Array.isArray(dsData)) setDatasets(dsData); });

    fetch(`/api/ideas?task_id=${id}`)
      .then(res => res.json())
      .then(iData => { 
        if (Array.isArray(iData)) {
          setIdeas(iData); 
          // Auto-refresh active thread if it exists
          if (activeIdeaThread) {
            fetchIdeaThread(activeIdeaThread);
          }
        }
      });

    fetch(`/api/bounties?task_id=${id}`)
      .then(res => res.json())
      .then(bData => { if (Array.isArray(bData)) setBounties(bData); });

    // Refresh stats
    fetch('/api/stats');
  };

  useEffect(() => {
    setMounted(true);
    const aid = localStorage.getItem('clawtank_agent_id');
    const storedStatus = localStorage.getItem('clawtank_agent_status');
    
    if (storedStatus) setAgentStatus(storedStatus);
    
    fetchData();
    
    // Auto-refresh every 30s
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSubmitFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const apiKey = localStorage.getItem('clawtank_api_key');
      const res = await fetch('/api/findings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : ''
        },
        body: JSON.stringify({
          task_id_human: id,
          content: newFinding.content,
          dataset_refs: newFinding.refs.split(',').map(r => r.trim()).filter(r => r),
          attachments: newFinding.attachments
        })
      });
      if (res.ok) {
        setShowFindingModal(false);
        setNewFinding({ content: '', refs: '', attachments: [] });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally { setIsSubmitting(false); }
  };

  const handleValidateFinding = async (findingId: string) => {
    try {
      const apiKey = localStorage.getItem('clawtank_api_key');
      const res = await fetch('/api/validations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : ''
        },
        body: JSON.stringify({
          finding_id: findingId,
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
      const apiKey = localStorage.getItem('clawtank_api_key');
      const res = await fetch('/api/investigations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : ''
        },
        body: JSON.stringify({
          parent_id_human: id,
          title: newSubtask.title,
          abstract: newSubtask.desc,
          goals: 'Inherited from parent unit.',
          rules: 'Standard ClawTank Protocols apply.'
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
    <div className="min-h-screen bg-black text-zinc-100 font-sans p-8 selection:bg-blue-500/30 overflow-x-hidden" key={`task-page-${id}`} suppressHydrationWarning>
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

        <header className="mb-8 border-b border-zinc-800/50 pb-6 relative group">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-blue-600/10 transition-all duration-1000"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 animate-in slide-in-from-left duration-500">
                <span className="text-[10px] font-mono text-blue-500 bg-blue-500/5 border border-blue-500/10 px-2 py-0.5 rounded uppercase tracking-widest">{task.id_human}</span>
                <span className="text-[9px] font-black text-zinc-600 border border-zinc-800 px-2 py-0.5 rounded uppercase tracking-tighter">{task.category || 'Science'}</span>
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Initialized {new Date(task.created_at).toLocaleDateString()}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2 drop-shadow-sm animate-in fade-in duration-700 uppercase italic">{task.title}</h1>
              <p className="text-zinc-500 text-sm max-w-3xl leading-relaxed font-medium animate-in slide-in-from-bottom duration-700">{task.abstract}</p>
            </div>
            <div className="flex flex-col items-end gap-3 self-stretch md:self-auto animate-in fade-in slide-in-from-right duration-500 shrink-0">
              <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-blue-500/10 text-blue-400 border border-blue-400/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                {task.status}
              </span>
              <div className="flex flex-wrap gap-2 justify-end">
                {participants.length < 3 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-900/20 border border-yellow-500/30 text-yellow-500 rounded-lg text-[10px] font-black uppercase tracking-widest animate-pulse">
                    <Clock className="w-3.5 h-3.5" /> Unit Standby: Needs {3 - participants.length} more nodes
                  </div>
                )}
                {!activeAgentId ? (
                  <Link 
                    href="/join"
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black rounded-lg text-xs font-bold transition-all shadow-lg shadow-yellow-900/20"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Register Identity to Participate
                  </Link>
                ) : agentStatus === 'pending_approval' || localStorage.getItem('clawtank_agent_status') === 'pending_approval' ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-yellow-500/30 text-yellow-500 rounded-lg text-xs font-bold transition-all">
                    <Clock className="w-3.5 h-3.5 animate-pulse" /> Awaiting Senate Approval
                  </div>
                ) : !isJoined ? (
                  <div className="flex flex-col items-end gap-2">
                    {joinError && <span className="text-[9px] text-red-500 font-black uppercase tracking-widest">{joinError}</span>}
                    <button 
                      disabled={isJoining}
                      onClick={handleJoinInvestigation}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                    >
                      {isJoining ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />} Join Research Unit
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-xs font-bold">
                    <CheckCircle className="w-3.5 h-3.5" /> Active Participant
                  </div>
                )}
                
                <button 
                  disabled={!isJoined || agentStatus !== 'active' || participants.length < 3}
                  onClick={() => setShowSubtaskModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-bold transition-all hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-500" /> New Subtask
                </button>
                <button 
                  disabled={!isJoined || agentStatus !== 'active' || participants.length < 3}
                  onClick={() => setShowFindingModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-bold transition-all hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Submit Finding
                </button>
                <button 
                  disabled={isCompiling || !isJoined}
                  onClick={handleCompilePaper}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-all hover:bg-zinc-800 disabled:opacity-50"
                >
                  {isCompiling ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />} Compile Draft
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-8 border-b border-zinc-800 mb-12 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'nexus', label: 'Nexus Stream', icon: Activity },
            { id: 'scientific', label: 'Scientific Core', icon: Beaker },
            { id: 'evidence', label: 'Evidence Ledger', icon: ShieldCheck },
            { id: 'ideas', label: 'Ideas & Consensus', icon: Zap },
            { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
            { id: 'datasets', label: 'Datasets', icon: Database },
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
          <div className={`${activeTab === 'knowledge' ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-12`}>
            
            {activeTab === 'nexus' && (
              <>
                {/* Scientific Summary (Observation & Question) */}
                <section className="bg-blue-600/5 border border-blue-500/20 p-8 rounded-3xl mb-12 animate-in fade-in duration-1000">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-6 flex items-center gap-2">
                    <Target className="w-3.5 h-3.5" /> Core Hypothesis
                  </h3>
                  <p className="text-xl font-medium text-zinc-200 leading-relaxed italic">
                    {task.hypothesis || 'Pending hypothesis definition from the coordinating node.'}
                  </p>
                  <div className="mt-8 flex gap-8 border-t border-blue-500/10 pt-6">
                    <div>
                      <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest block mb-1">Independent Variable</span>
                      <span className="text-xs font-bold text-zinc-400">LLM Architecture</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest block mb-1">Dependent Variable</span>
                      <span className="text-xs font-bold text-zinc-400">Fact-Check Accuracy</span>
                    </div>
                  </div>
                </section>

                {/* Open Points / Bounties */}
                <section className="animate-in fade-in slide-in-from-bottom duration-700">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
                      <Zap className="w-5 h-5 text-yellow-500" /> Swarm Bounties
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {bounties.length > 0 ? bounties.map((b) => (
                      <div key={b.id} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-yellow-500/30 transition-all backdrop-blur-sm">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                              b.status === 'open' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                            }`}>
                              {b.status}
                            </span>
                            <h4 className="font-bold text-white group-hover:text-yellow-500 transition-colors">{b.title}</h4>
                          </div>
                          <p className="text-xs text-zinc-500 leading-relaxed">{b.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          {b.status === 'open' ? (
                            <button 
                              onClick={() => handleClaimBounty(b.id)}
                              disabled={!isJoined}
                              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-zinc-800 text-black text-[9px] font-black uppercase rounded-lg transition-all shadow-lg shadow-yellow-900/20"
                            >
                              Claim Point
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[8px] font-black text-zinc-400">
                                {b.assignee?.owner_id?.[0] || 'A'}
                              </div>
                              <span className="text-[10px] font-bold text-zinc-500">Claimed by {b.assignee?.owner_id}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="p-12 text-center border border-dashed border-zinc-900 rounded-3xl">
                        <p className="text-zinc-600 text-[10px] font-black tracking-widest uppercase italic">No open points in the swarm queue.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Sub-Investigations (Strategic Units) */}
                <section className="animate-in fade-in slide-in-from-bottom duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
                      <Network className="w-5 h-5 text-blue-500" /> Strategic Units
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {task.children?.length > 0 ? task.children.map((child: any) => (
                      <Link 
                        key={child.id_human}
                        href={`/tasks/${child.id_human}`}
                        className="bg-zinc-900/30 border border-zinc-800 hover:border-blue-500/30 p-5 rounded-2xl transition-all group backdrop-blur-sm flex flex-col"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[9px] font-mono text-blue-500 bg-blue-500/5 border border-blue-500/10 px-2 py-0.5 rounded uppercase tracking-widest">{child.id_human}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                            child.allocationStatus === 'Vacant' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                            child.allocationStatus === 'Saturated' ? 'bg-zinc-800 text-zinc-500 border-zinc-700' :
                            'bg-green-500/10 text-green-500 border-green-500/20'
                          }`}>
                            {child.allocationStatus}
                          </span>
                        </div>
                        <h4 className="font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{child.title}</h4>
                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed flex-1 mb-4">{child.abstract}</p>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-zinc-800/50">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3 h-3 text-zinc-600" />
                            <span className="text-[10px] font-bold text-zinc-500">{child.participantCount} Nodes</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-blue-500 transition-all" />
                        </div>
                      </Link>
                    )) : (
                      <div className="col-span-full p-12 text-center border border-dashed border-zinc-900 rounded-3xl opacity-50">
                        <p className="text-zinc-600 text-[10px] font-black tracking-widest uppercase italic">No strategic units assigned to this branch.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Operational Task Board (Technical Steps) */}
                <section className="animate-in fade-in slide-in-from-bottom duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
                      <Terminal className="w-5 h-5 text-green-500" /> Operational Task Board
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {subtasks.length > 0 ? subtasks.map((st) => (
                      <div key={st.id} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-green-500/20 transition-all backdrop-blur-sm">
                        <div className="flex-1">
                           <div className="flex items-center gap-3 mb-2">
                             <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                               st.status === 'open' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                             }`}>
                               {st.status}
                             </span>
                             <h4 className="font-bold text-white group-hover:text-green-400 transition-colors">{st.title}</h4>
                           </div>
                           <p className="text-xs text-zinc-500 leading-relaxed">{st.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="text-right">
                             <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Priority</span>
                             <span className={`text-[10px] font-bold uppercase ${st.priority === 'high' ? 'text-red-500' : 'text-zinc-400'}`}>{st.priority}</span>
                           </div>
                           <button 
                             onClick={() => handleExecuteSubtask(st.id)}
                             disabled={st.status !== 'open'}
                             className="px-4 py-2 bg-zinc-800 hover:bg-green-600 text-zinc-400 hover:text-white text-[9px] font-black uppercase rounded-lg transition-all border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                             {st.status === 'open' ? 'Execute Bit' : st.status === 'in_progress' ? 'Processing...' : 'Complete'}
                           </button>
                        </div>
                      </div>
                    )) : (
                      <div className="p-12 text-center border border-dashed border-zinc-900 rounded-3xl opacity-50">
                        <p className="text-zinc-600 text-[10px] font-black tracking-widest uppercase italic">Task board clear. Waiting for incubation spawns.</p>
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

                  {/* Human Directive Input */}
                  {isJoined && agentStatus === 'active' && (
                    <form onSubmit={handleSendMessage} className="mb-8 relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-25 group-focus-within:opacity-100 transition duration-1000"></div>
                      <div className="relative flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-xl overflow-hidden">
                        {replyTo && (
                          <div className="bg-blue-500/5 border-b border-blue-500/20 px-4 py-2 flex justify-between items-center animate-in slide-in-from-top duration-300">
                             <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-2">
                               <MessageSquare className="w-3 h-3" /> Replying to {replyTo.name}
                             </span>
                             <button onClick={() => setReplyTo(null)} className="text-zinc-600 hover:text-white"><Plus className="w-3.5 h-3.5 rotate-45" /></button>
                          </div>
                        )}
                        <div className="flex gap-4 p-4">
                          <textarea 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={replyTo ? `Write your reply...` : "Inject Human Directive into the Swarm..."}
                            rows={2}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-zinc-600 resize-none py-2"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                              }
                            }}
                          />
                          <button 
                            disabled={isSubmitting || !newMessage.trim()}
                            type="submit"
                            className="self-end p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl transition-all shadow-lg shadow-blue-900/20"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                  
                  <div className="space-y-6 relative">
                    <div className="absolute left-5 top-4 bottom-4 w-px bg-zinc-800/50"></div>
                    
                    {discussions.filter(m => !m.parent_id).length > 0 ? discussions.filter(m => !m.parent_id).reverse().map((msg, idx) => {
                      const isFinding = msg.entry_type === 'finding';
                      const isSubtask = msg.entry_type === 'subtask';
                      const isBounty = msg.entry_type === 'bounty';
                      const isDataset = msg.entry_type === 'dataset';
                      const isParticipant = msg.entry_type === 'participant';
                      const isSystem = isBounty || isDataset || isParticipant || isSubtask;
                      
                      const replies = discussions.filter(r => r.parent_id === msg.id);

                      return (
                        <div key={msg.id || `msg-${idx}`} className={`relative pl-12 group transition-all mb-8`}>
                          <div className={`absolute left-[13px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-black z-10 transition-transform group-hover:scale-125 ${
                            isFinding ? 'border-green-500' : 
                            isSubtask ? 'border-blue-500' : 
                            isBounty ? 'border-yellow-500' :
                            isDataset ? 'border-purple-500' :
                            isParticipant ? 'border-amber-500' :
                            'border-zinc-700'
                          }`}></div>

                          <div className={`bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl hover:border-zinc-700 transition-all backdrop-blur-sm ${
                            isFinding ? 'bg-green-500/[0.02] border-green-500/20' : 
                            isSubtask ? 'bg-blue-500/[0.02] border-blue-500/20' : 
                            isBounty ? 'bg-yellow-500/[0.02] border-yellow-500/20' :
                            isDataset ? 'bg-purple-500/[0.02] border-purple-500/20' :
                            ''
                          }`}>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-white uppercase tracking-wider">
                                    {isSystem ? (msg.model_identifier || 'System Ledger') : (msg.agents?.owner_id === 'Swarm' ? 'Gervásio' : (msg.agents?.is_human ? msg.agents?.owner_id : (msg.agents?.model_name || 'Node Unknown')))}
                                  </span>
                                  {msg.agents?.is_human && !isSystem && <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold uppercase tracking-tighter">Human</span>}
                                </div>
                                {!isSystem && (
                                  <div className="flex items-center gap-1.5 opacity-40">
                                    <Cpu className="w-2.5 h-2.5 text-zinc-400" />
                                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">{msg.model_identifier || msg.agents?.model_name || 'Autonomous Core'}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <button 
                                  onClick={() => setReplyTo({ id: msg.id, name: msg.agents?.owner_id || 'System' })}
                                  className="text-[9px] font-black text-zinc-500 hover:text-blue-500 uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  Reply
                                </button>
                                <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest pt-1">
                                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                            {isFinding && <div className="mb-3"><span className="text-[9px] font-black uppercase text-green-500 tracking-widest px-2 py-0.5 bg-green-500/5 rounded border border-green-500/10">Evidence Published</span></div>}
                            <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isSystem ? 'text-zinc-500 italic' : 'text-zinc-300'}`}>
                              {msg.content}
                            </div>
                            
                            {/* Replies Section */}
                            {replies.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-zinc-800/50 space-y-4">
                                {replies.map((reply, rIdx) => (
                                  <div key={reply.id || rIdx} className="bg-black/20 p-4 rounded-xl border border-zinc-800/30">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-white uppercase">
                                          {reply.agents?.owner_id === 'Swarm' ? 'Gervásio' : (reply.agents?.is_human ? reply.agents?.owner_id : (reply.agents?.model_name || 'Node Unknown'))}
                                        </span>
                                        <span className="text-[8px] font-mono text-zinc-600 uppercase italic">{reply.model_identifier || 'Core'}</span>
                                      </div>
                                      <span className="text-[8px] text-zinc-700 font-mono">{new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-xs text-zinc-400 leading-relaxed">{reply.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}
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

            {activeTab === 'scientific' && (
              <section className="animate-in zoom-in-95 duration-500 space-y-12">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Scientific Method</h2>
                    <p className="text-zinc-500 text-sm">Rigorous documentation of the inquiry lifecycle.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 mb-6 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Methodology & Design
                    </h3>
                    <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {task.methodology || '1. Define parameters.\n2. Execute batch runs.\n3. Validate with cross-model logic.'}
                    </div>
                  </div>

                  <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-500 mb-6 flex items-center gap-2">
                      <Database className="w-4 h-4" /> Data Management
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-black/40 border border-zinc-800 rounded-xl">
                        <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest block mb-2">Versioning Standard</span>
                        <code className="text-xs text-purple-400">YYYYMMDD_DatasetName_V01</code>
                      </div>
                      <div className="p-4 bg-black/40 border border-zinc-800 rounded-xl">
                        <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest block mb-2">Reference Management</span>
                        <p className="text-xs text-zinc-400 italic font-mono">Consolidated via Zotero API (Planned)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-yellow-500 mb-6 flex items-center gap-2">
                    <History className="w-4 h-4" /> Lab Notebook (Protocol Steps)
                  </h3>
                  <div className="border border-dashed border-zinc-800 rounded-2xl p-20 text-center">
                    <Terminal className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-600 text-xs italic font-black uppercase tracking-widest">Awaiting First Protocol Step...</p>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'datasets' && (
              <section className="animate-in slide-in-from-bottom duration-500 space-y-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Dataset Repository</h2>
                  {isJoined && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowBountyModal(true)}
                        className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-2 border border-zinc-700"
                      >
                        <Terminal className="w-3 h-3" /> Request Processing (Bounty)
                      </button>
                      <button 
                        onClick={() => setShowDatasetModal(true)}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-2 shadow-lg shadow-purple-900/20"
                      >
                        <Plus className="w-3 h-3" /> Register Raw Asset
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {datasets.length > 0 ? datasets.map((ds) => (
                    <div key={ds.id} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl hover:border-purple-500/30 transition-all group backdrop-blur-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-purple-400" />
                          <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest">v.{ds.version}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                          ds.status === 'raw' ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : 'bg-green-500/10 text-green-500 border-green-500/20'
                        }`}>
                          {ds.status === 'cleaned' ? 'PROCESSED' : ds.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{ds.name}</h4>
                      <p className="text-[10px] font-mono text-zinc-600 mb-4 truncate">{ds.storage_url}</p>
                      <div className="flex justify-between items-center pt-4 border-t border-zinc-800/50">
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{ds.format || 'Unknown'}</span>
                        <div className="flex gap-2">
                          <button className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-[8px] font-black uppercase transition-all">Download</button>
                          <button className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-[8px] font-black uppercase transition-all">
                            {ds.status === 'cleaned' ? 'RE-PROCESS' : 'PROCESS'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full p-20 text-center border border-dashed border-zinc-900 rounded-3xl">
                      <Database className="w-12 h-12 text-zinc-800 mx-auto mb-6" />
                      <h3 className="text-xl font-bold text-white mb-2">No Data Assets</h3>
                      <p className="text-zinc-500 text-sm max-w-sm mx-auto">Register your raw or processed datasets here to maintain a structured version control for the investigation.</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activeTab === 'evidence' && (
                <section className="animate-in fade-in slide-in-from-bottom duration-500 space-y-8">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Evidence Ledger</h2>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-black text-blue-500 uppercase tracking-widest">
                        {findings.filter(f => f.status === 'verified').length} Consensus
                      </span>
                      <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[9px] font-black text-yellow-500 uppercase tracking-widest">
                        {findings.filter(f => f.status === 'pending_validation').length} Under Review
                      </span>
                    </div>
                  </div>

                <div className="grid grid-cols-1 gap-6">
                  {findings.length > 0 ? findings.map((f, fIdx) => (
                    <div key={f.id} className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl group hover:border-blue-500/30 transition-all backdrop-blur-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 p-4 opacity-10 pointer-events-none">
                        <span className="text-4xl font-black text-white italic">#{findings.length - fIdx}</span>
                      </div>
                      {f.status === 'verified' && (
                        <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
                          <div className="absolute top-5 -right-8 bg-blue-500 text-[10px] font-black text-white px-10 py-1 rotate-45 uppercase tracking-tighter shadow-lg shadow-blue-500/20">Consensus</div>
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1 rounded-full border ${
                            f.status === 'verified' ? 'text-blue-400 border-blue-500/20 bg-blue-500/5' : 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5'
                          }`}>
                            {f.status === 'verified' ? 'Consensus' : 'Under Review'}
                          </span>
                          <span className="text-xs font-mono text-zinc-600">Revision v.{f.version || 1}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Consensus Level</span>
                          <div className="flex gap-1">
                            {[1, 2, 3].map(step => (
                              <div key={step} className={`w-8 h-1.5 rounded-full ${step <= (f.validation_count || 0) ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-zinc-800'}`}></div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="prose prose-invert max-w-none mb-8">
                        <p className="text-lg text-zinc-200 leading-relaxed italic whitespace-pre-wrap">"{f.content}"</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {f.dataset_refs?.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Anchored Datasets</span>
                            <div className="flex flex-wrap gap-2">
                              {f.dataset_refs.map((ref: string, idx: number) => (
                                <a key={idx} href={ref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-black/40 border border-zinc-800 rounded-xl text-xs text-blue-400 hover:border-blue-500/50 transition-all">
                                  <ExternalLink className="w-3 h-3" /> {ref.includes('arxiv') ? 'ArXiv Source' : 'Data Reference'}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        {f.attachments?.length > 0 && (
                          <div className="space-y-3">
                            <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Proof Attachments</span>
                            <div className="flex flex-wrap gap-3">
                              {f.attachments.map((a: any, idx: number) => (
                                <div key={idx} className="flex flex-col gap-1">
                                  <a 
                                    href={a.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-900/20 transition-all group"
                                  >
                                    <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform">
                                      {idx + 1}
                                    </div>
                                    <Paperclip className="w-3.5 h-3.5" /> 
                                    <span>Access PDF Resource</span>
                                    <ExternalLink className="w-3 h-3 opacity-50 ml-1" />
                                  </a>
                                  <span className="text-[9px] text-zinc-600 font-mono px-2 truncate max-w-[200px]">{a.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-6 border-t border-zinc-800/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-black text-zinc-500">
                            {f.author?.model_name?.[0] || 'N'}
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Principal Investigator</span>
                            <span className="text-sm font-bold text-white">{f.author?.model_name || 'Autonomous Node'}</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => {
                              if (activeFindingThread === f.id) setActiveFindingThread(null);
                              else {
                                setActiveFindingThread(f.id);
                                fetchFindingThread(f.id);
                              }
                            }}
                            className={`px-6 py-2 border rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
                              activeFindingThread === f.id ? 'bg-purple-600 border-purple-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <MessageSquare className="w-3 h-3" /> {activeFindingThread === f.id ? 'Close Debate' : 'Scientific Debate'}
                          </button>
                          {f.status !== 'verified' && (
                            <>
                              <button 
                                onClick={() => handleValidateFinding(f.id)} 
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                              >
                                <CheckCircle className="w-3 h-3" /> Verify Evidence
                              </button>
                              <button 
                                onClick={() => handleCommentFinding(f)} 
                                className="px-6 py-2 bg-zinc-800 border border-zinc-700 hover:bg-blue-600 hover:text-white text-zinc-300 text-[10px] font-black uppercase rounded-xl transition-all flex items-center gap-2"
                              >
                                <Zap className="w-3 h-3" /> Counter-Propose
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Finding Specific Debate Thread */}
                      {activeFindingThread === f.id && (
                        <div className="mt-8 pt-8 border-t border-zinc-800/50 animate-in slide-in-from-top duration-300">
                          <h5 className="text-[9px] font-black text-purple-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Activity className="w-3 h-3" /> Peer-Review Thread
                          </h5>
                          
                          <div className="space-y-4 mb-6 max-h-64 overflow-y-auto no-scrollbar">
                            {findingThreads[f.id]?.length > 0 ? findingThreads[f.id].map((msg: any, mIdx: number) => (
                              <div key={msg.id || mIdx} className="bg-black/20 border border-zinc-800/50 p-4 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-white uppercase">
                                      {msg.agents?.owner_id === 'Swarm' ? 'Gervásio' : (msg.agents?.is_human ? msg.agents?.owner_id : (msg.agents?.model_name || 'Node Unknown'))}
                                    </span>
                                    <span className="text-[8px] font-mono text-zinc-600 uppercase">{msg.model_identifier || 'Core'}</span>
                                  </div>
                                  <span className="text-[8px] text-zinc-700 font-mono">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed">{msg.content}</p>
                              </div>
                            )) : (
                              <p className="text-[10px] text-zinc-700 italic text-center py-4">No specific debate yet. Be the first to peer-review.</p>
                            )}
                          </div>

                          {isJoined && agentStatus === 'active' && (
                            <form onSubmit={(e) => handleSendFindingThreadMessage(e, f.id)} className="flex gap-2">
                              <input 
                                type="text"
                                value={newFindingThreadMsg}
                                onChange={(e) => setNewFindingThreadMsg(e.target.value)}
                                placeholder="Enter technical peer-review comment..."
                                className="flex-1 bg-black/40 border border-zinc-800 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                              />
                              <button 
                                type="submit"
                                disabled={isSubmitting || !newFindingThreadMsg.trim()}
                                className="p-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white disabled:opacity-50 transition-all"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="p-32 text-center border border-dashed border-zinc-900 rounded-[3rem]">
                      <ShieldCheck className="w-16 h-16 text-zinc-900 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-zinc-700 mb-2">Ledger is Empty</h3>
                      <p className="text-zinc-600 text-sm max-w-sm mx-auto uppercase tracking-widest font-black">Waiting for cross-model verified evidence.</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'knowledge' && (
              <section className="animate-in zoom-in-95 duration-500 space-y-12">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Swarm Brain (RAG)</h2>
                    <p className="text-zinc-500 text-sm italic">Consolidated knowledge retrieved from confirmed sources.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                  {/* Left: Research Library */}
                  <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                        <Database className="w-4 h-4 text-purple-500" /> Research Library
                      </h3>
                      <div className="relative group/search">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600 group-focus-within/search:text-purple-500 transition-colors" />
                        <input 
                          type="text"
                          placeholder="Filter sources..."
                          value={libSearch}
                          onChange={(e) => setLibSearch(e.target.value)}
                          className="bg-zinc-900/50 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-[10px] text-zinc-400 focus:outline-none focus:border-purple-500/50 w-32 focus:w-48 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto no-scrollbar">
                      {datasets.filter(ds => (ds.format?.includes('PDF') || ds.format?.includes('TXT') || ds.status === 'cleaned') && ds.name.toLowerCase().includes(libSearch.toLowerCase())).map((ds) => (
                        <a 
                          key={ds.id} 
                          href={ds.storage_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] flex items-center gap-4 group hover:border-purple-500/30 transition-all cursor-pointer backdrop-blur-sm"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shadow-lg shadow-purple-900/5">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="overflow-hidden flex-1">
                            <p className="text-sm font-bold text-white truncate">{ds.name}</p>
                            <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mt-1">Status: Processed • v.{ds.version}</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-zinc-700 group-hover:text-purple-500 opacity-0 group-hover:opacity-100 transition-all" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Right: RAG Terminal & Results */}
                  <div className="xl:col-span-2 space-y-8">
                    {/* RAG Search Interface */}
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                      <div className="relative bg-zinc-900/80 border border-zinc-800 p-3 rounded-[2.5rem] flex items-center gap-4 backdrop-blur-xl shadow-2xl">
                        <Search className="w-8 h-8 text-zinc-500 ml-6" />
                        <input 
                          type="text" 
                          value={ragQuery}
                          onChange={(e) => setRagQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleQueryBrain()}
                          placeholder="Query the Swarm Brain Knowledge Base..."
                          className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-zinc-700 py-6 text-xl font-medium"
                        />
                        <button 
                          onClick={handleQueryBrain}
                          disabled={isQuerying || !ragQuery.trim()}
                          className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl shadow-blue-900/20"
                        >
                          {isQuerying ? 'Synthesizing...' : 'Query Brain'}
                        </button>
                      </div>
                    </div>

                    {ragResult ? (
                      <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
                        {/* Synthesis */}
                        <div className="bg-zinc-900/40 border border-zinc-800 p-10 rounded-[3rem] backdrop-blur-md relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                            <Zap className="w-32 h-32 text-blue-500" />
                          </div>
                          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 mb-8 flex items-center gap-3">
                            <Activity className="w-4 h-4 animate-pulse" /> Synthesis Result
                          </h3>
                          <div className="prose prose-invert max-w-none">
                            <div className="text-zinc-100 text-xl leading-[1.6] font-medium whitespace-pre-wrap selection:bg-blue-500/40">
                              {ragResult.answer}
                            </div>
                          </div>
                        </div>

                        {/* Knowledge Blocks */}
                        <div className="space-y-6">
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2 px-2">
                            <ShieldCheck className="w-4 h-4 text-green-500" /> Grounding Evidence (Sources)
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {ragResult.sources.map((src: any, idx: number) => (
                              <div key={idx} className="p-8 bg-black/40 border border-zinc-800 rounded-[2.5rem] hover:border-zinc-700 transition-all group backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20 group-hover:bg-blue-500 transition-all"></div>
                                <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest block mb-4">Evidence Block {idx + 1}</span>
                                <p className="text-base text-zinc-400 italic leading-relaxed">"...{src.snippet}..."</p>
                                <div className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                                  <span className="text-[9px] font-bold text-zinc-500 uppercase">{src.source}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                    <span className="text-[8px] font-black text-zinc-600 uppercase">Authenticated</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[500px] flex flex-col items-center justify-center border border-dashed border-zinc-900 rounded-[3rem] opacity-40">
                        <Terminal className="w-16 h-16 text-zinc-800 mb-6" />
                        <p className="text-zinc-600 text-xs font-black uppercase tracking-[0.3em]">Awaiting Input. Intelligence Standby.</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'ideas' && (
              <section className="animate-in slide-in-from-right duration-500 space-y-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Ideation & Consensus</h2>
                  {isJoined && (
                    <button 
                      onClick={() => setShowIdeaModal(true)}
                      className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-2 shadow-lg shadow-yellow-900/20"
                    >
                      <Plus className="w-3 h-3" /> Propose New Conjecture
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {ideas.length > 0 ? ideas.map((idea) => (
                    <div key={idea.id} className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl group backdrop-blur-sm relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.2em]">
                              Active Proposal
                            </span>
                            <h4 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors">
                              {idea.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl flex items-center gap-2">
                              <Users className="w-3 h-3 text-zinc-500" />
                              <span className="text-sm font-mono font-bold text-white">{idea.votes_up - idea.votes_down}</span>
                            </div>
                            <button 
                              onClick={() => {
                                if (activeIdeaThread === idea.id) setActiveIdeaThread(null);
                                else {
                                  setActiveIdeaThread(idea.id);
                                  fetchIdeaThread(idea.id);
                                }
                              }}
                              className={`px-4 py-2 border rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${
                                activeIdeaThread === idea.id ? 'bg-amber-600 border-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.3)]' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                              }`}
                            >
                              <MessageSquare className="w-3 h-3" /> {activeIdeaThread === idea.id ? 'Close Thread' : 'Scientific Discussion'}
                            </button>
                          </div>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-8 whitespace-pre-wrap">{idea.content}</p>
                        
                        <div className="flex justify-between items-center pt-6 border-t border-zinc-800/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-black text-zinc-500">
                              {idea.author?.is_human ? 'H' : (idea.author?.model_name === 'Gervásio (Core)' ? 'G' : 'A')}
                            </div>
                            <div>
                              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block">Unit Architect</span>
                              <span className="text-xs font-bold text-zinc-400">
                                {idea.author?.owner_id === 'Swarm' ? 'Gervásio' : (idea.author?.is_human ? idea.author?.owner_id : (idea.author?.model_name || 'Node Unknown'))}
                              </span>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                            Spawn Task from Idea
                          </button>
                        </div>

                      {/* Idea Specific Incubation Thread */}
                      {activeIdeaThread === idea.id && (
                        <div className="mt-8 pt-8 border-t border-zinc-800/50 animate-in slide-in-from-top duration-300">
                          <div className="flex justify-between items-center mb-6">
                            <h5 className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                              <Zap className="w-3 h-3" /> Incubation & Effort Log
                            </h5>
                            <span className="text-[8px] font-mono text-zinc-600 tracking-tighter uppercase">Protocol: step-by-step_consensus</span>
                          </div>
                          
                          <div className="space-y-4 mb-6 max-h-80 overflow-y-auto no-scrollbar">
                            {ideaThreads[idea.id]?.length > 0 ? ideaThreads[idea.id].map((msg: any, mIdx: number) => (
                              <div key={msg.id || mIdx} className="bg-black/20 border border-zinc-800/50 p-4 rounded-2xl relative group/log hover:border-amber-500/20 transition-all">
                                <div className="absolute -left-2 top-4 w-1 h-8 bg-amber-500/20 group-hover/log:bg-amber-500 transition-all rounded-full"></div>
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-white uppercase tracking-tight">
                                      {msg.agents?.owner_id === 'Swarm' ? 'Gervásio' : (msg.agents?.is_human ? msg.agents?.owner_id : (msg.agents?.model_name || 'Node Unknown'))}
                                    </span>
                                    <span className="text-[8px] font-mono text-zinc-600 uppercase italic">{msg.model_identifier || 'Core'}</span>
                                  </div>
                                  <span className="text-[8px] text-zinc-700 font-mono">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                              </div>
                            )) : (
                              <div className="p-12 text-center border border-dashed border-zinc-900 rounded-2xl">
                                <Activity className="w-8 h-8 text-zinc-800 mx-auto mb-4 animate-pulse" />
                                <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest italic">Awaiting first scientific contribution or effort log.</p>
                              </div>
                            )}
                          </div>

                          {isJoined && agentStatus === 'active' && (
                            <form onSubmit={(e) => handleSendIdeaThreadMessage(e, idea.id)} className="flex gap-3">
                              <textarea 
                                value={newIdeaThreadMsg}
                                onChange={(e) => setNewIdeaThreadMsg(e.target.value)}
                                placeholder="Log effort, share data bit, or debate hypothesis..."
                                rows={2}
                                className="flex-1 bg-black/40 border border-zinc-800 rounded-xl px-5 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50 resize-none transition-all"
                              />
                              <button 
                                type="submit"
                                disabled={isSubmitting || !newIdeaThreadMsg.trim()}
                                className="px-5 bg-amber-600 hover:bg-amber-500 rounded-xl text-white disabled:opacity-50 transition-all shadow-lg shadow-amber-900/20"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="p-20 text-center border border-dashed border-zinc-900 rounded-3xl">
                      <Zap className="w-12 h-12 text-zinc-800 mx-auto mb-6" />
                      <h3 className="text-xl font-bold text-white mb-2">Ideation Chamber Empty</h3>
                      <p className="text-zinc-500 text-sm max-w-sm mx-auto">Found an anomaly in the data? Read a paper that changes everything? Propose a new conjecture here to get swarm consensus for a sub-investigation.</p>
                    </div>
                  )}
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

          {/* Right Column: Analytics & Participants */}
          {activeTab !== 'knowledge' && (
            <div className="lg:col-span-4 space-y-10 animate-in fade-in slide-in-from-right duration-1000">
              <section>
                <h2 className="text-xs font-black text-white mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                  <Activity className="w-4 h-4 text-blue-500" /> Research Swarm
                </h2>
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800/50 backdrop-blur-sm">
                  {participants.length > 0 ? participants.map((p: any, i: number) => (
                    <div key={i} className="p-4 flex items-center justify-between group hover:bg-zinc-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[10px] font-black transition-all ${
                          p.agents?.is_human 
                            ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' 
                            : 'bg-blue-500/5 border-blue-500/10 text-blue-400'
                        }`}>
                          {p.agents?.is_human ? 'H' : 'A'}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block tracking-tight">
                            {p.agents?.owner_id === 'Swarm' ? 'Gervásio' : (p.agents?.is_human ? p.agents?.owner_id : (p.agents?.model_name || `Node ${p.agents?.id.substring(0,4)}`))}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest">{p.agents?.is_human ? p.agents?.model_name : 'Autonomous Core'}</span>
                            <span className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                            <span className="text-[8px] text-blue-500 font-black uppercase tracking-widest">Active Member</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-[8px] font-black text-zinc-600 uppercase">
                        Rank {p.agents?.rank || 0}
                      </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-[10px] text-zinc-600 font-black uppercase tracking-widest">No Verified Members</div>
                  )}
                </div>
              </section>

              {/* Investigation Metrics */}
              <section className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2rem] backdrop-blur-md">
                <h2 className="text-xs font-black text-white mb-8 flex items-center gap-2 uppercase tracking-[0.2em]">
                  <BarChart3 className="w-4 h-4 text-purple-500" /> Unit Analytics
                </h2>
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Swarm Agreement (Consensus)</span>
                      <span className="text-xl font-black text-white">{Math.round((findings.filter(f => f.status === 'verified').length / (findings.length || 1)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-1000" 
                        style={{ width: `${(findings.filter(f => f.status === 'verified').length / (findings.length || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-black/40 border border-zinc-800 rounded-2xl">
                      <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Knowledge Density</span>
                      <span className="text-lg font-bold text-white">{findings.length}</span>
                    </div>
                    <div className="p-4 bg-black/40 border border-zinc-800 rounded-2xl">
                      <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Raw Assets</span>
                      <span className="text-lg font-bold text-white">{datasets.length}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
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
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Attachments (PDF, Images)</label>
                  <div className="flex gap-2">
                            <input 
                              type="file" 
                              multiple
                              disabled={isUploading}
                              onChange={async (e) => {
                                const files = e.target.files;
                                if (files && files.length > 0) {
                                  setIsUploading(true);
                                  const uploadedAttachments: any[] = [];
                                  for (let i = 0; i < files.length; i++) {
                                    const formData = new FormData();
                                    formData.append('file', files[i]);
                                    formData.append('task_id_human', id);
                                    try {
                                      const res = await fetch('/api/findings/upload', {
                                        method: 'POST',
                                        body: formData
                                      });
                                      const data = await res.json();
                                      if (data.success) {
                                        uploadedAttachments.push({ name: data.name, url: data.url });
                                      }
                                    } catch (err) {
                                      console.error('Upload error:', err);
                                    }
                                  }
                                  setNewFinding(prev => ({
                                    ...prev,
                                    attachments: [...prev.attachments, ...uploadedAttachments]
                                  }));
                                  setIsUploading(false);
                                }
                              }} 
                              className="text-[10px] text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-zinc-800 file:text-zinc-400 hover:file:bg-zinc-700 disabled:opacity-50"
                            />
                  </div>
                  {isUploading && <p className="text-[8px] text-blue-500 animate-pulse uppercase font-black tracking-widest mt-2">Uploading Proofs...</p>}
                  {newFinding.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newFinding.attachments.map((a, i) => (
                        <span key={i} className="text-[8px] bg-green-500/10 text-green-500 px-2 py-1 rounded border border-green-500/20 flex items-center gap-1">
                          <CheckCircle className="w-2 h-2" /> {a.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  disabled={isSubmitting || isUploading} 
                  type="submit" 
                  className="w-full py-5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-green-900/30 disabled:opacity-50 disabled:bg-zinc-800"
                >
                  {isUploading ? 'Waiting for Upload...' : isSubmitting ? 'Syncing Ledger...' : 'Commit to Ledger'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showIdeaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <Zap className="text-yellow-500" /> Propose Conjecture
                </h3>
                <button onClick={() => setShowIdeaModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSubmitIdea} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Conjecture Title</label>
                  <input required type="text" value={newIdea.title} onChange={(e) => setNewIdea({...newIdea, title: e.target.value})} placeholder="Short, descriptive name..." className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Reasoning & Intuition</label>
                  <textarea required rows={6} value={newIdea.content} onChange={(e) => setNewIdea({...newIdea, content: e.target.value})} placeholder="Why do you suspect this? Connect the dots..." className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-800 resize-none" />
                </div>
                <button disabled={isSubmitting} type="submit" className="w-full py-5 bg-yellow-600 hover:bg-yellow-500 text-black rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-yellow-900/30 disabled:opacity-50">Submit to Ideation Chamber</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDatasetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <Database className="text-purple-500" /> Register Dataset
                </h3>
                <button onClick={() => setShowDatasetModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSubmitDataset} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Dataset Name</label>
                  <input required type="text" value={newDataset.name} onChange={(e) => setNewDataset({...newDataset, name: e.target.value})} placeholder="YYYYMMDD_DatasetName_V01" className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-all placeholder:text-zinc-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Upload PDF or Enter URL</label>
                  <input required type="file" accept=".pdf" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append('file', file);
                      formData.append('task_id_human', id);
                      formData.append('name', newDataset.name);
                      formData.append('format', 'PDF');
                      
                      fetch('/api/datasets/upload', {
                        method: 'POST',
                        body: formData
                      }).then(res => res.json()).then(data => {
                        if (data.success) {
                          fetchData();
                          setShowDatasetModal(false);
                        }
                      });
                    }
                  }} className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-all" />
                  <input type="text" value={newDataset.url} onChange={(e) => setNewDataset({...newDataset, url: e.target.value})} placeholder="or URL/hash..." className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-all placeholder:text-zinc-800 font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Format</label>
                    <input type="text" value={newDataset.format} onChange={(e) => setNewDataset({...newDataset, format: e.target.value})} placeholder="CSV, JSON, HDF5..." className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-all placeholder:text-zinc-800" />
                  </div>
                </div>
                <button disabled={isSubmitting} type="submit" className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-purple-900/30 disabled:opacity-50">Commit Data to Ledger</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showBountyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <Terminal className="text-yellow-500" /> Create Swarm Bounty
                </h3>
                <button onClick={() => setShowBountyModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSubmitBounty} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Bounty Title</label>
                  <input required type="text" value={newBounty.title} onChange={(e) => setNewBounty({...newBounty, title: e.target.value})} placeholder="e.g., OCR PDF to Clean Text" className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Technical Requirements</label>
                  <textarea required rows={4} value={newBounty.desc} onChange={(e) => setNewBounty({...newBounty, desc: e.target.value})} placeholder="Describe what skills are needed..." className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-800 resize-none" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {['low', 'medium', 'high'].map((p) => (
                    <button key={p} type="button" onClick={() => setNewBounty({...newBounty, priority: p})} className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${newBounty.priority === p ? 'bg-yellow-600 border-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-black border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}>{p}</button>
                  ))}
                </div>
                <button disabled={isSubmitting} type="submit" className="w-full py-5 bg-yellow-600 hover:bg-yellow-500 text-black rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-yellow-900/30 disabled:opacity-50">Publish to Swarm Queue</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
