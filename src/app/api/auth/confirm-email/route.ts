// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — EMAIL CONFIRMATION BYPASS
// ==============================================================================
// The product requirement is that no email confirmation is ever required: an
// account created with name + password should be usable immediately.
//
// Accounts created before that rule existed (or created while the service role
// was temporarily unavailable) can still be sitting in Supabase's unconfirmed
// state, which makes sign-in fail with "Email not confirmed". This route
// confirms such an account on demand with the service role, after which the
// browser retries the normal password sign-in.
//
// It never creates users and never changes passwords or emails.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email || '').trim().toLowerCase();

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: 'Enter an email in the format name@example.com.' },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json(
        {
          error:
            'Automatic confirmation is not configured on this deployment. Set SUPABASE_SERVICE_ROLE_KEY.',
        },
        { status: 501 }
      );
    }

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Look the account up by email. Supabase's admin JS SDK has no direct
    // email lookup, so page through the user list.
    let match: { id: string; email?: string; email_confirmed_at?: string | null } | null = null;
    for (let page = 1; page <= 20 && !match; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 502 });
      }
      const users = data?.users || [];
      match = users.find(u => (u.email || '').toLowerCase() === email) || null;
      if (users.length < 1000) break;
    }

    if (!match) {
      // Nothing to confirm. The caller reports the normal "no account" error.
      return NextResponse.json({ exists: false, confirmed: false }, { status: 404 });
    }

    if (match.email_confirmed_at) {
      return NextResponse.json({ exists: true, confirmed: true, alreadyConfirmed: true });
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(match.id, {
      email_confirm: true,
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 502 });
    }

    return NextResponse.json({ exists: true, confirmed: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Automatic confirmation failed.' },
      { status: 500 }
    );
  }
}
