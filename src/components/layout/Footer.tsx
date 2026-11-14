import React from 'react';
import Link from 'next/link';
import { Compass, ExternalLink, ShieldCheck, Globe, Database } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-emerald-900/60 bg-[#06211b] text-emerald-100/70 text-xs select-none">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-black text-white text-sm tracking-tight">Earth Science Autopilot</span>
            </div>
            <p className="text-emerald-200/70 leading-relaxed text-[11px]">
              AI-assisted Earth-science research, geospatial exploration, and deterministic statistical trend detection.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono font-bold">
              <Globe className="h-3 w-3 text-orange-400" /> spacegeoai.com
            </div>
          </div>

          {/* NASA Space Apps 2026 */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">NASA Space Apps 2026</h4>
            <p className="text-[11px] text-emerald-200/70">
              Challenge: <strong className="text-white">Be An Earth System Trend Detective!</strong>
            </p>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link
                  href="https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/"
                  target="_blank"
                  className="hover:text-orange-400 inline-flex items-center gap-1 text-emerald-200/90 transition-colors"
                >
                  Official Challenge Page <ExternalLink className="h-2.5 w-2.5" />
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-orange-400 text-emerald-200/90 transition-colors">
                  Data &amp; Research Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Modules */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Research Modules</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/explore" className="hover:text-orange-400 transition-colors">Global GIS Explorer</Link></li>
              <li><Link href="/analysis" className="hover:text-orange-400 transition-colors">Time-Series &amp; Trend Laboratory</Link></li>
              <li><Link href="/compare" className="hover:text-orange-400 transition-colors">Regional Comparison</Link></li>
              <li><Link href="/forecast" className="hover:text-orange-400 transition-colors">Forecast AI Lab</Link></li>
              <li><Link href="/cross-domain" className="hover:text-orange-400 transition-colors">Cross-Domain Coupling</Link></li>
            </ul>
          </div>

          {/* Scientific Integrity */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Scientific Integrity
            </h4>
            <p className="text-[11px] text-emerald-200/70 leading-relaxed">
              Calculations are computed strictly via deterministic TypeScript statistical algorithms (Mann-Kendall test with tie variance correction, Sen&apos;s slope estimator, and OLS regression). No simulated statistics or AI mathematical hallucinations.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-300/70 gap-4">
          <p>© 2026 The Earth Science Autopilot. Open access under MIT License.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Database className="h-3 w-3 text-emerald-400" /> NASA EOSDIS &amp; NOAA NCEI compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
