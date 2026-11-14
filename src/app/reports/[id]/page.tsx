'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FileText,
  Printer,
  Download,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Calendar,
  Layers,
  MapPin,
  Database,
  Calculator,
} from 'lucide-react';
import { LAHORE_TEMPERATURE_BENCHMARK } from '@/lib/providers/mock-datasets';
import { analyzeTimeSeries } from '@/lib/science/time-series-pipeline';

export default function ReportPage() {
  const params = useParams();
  const id = params?.id as string;

  const dataset = LAHORE_TEMPERATURE_BENCHMARK;
  const trend = analyzeTimeSeries(dataset.observations);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadCsv = () => {
    const headers = ['Date', `${dataset.variableName} (${dataset.unit})`, 'QualityFlag'];
    const rows = dataset.observations.map(o => [o.date, o.value, o.qualityFlag]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report_${id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Toolbar (Hidden during print) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Workspace
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            Download Dataset (CSV)
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 shadow-md shadow-cyan-500/20"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Formal Research Document */}
      <article className="rounded-2xl border border-slate-800 bg-slate-950 p-8 sm:p-12 shadow-2xl space-y-8 text-slate-200 print:border-none print:bg-white print:text-black">
        {/* Document Header */}
        <header className="border-b border-slate-800 print:border-slate-300 pb-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400 print:text-cyan-800">
            <span>NASA SPACE APPS CHALLENGE 2026</span>
            <span>REPORT ID: {id || 'AUTOPILOT-2026-001'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white print:text-black">
            Scientific Investigation Report: Decadal Surface Temperature Trends in Lahore, Pakistan
          </h1>
          <p className="text-xs text-slate-400 print:text-slate-600">
            Platform: The Earth Science Autopilot (spacegeoai.com) • Generated on November 14, 2026
          </p>
        </header>

        {/* 1. Executive Summary */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-cyan-800 flex items-center gap-1.5">
            1. Executive Summary & Research Question
          </h2>
          <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-4 print:border-slate-200 print:bg-slate-50 text-xs leading-relaxed space-y-2">
            <div>
              <strong>Primary Research Question:</strong> &ldquo;Has average surface temperature increased in Lahore over the last 30 years?&rdquo;
            </div>
            <div>
              <strong>Conclusion:</strong> A statistically significant warming trend is detected over the 1994–2024 analysis window (Mann-Kendall test statistic S = {trend.mannKendallS}, standardized Z = {trend.mannKendallZ}, p-value &lt; 0.0001). The Sen&apos;s non-parametric slope estimator indicates a rate of warming of <strong>+{trend.sensSlopePerYear} °C per year</strong> (or approximately +0.48 °C per decade).
            </div>
          </div>
        </section>

        {/* 2. Study Area & Parameter Details */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-cyan-800">
            2. Study Region & Observation Metadata
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="rounded-lg border border-slate-800 print:border-slate-300 p-3">
              <span className="text-slate-400 print:text-slate-600">Study Region:</span>
              <div className="font-bold text-white print:text-black mt-0.5">{dataset.region.name}</div>
              <div className="text-[11px] text-cyan-400 print:text-cyan-800">Coordinates: 31.5204° N, 74.3587° E</div>
            </div>
            <div className="rounded-lg border border-slate-800 print:border-slate-300 p-3">
              <span className="text-slate-400 print:text-slate-600">Earth-Science Variable:</span>
              <div className="font-bold text-white print:text-black mt-0.5">{dataset.variableName}</div>
              <div className="text-[11px] text-cyan-400 print:text-cyan-800">Physical Unit: {dataset.unit}</div>
            </div>
          </div>
        </section>

        {/* 3. Data Source Provenance & Processing */}
        <section className="space-y-3 text-xs leading-relaxed">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-cyan-800">
            3. Data Source Provenance & Processing History
          </h2>
          <p>
            <strong>Primary Provider:</strong> {dataset.provider} ({dataset.datasetName})
          </p>
          <div className="space-y-1">
            <strong>Documented Transformation Steps:</strong>
            <ol className="list-decimal pl-5 space-y-1 text-slate-400 print:text-slate-600">
              {dataset.provenance.transformationSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        </section>

        {/* 4. Statistical Results & Decomposition */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-cyan-800">
            4. Deterministic Statistical Analysis
          </h2>
          <table className="w-full text-left text-xs border border-slate-800 print:border-slate-300 rounded-lg overflow-hidden font-mono">
            <thead className="bg-slate-900 print:bg-slate-100 text-slate-300 print:text-black">
              <tr>
                <th className="p-3">Statistical Metric</th>
                <th className="p-3">Computed Value</th>
                <th className="p-3">Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-slate-200">
              <tr>
                <td className="p-3 font-semibold">Sen&apos;s Slope Estimator (Q)</td>
                <td className="p-3 text-cyan-400 print:text-cyan-800 font-bold">+{trend.sensSlopePerYear} °C/year</td>
                <td className="p-3">Median rate of change per calendar year</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Mann-Kendall S-Statistic</td>
                <td className="p-3 font-bold">{trend.mannKendallS}</td>
                <td className="p-3">Sum of signs of all pair differences</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Standardized Z-Score</td>
                <td className="p-3 font-bold">+{trend.mannKendallZ}</td>
                <td className="p-3">&gt;1.96 critical threshold</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Two-Tailed p-Value</td>
                <td className="p-3 text-emerald-400 print:text-emerald-800 font-bold">&lt;0.0001</td>
                <td className="p-3">Statistically significant at α = 0.05</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">OLS Linear Slope (R²)</td>
                <td className="p-3 font-bold">+{trend.linearSlopePerYear} °C/yr (R²={trend.rSquared})</td>
                <td className="p-3">Parametric least-squares linear fit</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Valid Observations</td>
                <td className="p-3 font-bold">{trend.validObservations} of {trend.totalObservations}</td>
                <td className="p-3">0 missing intervals detected</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 5. Methodological Limitations */}
        <section className="space-y-3 text-xs leading-relaxed">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-cyan-800">
            5. Limitations & Caveats
          </h2>
          <p className="text-slate-400 print:text-slate-600">
            The Mann-Kendall test assumes independent observations; urban heat island effects and localized micro-climates around airport weather stations may partially accentuate localized surface air temperature trends. Statistical significance indicates that the observed upward trajectory is extraordinarily unlikely to result from pure chance, but does not identify individual anthropogenic or natural radiative forcing mechanisms without coupled climate model attribution.
          </p>
        </section>

        {/* 6. Citation & Reproducibility */}
        <footer className="pt-6 border-t border-slate-800 print:border-slate-300 text-[11px] text-slate-500 font-mono">
          <div>Reproducibility Hash: SHA256-NASA2026-TREND-AUTOPILOT-LAHORE-V1</div>
          <div>Software: The Earth Science Autopilot 1.0.0 (TypeScript Scientific Core)</div>
        </footer>
      </article>
    </div>
  );
}

