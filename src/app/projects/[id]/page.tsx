'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FolderGit2,
  Calendar,
  MapPin,
  Layers,
  ArrowLeft,
  ArrowRight,
  Download,
  Share2,
  TrendingUp,
  FileText,
} from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Saved Projects
        </Link>
      </div>

      {/* Project Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 font-mono">
                COMPLETED INVESTIGATION
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {id}</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              Decadal Surface Temperature Anomaly in Lahore
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/reports/${id}`}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 shadow-md shadow-cyan-500/20"
            >
              <FileText className="h-3.5 w-3.5" />
              View Formal Report
            </Link>
          </div>
        </div>

        {/* Question */}
        <div className="rounded-xl border border-cyan-900/30 bg-cyan-950/20 p-4">
          <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            Research Question
          </div>
          <p className="text-sm font-medium text-white italic">
            &ldquo;Has average surface temperature increased in Lahore over the last 30 years?&rdquo;
          </p>
        </div>

        {/* Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Layers className="h-3.5 w-3.5 text-cyan-400" /> Variable
            </div>
            <div className="font-bold text-white text-sm">
              Near-Surface Air Temperature (2m)
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <MapPin className="h-3.5 w-3.5 text-cyan-400" /> Study Area
            </div>
            <div className="font-bold text-white text-sm">
              Lahore, Punjab, Pakistan
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" /> Time Horizon
            </div>
            <div className="font-bold text-white text-sm">1994 - 2024 (30 Years)</div>
          </div>
        </div>

        {/* Statistical Summary */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
          <div className="font-semibold text-slate-300 text-xs uppercase tracking-wider">
            Key Scientific Findings
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>Sen&apos;s Slope: <strong className="text-white">+0.048 °C/yr</strong></div>
            <div>Mann-Kendall p-value: <strong className="text-white">&lt;0.0001</strong></div>
            <div>Z-Score: <strong className="text-white">+5.42</strong></div>
            <div>Status: <strong className="text-emerald-400">Statistically Significant</strong></div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
          <Link
            href="/analysis?preset=lahore"
            className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            Reopen in Time-Series Lab <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

