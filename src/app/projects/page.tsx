'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FolderGit2, Plus, ArrowRight, Calendar, MapPin, Layers, FileText } from 'lucide-react';

export default function ProjectsPage() {
  const [projects] = useState([
    {
      id: 'lahore-temperature-warming',
      title: 'Decadal Surface Temperature Anomaly in Lahore',
      question: 'Has average surface temperature increased in Lahore over the last 30 years?',
      variable: 'Near-Surface Air Temperature (2m)',
      region: 'Lahore, Punjab, Pakistan',
      updatedAt: '2026-11-14',
      status: 'Completed',
      rate: '+0.048 °C/year',
    },
    {
      id: 'amazon-precipitation-decline',
      title: 'Southern Amazon Basin Multi-Decadal Precipitation Trends',
      question: 'Has annual precipitation declined across the Southern Amazon basin?',
      variable: 'Total Precipitation Rate',
      region: 'Southern Amazon Basin, Brazil',
      updatedAt: '2026-11-14',
      status: 'Completed',
      rate: '-18.4 mm/year',
    },
    {
      id: 'arctic-sea-ice-retreat',
      title: 'Arctic September Minimum Sea Ice Extent Decomposition',
      question: 'Is Arctic September sea ice extent decreasing significantly since 1980?',
      variable: 'Sea Ice Concentration & Extent',
      region: 'Northern Hemisphere Arctic Ocean',
      updatedAt: '2026-11-14',
      status: 'Completed',
      rate: '-0.078 M km²/year',
    },
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <FolderGit2 className="h-4 w-4" /> Research Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Saved Research Projects
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Review, rerun, and share your reproducible Earth-science investigations.
          </p>
        </div>

        <Link
          href="/explore"
          className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Research Project
        </Link>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map(project => (
          <div
            key={project.id}
            className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-xl group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 font-mono">
                  {project.status}
                </span>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {project.updatedAt}
                </span>
              </div>

              <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                {project.title}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed italic">
                &ldquo;{project.question}&rdquo;
              </p>

              <div className="pt-2 border-t border-slate-900 space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{project.variable}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{project.region}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400">
                Trend: {project.rate}
              </span>
              <Link
                href={`/projects/${project.id}`}
                className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Open Project <ArrowRight className="h-3 w-3 text-cyan-400" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

