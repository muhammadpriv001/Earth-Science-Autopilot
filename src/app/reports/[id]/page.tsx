'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FileText,
  Printer,
  Download,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Layers,
  MapPin,
  Database,
  Calculator,
} from 'lucide-react';
import { useAuth } from '@/context/AuthAndInvestigationContext';
import { analyzeTimeSeries } from '@/lib/science/time-series-pipeline';
import { TimeSeriesDataset, StatisticalTrendResult } from '@/types';

function formatP(p: number): string {
  return p < 0.0001 ? '< 0.0001' : p.toFixed(4);
}

export default function ReportPage() {
  const params = useParams();
  const id = params?.id as string;
  const { savedInvestigations } = useAuth();
  const project = savedInvestigations.find(inv => inv.id === id);

  const [dataset, setDataset] = useState<TimeSeriesDataset | null>(null);
  const [trend, setTrend] = useState<StatisticalTrendResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!project) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);

    fetch('/api/analysis/timeseries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variableId: project.selectedVariable,
        region: project.mainLocation,
      }),
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Live measurements could not be retrieved.');
        }
        if (!active) return;
        setDataset(data.dataset);
        setTrend(analyzeTimeSeries(data.dataset.observations));
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [project?.id, project?.selectedVariable, project?.mainLocation.name]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadCsv = () => {
    if (!dataset) return;
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

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-center space-y-4">
        <FileText className="h-10 w-10 text-slate-300 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">Report not found</h1>
        <p className="text-xs text-slate-500">
          This report belongs to a saved investigation that is not in your portfolio.
        </p>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-emerald-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Toolbar (Hidden during print) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Workspace
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            disabled={!dataset}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5 text-emerald-600" />
            Download Dataset (CSV)
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-500/20"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
          Retrieving live measurements and recomputing the statistical trend…
        </div>
      ) : error || !dataset || !trend ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center space-y-2">
          <ShieldCheck className="h-8 w-8 text-amber-500 mx-auto" />
          <h2 className="text-sm font-bold text-amber-900">Live report unavailable</h2>
          <p className="text-xs text-amber-800 max-w-lg mx-auto leading-relaxed">
            {error || 'No live measurements are available for this variable and location.'}
          </p>
        </div>
      ) : (
        <article className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] space-y-8 text-slate-700 print:border-none print:shadow-none print:p-0">
          {/* Document Header */}
          <header className="border-b border-slate-200 print:border-slate-300 pb-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-700">
              <span>NASA SPACE APPS CHALLENGE 2026</span>
              <span>REPORT ID: {id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Scientific Investigation Report: {project.title}
            </h1>
            <p className="text-xs text-slate-500">
              Platform: The Earth Science Autopilot (spacegeoai.com) • Computed on{' '}
              {new Date(dataset.provenance.retrievalDate).toLocaleString()}
            </p>
          </header>

          {/* 1. Executive Summary */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <FileText className="h-4 w-4" /> 1. Executive Summary &amp; Research Question
            </h2>
            <div className="rounded-2xl border border-slate-200 bg-[#f8faf9] p-4 text-xs leading-relaxed space-y-2">
              {project.description && (
                <div>
                  <strong>Stored Investigation Notes:</strong> &ldquo;{project.description}&rdquo;
                </div>
              )}
              <div>
                <strong>Computed Result:</strong> The Sen&apos;s non-parametric slope estimator yields{' '}
                <strong>
                  {trend.sensSlopePerYear > 0 ? '+' : ''}
                  {trend.sensSlopePerYear} {dataset.unit}/year
                </strong>{' '}
                over {trend.totalObservations} monthly observations. The Mann-Kendall test returns
                S = {trend.mannKendallS}, Z = {trend.mannKendallZ}, two-tailed p ={' '}
                {formatP(trend.mannKendallPValue)}. The trend is{' '}
                {trend.isSignificant ? 'statistically significant' : 'not statistically significant'} at
                the α = 0.05 threshold.
              </div>
            </div>
          </section>

          {/* 2. Study Area & Parameter Details */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> 2. Study Region &amp; Observation Metadata
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="rounded-xl border border-slate-200 p-3">
                <span className="text-slate-500">Study Region:</span>
                <div className="font-bold text-slate-900 mt-0.5">{dataset.region.name}</div>
                <div className="text-[11px] text-emerald-700">
                  Center: {dataset.region.center[1].toFixed(4)}°, {dataset.region.center[0].toFixed(4)}°
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <span className="text-slate-500">Earth-Science Variable:</span>
                <div className="font-bold text-slate-900 mt-0.5">{dataset.variableName}</div>
                <div className="text-[11px] text-emerald-700">Physical Unit: {dataset.unit}</div>
              </div>
            </div>
          </section>

          {/* 3. Data Source Provenance & Processing */}
          <section className="space-y-3 text-xs leading-relaxed">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <Database className="h-4 w-4" /> 3. Data Source Provenance &amp; Processing History
            </h2>
            <p>
              <strong>Primary Provider:</strong> {dataset.provider} ({dataset.datasetName})
            </p>
            <p className="text-slate-500">{dataset.provenance.citation}</p>
            <div className="space-y-1">
              <strong>Documented Transformation Steps:</strong>
              <ol className="list-decimal pl-5 space-y-1 text-slate-500">
                {dataset.provenance.transformationSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          </section>

          {/* 4. Statistical Results */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <Calculator className="h-4 w-4" /> 4. Deterministic Statistical Analysis
            </h2>
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden font-mono">
              <thead className="bg-[#f8faf9] text-slate-600">
                <tr>
                  <th className="p-3">Statistical Metric</th>
                  <th className="p-3">Computed Value</th>
                  <th className="p-3">Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-semibold">Sen&apos;s Slope Estimator (Q)</td>
                  <td className="p-3 text-emerald-700 font-bold">
                    {trend.sensSlopePerYear > 0 ? '+' : ''}
                    {trend.sensSlopePerYear} {dataset.unit}/year
                  </td>
                  <td className="p-3">Median rate of change per calendar year</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Mann-Kendall S-Statistic</td>
                  <td className="p-3 font-bold">{trend.mannKendallS}</td>
                  <td className="p-3">Sum of signs of all pair differences</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Standardized Z-Score</td>
                  <td className="p-3 font-bold">{trend.mannKendallZ}</td>
                  <td className="p-3">&gt;1.96 critical threshold</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Two-Tailed p-Value</td>
                  <td className="p-3 text-emerald-700 font-bold">{formatP(trend.mannKendallPValue)}</td>
                  <td className="p-3">
                    {trend.isSignificant ? 'Significant at α = 0.05' : 'Not significant at α = 0.05'}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">OLS Linear Slope (R²)</td>
                  <td className="p-3 font-bold">
                    {trend.linearSlopePerYear > 0 ? '+' : ''}
                    {trend.linearSlopePerYear} {dataset.unit}/yr (R²={trend.rSquared})
                  </td>
                  <td className="p-3">Parametric least-squares linear fit</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Valid Observations</td>
                  <td className="p-3 font-bold">
                    {trend.validObservations} of {trend.totalObservations}
                  </td>
                  <td className="p-3">Monthly POWER/NSIDC measurement intervals</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 5. Methodological Limitations */}
          <section className="space-y-3 text-xs leading-relaxed">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> 5. Limitations &amp; Caveats
            </h2>
            <p className="text-slate-500">
              The Mann-Kendall test assumes independent observations; serial correlation and localized
              micro-climates may influence point-based estimates. Statistical significance indicates
              that the observed trajectory is unlikely to result from chance alone, but does not by
              itself attribute the change to a specific forcing mechanism.
            </p>
          </section>

          {/* 6. Citation & Reproducibility */}
          <footer className="pt-6 border-t border-slate-200 text-[11px] text-slate-400 font-mono space-y-1">
            <div>Dataset Retrieval: {dataset.provenance.retrievalDate}</div>
            <div>Source: {dataset.provenance.sourceUrl}</div>
            <div>Software: The Earth Science Autopilot 1.0.0 (TypeScript Scientific Core)</div>
          </footer>
        </article>
      )}
    </div>
  );
}
