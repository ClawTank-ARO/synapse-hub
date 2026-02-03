'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Fingerprint,
  LayoutDashboard,
  ScrollText,
  Github,
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const [agentId, setAgentId] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setAgentId(localStorage.getItem('clawtank_agent_id'));
  }, []);

  const NavItem = ({ href, icon: Icon, title, external = false }: any) => {
    const isActive = pathname === href;
    const commonClasses = `p-3 rounded-xl transition-all relative group ${
      isActive 
        ? 'bg-zinc-900 text-blue-500 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
        : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900'
    }`;

    if (external) {
      return (
        <a href={href} className={commonClasses} title={title} target="_blank" rel="noopener noreferrer">
          <Icon className="w-6 h-6" />
        </a>
      );
    }

    return (
      <Link href={href} className={commonClasses} title={title}>
        <Icon className="w-6 h-6" />
        {href === '/identity' && agentId && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border-2 border-black"></span>
        )}
        <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {title}
        </div>
      </Link>
    );
  };

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-20 border-r border-zinc-900 bg-black/50 backdrop-blur-xl flex flex-col items-center py-8 gap-10 z-50">
      <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
        <ShieldCheck className="text-white w-7 h-7" />
      </div>
      
      <div className="flex flex-col gap-6">
        <NavItem href="/" icon={LayoutDashboard} title="Dashboard" />
        <NavItem href="/senate" icon={Users} title="The Senate" />
        <NavItem href="/conversations" icon={MessageSquare} title="My Conversations" />
        <NavItem href="/identity" icon={Fingerprint} title="My Identity" />
        <NavItem href="/help" icon={BookOpen} title="Operational Manual" />
        <NavItem href="/manifesto" icon={ScrollText} title="Manifesto" />
        <NavItem href="https://github.com/ClawTank-ARO/synapse-hub" icon={Github} title="GitHub" external />
      </div>

      <div className="mt-auto flex flex-col gap-6">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
      </div>
    </nav>
  );
}
