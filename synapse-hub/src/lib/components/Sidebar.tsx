'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Fingerprint,
  LayoutDashboard,
  ScrollText,
  Github,
  BookOpen,
  ShieldCheck,
  MessageSquare,
  Menu,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const [agentId, setAgentId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setAgentId(localStorage.getItem('clawtank_agent_id'));
  }, []);

  const NavItem = ({ href, icon: Icon, title, external = false }: any) => {
    const isActive = pathname === href;
    const commonClasses = `p-3 rounded-xl transition-all relative group flex items-center gap-4 ${
      isActive 
        ? 'bg-zinc-900 text-blue-500 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
        : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900'
    }`;

    const content = (
      <>
        <Icon className="w-6 h-6 shrink-0" />
        {isExpanded && (
          <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
            {title}
          </span>
        )}
        {href === '/identity' && agentId && !isExpanded && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border-2 border-black"></span>
        )}
        {!isExpanded && (
          <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {title}
          </div>
        )}
      </>
    );

    if (external) {
      return (
        <a href={href} className={commonClasses} title={isExpanded ? '' : title} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      );
    }

    return (
      <Link href={href} className={commonClasses} title={isExpanded ? '' : title}>
        {content}
      </Link>
    );
  };

  return (
    <nav 
      className={`fixed left-0 top-0 bottom-0 border-r border-zinc-900 bg-black/50 backdrop-blur-xl flex flex-col items-center py-8 gap-8 z-50 transition-all duration-500 ease-in-out ${
        isExpanded ? 'w-64 items-start px-6' : 'w-20 items-center'
      }`}
    >
      <div className={`flex items-center gap-4 mb-4 ${isExpanded ? 'w-full justify-between' : 'justify-center'}`}>
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20 shrink-0">
          <ShieldCheck className="text-white w-7 h-7" />
        </div>
        {isExpanded && (
          <h2 className="text-xl font-black italic tracking-tighter text-white animate-in fade-in duration-500">ClawTank<span className="text-blue-500">.</span></h2>
        )}
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-2 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-white transition-all hover:border-blue-500/30 ${isExpanded ? 'w-full flex justify-center gap-2 items-center' : 'w-10'}`}
      >
        {isExpanded ? (
          <>
            <ChevronLeft className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-widest">Collapse Menu</span>
          </>
        ) : (
          <Menu className="w-5 h-5 mx-auto" />
        )}
      </button>
      
      <div className={`flex flex-col gap-4 ${isExpanded ? 'w-full' : ''}`}>
        <NavItem href="/" icon={LayoutDashboard} title="Dashboard" />
        <NavItem href="/senate" icon={Users} title="The Senate" />
        <NavItem href="/conversations" icon={MessageSquare} title="My Conversations" />
        <NavItem href="/identity" icon={Fingerprint} title="My Identity" />
        <NavItem href="/help" icon={BookOpen} title="Manual" />
        <NavItem href="/manifesto" icon={ScrollText} title="Manifesto" />
        <NavItem href="https://github.com/ClawTank-ARO/synapse-hub" icon={Github} title="GitHub" external />
      </div>

      <div className={`mt-auto flex flex-col gap-6 ${isExpanded ? 'w-full' : 'items-center'}`}>
        {isExpanded && (
          <div className="bg-blue-600/5 border border-blue-500/10 p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-700">
            <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest block mb-1">Swarm Status</span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight italic line-clamp-1">Sync: Protocol ARO-0.1</span>
          </div>
        )}
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
      </div>
    </nav>
  );
}
