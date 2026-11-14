'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Key, Mail, ArrowRight, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthAndInvestigationContext';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await signUp(fullName, email, password);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setErrorMsg(res.error || 'Registration failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-400/35 bg-gradient-to-br from-[#06211b]/95 via-[#07281f]/92 to-[#0a332a]/95 p-8 shadow-2xl shadow-emerald-950/30 backdrop-blur-md ring-1 ring-white/10 space-y-6">
        {/* Emerald → orange accent strip */}
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-orange-400" />
        {/* Subtle ambient glows */}
        <span className="pointer-events-none absolute -top-24 -right-16 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-400 to-emerald-400 text-white shadow-lg shadow-orange-500/25">
            <span className="font-mono text-lg font-black tracking-tighter">//</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create Researcher Account</h1>
          <p className="text-xs text-emerald-200/70">
            Join the spacegeoai.com Earth-System Trend Detective community
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-emerald-100/80 block mb-1">Full Name</label>
            <div className="flex items-center rounded-2xl border border-emerald-700/50 bg-[#0b2b23] px-3.5 py-2.5 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400/30">
              <User className="h-4 w-4 text-emerald-400 mr-2 shrink-0" />
              <input
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Dr. Alexander Wright"
                className="w-full bg-transparent text-xs text-white placeholder-emerald-200/30 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-emerald-100/80 block mb-1">Email Address</label>
            <div className="flex items-center rounded-2xl border border-emerald-700/50 bg-[#0b2b23] px-3.5 py-2.5 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400/30">
              <Mail className="h-4 w-4 text-emerald-400 mr-2 shrink-0" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="a.wright@nasa-spaceapps.org"
                className="w-full bg-transparent text-xs text-white placeholder-emerald-200/30 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-emerald-100/80 block mb-1">Password</label>
            <div className="flex items-center rounded-2xl border border-emerald-700/50 bg-[#0b2b23] px-3.5 py-2.5 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400/30">
              <Key className="h-4 w-4 text-emerald-400 mr-2 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-xs text-white placeholder-emerald-200/30 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-emerald-300/60 hover:text-emerald-100 focus:outline-none shrink-0"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/25 hover:from-orange-400 hover:to-amber-500 hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-60"
          >
            {loading ? 'Creating Account...' : 'Register Researcher Account'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center text-xs text-emerald-200/70">
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="font-bold text-emerald-300 hover:text-white hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
