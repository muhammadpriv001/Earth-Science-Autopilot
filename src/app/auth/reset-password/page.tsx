'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthAndInvestigationContext';
import { useRouter } from 'next/navigation';
import { Key, Mail, ArrowRight, Sparkles, Check, User } from 'lucide-react';
import { useRouter as useRL } from 'next/navigation';

interface ResetPasswordForm {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Extract token from URL query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    // Store token in a data attribute on the form for submission
    if (formRef.current) {
      formRef.current.dataset.token = token || '';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setMessage('Please enter both password and confirmation.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      // Use the admin API to update the user password with the reset token
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          password,
          token: formRef.current?.dataset?.token || '' 
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Failed to reset password.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setMessage('Your password has been reset. You can now sign in.');
      // Clear form after a delay
      setTimeout(() => {
        router.replace('/auth/sign-in');
      }, 3000);
    } catch (err) {
      setMessage('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center px-3 py-10 sm:px-4 sm:py-12">
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
          <h1 className="text-2xl font-black text-white tracking-tight">Reset Password</h1>
          <p className="text-xs text-emerald-200/70">Enter your new password to regain access to your account</p>
        </div>

        {success ? (
          <div className="flex items-center justify-center p-4">
            <Check className="h-6 w-6 text-emerald-400" />
            <span className="text-xl font-bold text-emerald-300">Password reset successful</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-emerald-100/80 block mb-1">Email address</label>
              <div className="flex items-center rounded-2xl border border-emerald-700/50 bg-[#0b2b23] px-3.5 py-2.5 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400/30">
                <Mail className="h-4 w-4 text-emerald-400 mr-2 shrink-0" />
                <input
                  type="email"
                  required
                  autoComplete="current-password"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="researcher@spacegeoai.com"
                  className="w-full bg-transparent text-xs text-white placeholder-emerald-200/30 focus:outline-none"
                />
                <p className="mt-1 text-[10px] text-emerald-300/60">
                  Format check only — no email verification is performed.
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-emerald-100/80 block mb-1">New password</label>
              <div className="flex items-center rounded-2xl border border-emerald-700/50 bg-[#0b2b23] px-3.5 py-2.5 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400/30">
                <Key className="h-4 w-4 text-emerald-400 mr-2 shrink-0" />
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-xs text-white placeholder-emerald-200/30 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-emerald-100/80 block mb-1">Confirm password</label>
              <div className="flex items-center rounded-2xl border border-emerald-700/50 bg-[#0b2b23] px-3.5 py-2.5 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400/30">
                <Key className="h-4 w-4 text-emerald-400 mr-2 shrink-0" />
                <input
                  type="password"
                  required
                  autoComplete="confirm-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-xs text-white placeholder-emerald-200/30 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/25 hover:from-orange-400 hover:to-amber-500 hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-60"
            >
              {loading ? 'Updating...' : 'Reset Password'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <div className="text-center text-xs text-emerald-200/70">
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="font-bold text-emerald-300 hover:text-white hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
}