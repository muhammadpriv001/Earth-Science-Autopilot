'use client';

import React from 'react';
import Link from 'next/link';
import { FolderGit2, Plus, ArrowRight, Calendar, MapPin, Layers } from 'lucide-react';
import { useAuth } from '@/context/AuthAndInvestigationContext';
import { useLocation } from '@/context/LocationContext';
import { useRouter } from 'next/navigation';

export default function ProjectsPage() {
  const router = useRouter();
  const { savedInvestigations, loadInvestigation } = useAuth();
  const { setAsMainLocation } = useLocation();

  const handleOpen = (id: string, location: { name: string; coordinates: [number, number]; radiusKm: number }) => {
    loadInvestigation(id);
    setAsMainLocation(location.name, location.coordinates, location.radiusKm);
    router.push('/explore');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <FolderGit2 className="h-4 w-4 text-emerald-600" /> Research Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Saved Research Projects
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Review, rerun, and share your reproducible Earth-science investigations.
          </p>
        </div>

        <Link
          href="/explore"
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:from-orange-400 hover:to-amber-500 transition-all hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          New Research Project
        </Link>
      </div>

      {savedInvestigations.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
          <FolderGit2 className="h-10 w-10 text-slate-300 mx-auto" />
          <h2 className="text-sm font-bold text-slate-800">No saved projects yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Run an investigation in Explore &amp; AI, then use &quot;Save Investigation&quot; to keep it here.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 border border-emerald-300 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-200 transition-all"
          >
            Start Exploring <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {savedInvestigations.map(project => (
            <div key={project.id} className="v22-card rounded-3xl p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 font-mono">
                    SAVED
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-semibold flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">
                  {project.title}
                </h3>

                {project.description && (
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    &ldquo;{project.description}&rdquo;
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{project.selectedVariable}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{project.mainLocation.name}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/projects/${project.id}`}
                  className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-500 transition-colors"
                >
                  View Project <ArrowRight className="h-3 w-3" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleOpen(project.id, project.mainLocation)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
                >
                  Reopen →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
