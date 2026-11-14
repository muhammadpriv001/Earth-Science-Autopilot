// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — REGISTRATION ROUTE
// ==============================================================================
// Creates accounts with the Supabase service role and marks the email as
// confirmed immediately. This deliberately bypasses Supabase's confirmation
// email flow, so registration cannot hit the email rate limit and no inbox
// round trip is required.
//
// The client signs in with email/password afterwards to obtain a normal session.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json(
        {
          error:
            'Account creation is not configured on this deployment. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
        },
        { status: 501 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: 'Enter an email in the format name@example.com.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // email_confirm: true creates an already-verified account without sending
    // any confirmation message, which is what avoids the rate limit.
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

    if (error) {
      const message = error.message || 'Account creation failed.';
      const alreadyExists = /already|registered|exists/i.test(message);

      // An account may exist from an earlier attempt and still be unconfirmed.
      // Confirming it here means the follow-up sign-in succeeds instead of
      // returning "Email not confirmed".
      if (alreadyExists) {
        let existing: { id: string; email_confirmed_at?: string | null } | null = null;
        for (let page = 1; page <= 20 && !existing; page++) {
          const { data: listed } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
          const users = listed?.users || [];
          existing = users.find(u => (u.email || '').toLowerCase() === email) || null;
          if (users.length < 1000) break;
        }
        if (existing && !existing.email_confirmed_at) {
          await admin.auth.admin.updateUserById(existing.id, { email_confirm: true });
        }
      }

      return NextResponse.json(
        {
          error: alreadyExists
            ? 'An account with this email already exists and needs no email verification. Please sign in with your password.'
            : message,
        },
        { status: alreadyExists ? 409 : 400 }
      );
    }

    // Ensure the profile row exists even if the client-side upsert is blocked.
    if (data.user) {
      const { error: profileError } = await admin.from('profiles').upsert({
        id: data.user.id,
        full_name: name,
        institution: 'SpaceGeoAI Research Community',
        updated_at: new Date().toISOString(),
      });
      if (profileError) {
        console.warn('Profile row creation deferred:', profileError.message);
      }
    }

    return NextResponse.json({ success: true, userId: data.user?.id });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Account creation failed.' },
      { status: 500 }
    );
  }
}
