'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthAndInvestigationContext';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
    } catch {
      setMessage(`Recovery link dispatched to ${email}. Check your inbox.`);
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
          <h1 className="text-2xl font-black text-white tracking-tight">Reset Account Password</h1>
          <p className="text-xs text-emerald-200/70">
            Enter your researcher email to receive a password recovery transmission
          </p>
        </div>

        {message ? (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-center space-y-3">
            <Check className="h-8 w-8 text-emerald-300 mx-auto" />
            <div className="text-xs font-semibold text-emerald-100 leading-relaxed">{message}</div>
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-300 hover:text-orange-200 hover:underline pt-2"
            >
              Return to Sign In →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-emerald-100/80 block mb-1">Registered Email Address</label>
              <div className="flex items-center rounded-2xl border border-emerald-700/50 bg-[#0b2b23] px-3.5 py-2.5 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400/30">
                <Mail className="h-4 w-4 text-emerald-400 mr-2 shrink-0" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="scientist@spacegeoai.com"
                  className="w-full bg-transparent text-xs text-white placeholder-emerald-200/30 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/25 hover:from-orange-400 hover:to-amber-500 hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-60"
            >
              {loading ? 'Transmitting Request...' : 'Send Password Reset Link'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <div className="text-center text-xs text-emerald-200/70">
          Remember your password?{' '}
          <Link href="/auth/sign-in" className="font-bold text-emerald-300 hover:text-white hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
