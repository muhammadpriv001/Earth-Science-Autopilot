import React from 'react';
import Link from 'next/link';
import { Compass, ExternalLink, ShieldCheck, Globe, Database } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950 text-slate-400 text-xs">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600 text-white">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-bold text-white text-sm">Earth Science Autopilot</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              AI-assisted Earth-science research, geospatial exploration, and deterministic statistical trend detection.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-mono">
              <Globe className="h-3 w-3" /> spacegeoai.com
            </div>
          </div>

          {/* NASA Space Apps 2026 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">NASA Space Apps 2026</h4>
            <p className="text-[11px] text-slate-400">
              Challenge: <strong>Be An Earth System Trend Detective!</strong>
            </p>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link
                  href="https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/"
                  target="_blank"
                  className="hover:text-cyan-400 inline-flex items-center gap-1 text-slate-300"
                >
                  Official Challenge Page <ExternalLink className="h-2.5 w-2.5" />
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-cyan-400 text-slate-300">
                  Data & Research Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Modules */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">Research Modules</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/explore" className="hover:text-cyan-400">Global GIS Explorer</Link></li>
              <li><Link href="/variables" className="hover:text-cyan-400">Earth Science Variables</Link></li>
              <li><Link href="/datasets" className="hover:text-cyan-400">NASA CMR Discovery</Link></li>
              <li><Link href="/analysis" className="hover:text-cyan-400">Time-Series & Trend Laboratory</Link></li>
              <li><Link href="/compare" className="hover:text-cyan-400">Regional Comparison</Link></li>
            </ul>
          </div>

          {/* Scientific Integrity */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" /> Scientific Integrity
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Calculations are computed strictly via deterministic TypeScript statistical algorithms (Mann-Kendall test with tie variance correction, Sen&apos;s slope estimator, and OLS regression). No simulated statistics or AI mathematical hallucinations.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <p>© 2026 The Earth Science Autopilot. Open access under MIT License.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Database className="h-3 w-3 text-cyan-400" /> NASA EOSDIS & NOAA NCEI compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

