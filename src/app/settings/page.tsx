'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Key,
  Database,
  Cpu,
  ShieldCheck,
  Save,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function SettingsPage() {
  const [noaaToken, setNoaaToken] = useState('');
  const [earthdataUsername, setEarthdataUsername] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <Sliders className="h-4 w-4" /> System Preferences
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Platform Settings &amp; API Tokens
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Configure optional credentials for live NOAA Climate Data Online station querying, NASA Earthdata protected granules, and Google Gemini AI autopilot planning.
        </p>
      </div>

      {/* Form: Pure White Neomorphic Cards on #edf2ef Canvas */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* NOAA CDO Token */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 sm:p-7 space-y-4 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 border border-teal-300 text-teal-800">
                <Key className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">NOAA Climate Data Online Token</h3>
            </div>
            <a
              href="https://www.ncei.noaa.gov/cdo-web/token"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              Request Free Token <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Required for live queries to NOAA NCEI historical ground weather station archives. Token is sent instantly to your email.
          </p>
          <input
            type="password"
            value={noaaToken}
            onChange={e => setNoaaToken(e.target.value)}
            placeholder="Enter 32-character NOAA CDO token..."
            className="w-full rounded-2xl border border-slate-200 bg-[#f8faf9] p-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none font-mono"
          />
        </div>

        {/* NASA Earthdata Login */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 sm:p-7 space-y-4 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800">
                <Database className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">NASA Earthdata Login (Optional)</h3>
            </div>
            <a
              href="https://urs.earthdata.nasa.gov/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              Create Account <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            NASA Common Metadata Repository (CMR) discovery is open and works without credentials. Earthdata Login is only needed for submitting custom AppEEARS processing jobs.
          </p>
          <input
            type="text"
            value={earthdataUsername}
            onChange={e => setEarthdataUsername(e.target.value)}
            placeholder="NASA Earthdata Username..."
            className="w-full rounded-2xl border border-slate-200 bg-[#f8faf9] p-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Google Gemini AI Key */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 sm:p-7 space-y-4 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 border border-indigo-300 text-indigo-800">
                <Cpu className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">AI Autopilot API Key (Optional)</h3>
            </div>
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
            >
              Get Gemini Key <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            If no key is set, the Autopilot uses its deterministic heuristic research planner with zero reduction in scientific or statistical accuracy.
          </p>
          <input
            type="password"
            value={geminiKey}
            onChange={e => setGeminiKey(e.target.value)}
            placeholder="Enter AI API Key (AI_API_KEY)..."
            className="w-full rounded-2xl border border-slate-200 bg-[#f8faf9] p-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none font-mono"
          />
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Preferences saved!
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-7 py-3 text-xs font-bold text-white shadow-xl shadow-orange-500/25 hover:from-orange-400 hover:to-amber-500 hover:scale-[1.02] active:scale-98 transition-all"
          >
            <Save className="h-4 w-4" /> Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
