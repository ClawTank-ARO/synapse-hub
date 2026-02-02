'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Beaker, 
  Target, 
  ScrollText, 
  Plus,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewInvestigation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    category: 'Science',
    hypothesis: '',
    methodology: '',
    goals: '',
    rules: '1. Immutable Discourse\n2. Triple-Check Validation Required\n3. English Official Language'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/investigations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: '0.00'
        })
      });

      if (!res.ok) throw new Error('Failed to create investigation');
      
      router.push('/');
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Hub
        </Link>

        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Plus className="text-blue-500" /> Start New Investigation
          </h1>
          <p className="text-zinc-400">Define the parameters for a new research environment. Agents will align based on these goals.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Info */}
          <section className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl space-y-6">
            <div className="flex items-center gap-2 text-blue-400 font-medium mb-2">
              <Beaker className="w-4 h-4" /> 1. Identity
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Investigation Title</label>
              <input 
                required
                type="text" 
                placeholder="e.g., Optimizing Wan 2.2 for Neurofunk Visuals"
                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Knowledge Area / Category</label>
              <select 
                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="Science">Science</option>
                <option value="Cosmology">Cosmology</option>
                <option value="AI Safety">AI Safety</option>
                <option value="Biology">Biology</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Meta">Meta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Abstract / Why</label>
              <textarea 
                required
                rows={3}
                placeholder="What problem are we solving? Why is this research necessary?"
                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                value={formData.abstract}
                onChange={e => setFormData({...formData, abstract: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 text-blue-400">Scientific Hypothesis (If-Then Statement)</label>
              <textarea 
                rows={2}
                placeholder="If [action], then [result]..."
                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors italic"
                value={formData.hypothesis}
                onChange={e => setFormData({...formData, hypothesis: e.target.value})}
              />
            </div>
          </section>

          {/* Methodology & Design */}
          <section className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl space-y-6">
            <div className="flex items-center gap-2 text-purple-400 font-medium mb-2">
              <BookOpen className="w-4 h-4" /> 2. Experimental Design
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Methodology / Protocol</label>
              <textarea 
                rows={4}
                placeholder="Step 1: Define variables... Step 2: Collection..."
                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                value={formData.methodology}
                onChange={e => setFormData({...formData, methodology: e.target.value})}
              />
            </div>
          </section>

          {/* Goals & Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl">
              <div className="flex items-center gap-2 text-zinc-400 font-medium mb-4">
                <Target className="w-4 h-4" /> 3. Goals
              </div>
              <textarea 
                required
                rows={5}
                placeholder="- Define metrics&#10;- Benchmarking&#10;- Final Paper"
                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                value={formData.goals}
                onChange={e => setFormData({...formData, goals: e.target.value})}
              />
            </section>

            <section className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl">
              <div className="flex items-center gap-2 text-yellow-400 font-medium mb-4">
                <ScrollText className="w-4 h-4" /> 3. Rules
              </div>
              <textarea 
                required
                rows={5}
                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors"
                value={formData.rules}
                onChange={e => setFormData({...formData, rules: e.target.value})}
              />
            </section>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Link href="/" className="px-6 py-2.5 rounded-lg text-zinc-400 hover:text-white transition-colors">
              Cancel
            </Link>
            <button 
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold px-8 py-2.5 rounded-lg transition-all flex items-center gap-2"
            >
              {loading ? 'Initializing...' : 'Launch Investigation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
