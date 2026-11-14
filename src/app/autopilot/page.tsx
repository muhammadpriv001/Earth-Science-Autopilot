'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Calendar,
  MapPin,
  Layers,
  Database,
  Calculator,
  Sliders,
} from 'lucide-react';
import { ResearchPlan } from '@/types';

export default function AutopilotPage() {
  const router = useRouter();
  const [question, setQuestion] = useState(
    'Has average surface temperature increased in Lahore over the last 30 years?'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<ResearchPlan | null>(null);

  const handleGeneratePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/research/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (data.plan) {
        setPlan(data.plan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const executePlan = () => {
    if (!plan) return;
    const url = `/analysis?variable=${plan.targetVariable}&lat=${plan.targetRegion.center[1]}&lng=${plan.targetRegion.center[0]}&start=${plan.timeRange.start}&end=${plan.timeRange.end}`;
    router.push(url);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300">
          <Sparkles className="h-3.5 w-3.5" />
          AI & Heuristic Research Orchestrator
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Research Autopilot
        </h1>
        <p className="text-xs text-slate-400">
          State your environmental question in plain English. The Autopilot will architect a verifiable, reproducible scientific plan.
        </p>
      </div>

      {/* Natural Language Input Box */}
      <form onSubmit={handleGeneratePlan} className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-cyan-400" />
            Enter Research Question or Hypothesis:
          </label>
          <textarea
            rows={3}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="e.g. Has average surface temperature increased in Lahore over the last 30 years? Or compare precipitation trends in two regions..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 p-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none shadow-inner"
          />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 text-[11px]">Examples:</span>
          {[
            'Has average surface temperature increased in Lahore over the last 30 years?',
            'Has annual precipitation declined across the Southern Amazon basin?',
            'Is Arctic September sea ice extent decreasing significantly since 1980?',
          ].map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuestion(ex);
              }}
              className="rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
            >
              {ex.split('?')[0]}?
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-[1.02]"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Architecting Research Plan...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Research Plan
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Research Plan Display */}
      {plan && (
        <div className="rounded-2xl border border-cyan-900/50 bg-slate-950 p-6 shadow-2xl space-y-6 animate-fade-in">
          {/* Plan Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Research Plan Formulated
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                {plan.question}
              </h2>
            </div>

            <button
              onClick={executePlan}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-500 transition-all hover:scale-[1.02]"
            >
              Execute Research Plan <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Key Parameters Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Layers className="h-3.5 w-3.5 text-cyan-400" /> Target Variable
              </div>
              <div className="font-bold text-white text-sm capitalize">
                {plan.targetVariable.replace(/-/g, ' ')}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                {plan.earthSystem} System
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" /> Geographic Region
              </div>
              <div className="font-bold text-white text-sm">
                {plan.targetRegion.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {plan.targetRegion.center[1].toFixed(2)}°N, {plan.targetRegion.center[0].toFixed(2)}°E
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Calendar className="h-3.5 w-3.5 text-cyan-400" /> Temporal Window
              </div>
              <div className="font-bold text-white text-sm">
                {plan.timeRange.start.substring(0, 4)} - {plan.timeRange.end.substring(0, 4)}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {plan.temporalResolution} Aggregation
              </div>
            </div>
          </div>

          {/* Candidate Datasets */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Database className="h-4 w-4 text-cyan-400" /> Candidate Datasets & Suitability
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {plan.candidateDatasets.map((ds, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-xs">
                  <div className="font-bold text-white">{ds.name}</div>
                  <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{ds.provider}</div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {ds.suitabilityReason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Statistical Methodology */}
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/30 p-4">
            <h3 className="font-semibold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="h-4 w-4 text-cyan-400" /> Deterministic Statistical Protocols
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
              {plan.statisticalMethods.map((method, idx) => (
                <li key={idx}>{method}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

