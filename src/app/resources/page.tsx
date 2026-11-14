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
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Discovery Supported':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Authentication Required':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="h-4 w-4" /> Challenge Reference Directory
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Data &amp; Research Resources
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          NASA Space Apps Challenge 2026: Authoritative scientific catalog of NASA APIs, space agency satellite missions, climate databases, statistical standards, and technical tutorials.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-2xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search resources, agencies..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none shadow-sm"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Resources Grid: Pure White Neomorphic Cards on #edf2ef Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(resource => (
          <div
            key={resource.id}
            className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 flex flex-col justify-between shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md hover:border-emerald-500/50 hover:shadow-lg transition-all group"
          >
            <div className="space-y-3">
              {/* Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-emerald-800 font-mono">
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
              <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                {resource.name}
              </h3>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed">
                {resource.description}
              </p>

              {/* Challenge Relevance */}
              <div className="rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-3 text-[11px] text-slate-700">
                <strong className="text-emerald-800">Challenge Relevance:</strong>{' '}
                {resource.challengeRelevance}
              </div>

              {/* Metadata Attributes */}
              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-500 pt-1">
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 border border-slate-200 font-semibold">
                  Access: {resource.accessType}
                </span>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 border border-slate-200 font-semibold">
                  Auth: {resource.authRequirement}
                </span>
              </div>
            </div>

            {/* Link out */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={resource.url}
                target="_blank"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5"
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
