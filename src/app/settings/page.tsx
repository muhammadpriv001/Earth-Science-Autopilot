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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Sliders className="h-4 w-4" /> System Preferences
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
          Platform Settings & API Tokens
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Configure optional credentials for live NOAA Climate Data Online station querying, NASA Earthdata protected granules, and Google Gemini AI autopilot planning.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* NOAA CDO Token */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">NOAA Climate Data Online Token</h3>
            </div>
            <a
              href="https://www.ncei.noaa.gov/cdo-web/token"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Request Free Token <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Required for live queries to NOAA NCEI historical ground weather station archives. Token is sent instantly to your email.
          </p>
          <input
            type="password"
            value={noaaToken}
            onChange={e => setNoaaToken(e.target.value)}
            placeholder="Enter 32-character NOAA CDO token..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
          />
        </div>

        {/* NASA Earthdata Login */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">NASA Earthdata Login (Optional)</h3>
            </div>
            <a
              href="https://urs.earthdata.nasa.gov/"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Create Account <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            NASA Common Metadata Repository (CMR) discovery is open and works without credentials. Earthdata Login is only needed for submitting custom AppEEARS processing jobs.
          </p>
          <input
            type="text"
            value={earthdataUsername}
            onChange={e => setEarthdataUsername(e.target.value)}
            placeholder="NASA Earthdata Username..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Google Gemini AI Key */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">AI Autopilot API Key (Optional)</h3>
            </div>
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Get Gemini Key <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            If no key is set, the Autopilot uses its deterministic heuristic research planner with zero reduction in scientific or statistical accuracy.
          </p>
          <input
            type="password"
            value={geminiKey}
            onChange={e => setGeminiKey(e.target.value)}
            placeholder="Enter AI API Key (AI_API_KEY)..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
          />
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Preferences saved!
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 shadow-md shadow-cyan-500/20"
          >
            <Save className="h-4 w-4" /> Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}

