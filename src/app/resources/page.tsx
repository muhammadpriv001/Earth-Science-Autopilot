'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EXTERNAL_RESOURCES } from '@/lib/providers/resources-catalog';
import { ExternalResource } from '@/types';
import { BookOpen, ExternalLink, ShieldCheck, Search, Filter } from 'lucide-react';

const CATEGORIES = [
  'All',
  'NASA Data',
  'Space Agency',
  'Climate & Hydrology',
  'Statistical Methods',
  'Scientific Tutorials',
];

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = EXTERNAL_RESOURCES.filter(r => {
    const matchesCat = activeCategory === 'All' || r.category === activeCategory;
    const matchesQuery =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const getStatusBadge = (status: ExternalResource['integrationStatus']) => {
    switch (status) {
      case 'Integrated':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Discovery Supported':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Authentication Required':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="h-4 w-4" /> Challenge Reference Directory
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
          Data & Research Resources
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          NASA Space Apps Challenge 2026: Authoritative scientific catalog of NASA APIs, space agency satellite missions, climate databases, statistical standards, and technical tutorials.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search resources, agencies..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(resource => (
          <div
            key={resource.id}
            className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-xl group"
          >
            <div className="space-y-3">
              {/* Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-400 font-mono">
                  {resource.organization}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(
                    resource.integrationStatus
                  )}`}
                >
                  {resource.integrationStatus}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                {resource.name}
              </h3>

              {/* Description */}
              <p className="text-xs text-slate-400 leading-relaxed">
                {resource.description}
              </p>

              {/* Challenge Relevance */}
              <div className="rounded-xl border border-slate-900 bg-slate-900/50 p-3 text-[11px] text-slate-300">
                <strong className="text-cyan-400">Challenge Relevance:</strong>{' '}
                {resource.challengeRelevance}
              </div>

              {/* Metadata Attributes */}
              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-400 pt-1">
                <span className="rounded bg-slate-900 px-2 py-0.5 border border-slate-800">
                  Access: {resource.accessType}
                </span>
                <span className="rounded bg-slate-900 px-2 py-0.5 border border-slate-800">
                  Auth: {resource.authRequirement}
                </span>
              </div>
            </div>

            {/* Link out */}
            <div className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between">
              <Link
                href={resource.url}
                target="_blank"
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
              >
                Official Resource Portal <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

