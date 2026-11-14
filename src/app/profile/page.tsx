'use client';

import React, { useState } from 'react';
import { useAuth, SavedInvestigation } from '@/context/AuthAndInvestigationContext';
import { useLocation } from '@/context/LocationContext';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  FolderOpen,
  Settings,
  LogOut,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
  Sparkles,
  ShieldAlert,
  Check,
  Edit3,
  Download,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';

  const { user, updateProfile, signOut, deleteAccount, savedInvestigations, loadInvestigation, deleteInvestigation } = useAuth();
  const { setAsMainLocation, setAsSecondaryLocation } = useLocation();

  const [activeTab, setActiveTab] = useState<'profile' | 'investigations' | 'security'>(
    initialTab === 'investigations' ? 'investigations' : 'profile'
  );

  // Edit profile state initialized from current authenticated user
  const [name, setName] = useState(user?.name || '');
  const [affiliation, setAffiliation] = useState(user?.affiliation || '');
  const [role, setRole] = useState(user?.role || '');
  const [savedMsg, setSavedMsg] = useState('');

  // Keep form fields synced if user profile loads asynchronously
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAffiliation(user.affiliation || '');
      setRole(user.role || '');
    }
  }, [user]);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, affiliation, role });
    setSavedMsg('Profile successfully updated!');
    setTimeout(() => setSavedMsg(''), 2500);
  };

  const handleReopenInvestigation = (inv: SavedInvestigation) => {
    loadInvestigation(inv.id);
    setAsMainLocation(inv.mainLocation.name, inv.mainLocation.coordinates, inv.mainLocation.radiusKm);
    if (inv.secondaryLocation) {
      setAsSecondaryLocation(inv.secondaryLocation.name, inv.secondaryLocation.coordinates, inv.secondaryLocation.radiusKm);
    }
    router.push('/explore');
  };

  const handleExportInvestigation = (inv: SavedInvestigation) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(inv, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${inv.title.replace(/\s+/g, '_')}_snapshot.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* User Header Profile Card: Dashboard V22 Deep Pine Green Card */}
      <div className="rounded-3xl border border-emerald-900/40 bg-gradient-to-r from-[#06211b] via-[#07241e] to-[#0a2e26] p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-16 w-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-lg shadow-emerald-500/20"
            />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-xl font-black text-emerald-300">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              {user?.name || 'Guest Researcher'}
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-0.5 text-xs font-bold text-emerald-300">
                {user ? 'Verified Detective' : 'Guest Mode'}
              </span>
            </h1>
            <p className="text-xs text-emerald-100/80 mt-0.5">{user?.email || 'Not signed in — local session active'}</p>
            <div className="text-[11px] font-mono text-emerald-400 font-semibold mt-1">
              {user?.affiliation || 'Sign in to sync investigations to Supabase cloud'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/explore"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-xl shadow-orange-500/25 hover:from-orange-400 hover:to-amber-500 hover:scale-[1.02] active:scale-98 transition-all"
          >
            <Plus className="h-4 w-4" />
            New Investigation
          </Link>
          {user ? (
            <button
              onClick={async () => {
                await signOut();
                router.push('/');
              }}
              className="flex items-center gap-1.5 rounded-2xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/50 px-4 py-2.5 text-xs font-bold text-rose-300 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          ) : (
            <Link
              href="/auth/sign-in"
              className="flex items-center gap-1.5 rounded-2xl border border-emerald-400/40 bg-emerald-950/40 hover:bg-emerald-900/50 px-4 py-2.5 text-xs font-bold text-emerald-300 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
              : 'border border-slate-200/80 bg-white/90 text-slate-600 hover:text-slate-900 shadow-sm'
          }`}
        >
          <User className="h-4 w-4" />
          Researcher Profile
        </button>
        <button
          onClick={() => setActiveTab('investigations')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'investigations'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
              : 'border border-slate-200/80 bg-white/90 text-slate-600 hover:text-slate-900 shadow-sm'
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          Saved Investigations ({savedInvestigations.length})
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'security'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'border border-slate-200/80 bg-white/90 text-slate-600 hover:text-slate-900 shadow-sm'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          Security &amp; Danger Zone
        </button>
      </div>

      {/* TAB 1: RESEARCHER PROFILE SETTINGS (White Neomorphic Card) */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 sm:p-8 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-emerald-600" />
            Edit Research Credentials &amp; Metadata
          </h2>

          {savedMsg && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              {savedMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-2.5 text-xs font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Primary Email</label>
              <input
                type="email"
                disabled
                value={user?.email || 'Not authenticated (Sign in to link email)'}
                className="w-full rounded-2xl border border-slate-200 bg-slate-100/60 px-4 py-2.5 text-xs font-medium text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Institutional Affiliation</label>
              <input
                type="text"
                value={affiliation}
                onChange={e => setAffiliation(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-2.5 text-xs font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Earth-Science Role</label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-2.5 text-xs font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/25 hover:from-orange-400 hover:to-amber-500 hover:scale-[1.02] active:scale-98 transition-all"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SAVED INVESTIGATIONS MANAGER */}
      {activeTab === 'investigations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-amber-500" />
              Your Saved Research Investigations ({savedInvestigations.length})
            </h2>
            <span className="text-xs text-slate-500">
              Clicking &quot;Reopen&quot; restores the location, secondary comparison, charts, and chat state.
            </span>
          </div>

          {savedInvestigations.length === 0 ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-10 text-center space-y-3 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)]">
              <FolderOpen className="h-10 w-10 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-800">No saved investigations yet</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Explore any location on the map, formulate research questions with the AI Autopilot, and click &quot;Save Investigation&quot; in the top bar.
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:from-orange-400 hover:to-amber-500 mt-2"
              >
                Start Your First Investigation →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedInvestigations.map(inv => (
                <div
                  key={inv.id}
                  className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded-lg bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                        {inv.selectedVariable.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Saved: {new Date(inv.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{inv.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {inv.description || inv.notes || 'Geospatial statistical research footprint.'}
                    </p>

                    <div className="rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-3 text-[11px] font-mono space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{inv.mainLocation.name}</span>
                      </div>
                      <div className="text-slate-500 pl-5 text-[10px]">
                        {inv.mainLocation.coordinates[1].toFixed(4)}°N, {inv.mainLocation.coordinates[0].toFixed(4)}°E (Radius: {inv.mainLocation.radiusKm} km)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExportInvestigation(inv)}
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs"
                        title="Export JSON snapshot"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteInvestigation(inv.id)}
                        className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-xs"
                        title="Delete this investigation"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* REOPEN INVESTIGATION BUTTON (Restores everything) */}
                    <button
                      onClick={() => handleReopenInvestigation(inv)}
                      className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 transition-all hover:scale-[1.02]"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Reopen &amp; Continue →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SECURITY & DANGER ZONE */}
      {activeTab === 'security' && (
        <div className="rounded-3xl border border-rose-200/80 bg-white/95 p-6 sm:p-8 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md space-y-4">
          <h2 className="text-base font-bold text-rose-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Account Security &amp; Danger Zone
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            Deleting your account permanently purges your saved investigations, research projects, cached satellite queries, and profile credentials. This action cannot be undone.
          </p>

          <div className="pt-2">
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="rounded-2xl border border-rose-300 bg-rose-50 hover:bg-rose-100 px-5 py-2.5 text-xs font-bold text-rose-700 shadow-sm transition-colors"
            >
              Delete Account &amp; Clear All Saved Projects
            </button>
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-slate-900">Permanently Delete Account?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              To confirm deletion, type <strong className="text-rose-600 font-mono">DELETE</strong> in the box below:
            </p>
            <input
              type="text"
              value={confirmDeleteText}
              onChange={e => setConfirmDeleteText(e.target.value)}
              placeholder="DELETE"
              className="w-full rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-2.5 text-xs font-semibold text-slate-900 focus:border-rose-500 focus:outline-none font-mono"
            />
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={confirmDeleteText !== 'DELETE'}
                onClick={() => {
                  deleteAccount();
                  setDeleteModalOpen(false);
                  router.push('/');
                }}
                className="rounded-2xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-40 shadow-sm"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-mono">Loading researcher credentials...</div>}>
      <ProfileContent />
    </React.Suspense>
  );
}
