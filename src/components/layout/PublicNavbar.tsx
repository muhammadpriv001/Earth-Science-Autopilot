'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Sparkles, LogIn, ArrowRight, Layers, Globe2, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthAndInvestigationContext';

export function PublicNavbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-500/25 bg-[#06211b]/90 px-3 py-3 shadow-[0_12px_36px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all sm:px-8 sm:py-3.5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:gap-4">
        {/* BRAND & LOGO (Inspired by Dashboard V22 Neomorphic Capsule) */}
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-200">
            <span className="font-mono text-base font-black text-slate-950 tracking-tighter">
              //
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-1.5">
              SPACEGEOAI
              <span className="rounded-md bg-emerald-400/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 font-mono">
                PORTAL
              </span>
            </span>
            <span className="text-[10px] text-emerald-300/80 font-mono">The Earth Science Autopilot</span>
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="hidden items-center gap-5 text-xs font-semibold text-slate-200 md:flex lg:gap-7">
          <a href="/#vision" className="hover:text-emerald-300 transition-colors">
            Mission &amp; Vision
          </a>
          <a href="/#domains" className="hover:text-emerald-300 transition-colors">
            11 Earth Domains
          </a>
          <a href="/#science" className="hover:text-emerald-300 transition-colors">
            Scientific Engine
          </a>
          <Link href={user ? "/resources" : "/auth/sign-in"} className="hover:text-emerald-300 transition-colors">
            Data Catalog
          </Link>
          <Link href={user ? "/dashboard" : "/auth/sign-in"} className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
            <Compass className="h-3.5 w-3.5" />
            Live Portal
          </Link>
        </nav>

        {/* RIGHT: AUTH & PORTAL ACCESS BUTTONS */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-300 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-400/25 hover:scale-[1.02] transition-all"
            >
              <Compass className="h-4 w-4" />
              <span>Go to Portal ({user.name.split(' ')[0]})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="flex items-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-[#092b23]/80 hover:bg-[#0c382e] px-4 py-2 text-xs font-semibold text-emerald-200 hover:text-white transition-colors"
              >
                <LogIn className="h-3.5 w-3.5 text-emerald-400" />
                <span>Sign In</span>
              </Link>

              {/* Warm Peach/Orange Accent Button (as in Dashboard V22 screenshot) */}
              <Link
                href="/auth/sign-up"
                className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/25 hover:from-orange-400 hover:to-amber-500 hover:scale-[1.02] transition-all"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Create Account</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
