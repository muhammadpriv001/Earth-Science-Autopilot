'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Layers,
  ArrowLeft,
  ArrowRight,
  FileText,
  FolderGit2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthAndInvestigationContext';
import { useLocation } from '@/context/LocationContext';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { savedInvestigations, loadInvestigation } = useAuth();
  const { setAsMainLocation } = useLocation();

  const project = savedInvestigations.find(inv => inv.id === id);

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-center space-y-4">
        <FolderGit2 className="h-10 w-10 text-slate-300 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">Project not found</h1>
        <p className="text-xs text-slate-500">
          This investigation is not in your saved portfolio, or it may have been deleted.
        </p>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-emerald-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Saved Projects
        </Link>
      </div>
    );
  }

  const handleReopen = () => {
    loadInvestigation(project.id);
    setAsMainLocation(
      project.mainLocation.name,
      project.mainLocation.coordinates,
      project.mainLocation.radiusKm
    );
    router.push('/explore');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Saved Projects
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 font-mono">
                SAVED INVESTIGATION
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {project.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {project.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/reports/${project.id}`}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-500/20"
            >
              <FileText className="h-3.5 w-3.5" />
              View Report
            </Link>
          </div>
        </div>

        {(project.description || project.notes) && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
            <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              Investigation Notes
            </div>
            <p className="text-sm font-medium text-slate-700 italic">
              &ldquo;{project.description || project.notes}&rdquo;
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-[#f8faf9] p-4">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <Layers className="h-3.5 w-3.5 text-emerald-600" /> Variable
            </div>
            <div className="font-bold text-slate-900 text-sm">{project.selectedVariable}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#f8faf9] p-4">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Study Area
            </div>
            <div className="font-bold text-slate-900 text-sm">{project.mainLocation.name}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#f8faf9] p-4">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Last Updated
            </div>
            <div className="font-bold text-slate-900 text-sm">
              {new Date(project.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-[#f8faf9] p-4 text-xs text-slate-600 leading-relaxed">
          Statistical findings are recomputed from live measurements each time the investigation is
          reopened. This page shows only the metadata that was stored with your portfolio entry — it
          does not display cached or placeholder trend numbers.
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReopen}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Reopen in Explore &amp; AI <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <Link
            href={`/reports/${project.id}`}
            className="text-xs font-semibold text-orange-600 hover:text-orange-500"
          >
            Open generated report →
          </Link>
        </div>
      </div>
    </div>
  );
}
