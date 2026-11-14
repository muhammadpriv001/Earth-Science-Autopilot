// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — ACCOUNT AUTO-CONFIRMATION ROUTE
// ==============================================================================
// Registration should not depend on an email-confirmation round trip. This
// server-only route uses the Supabase service-role key to mark a freshly created
// account as confirmed so the user is signed straight into the portal.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: 'Account auto-confirmation is not configured on this deployment.' },
        { status: 501 }
      );
    }

    if (!userId) {
      return NextResponse.json({ error: 'A userId is required.' }, { status: 400 });
    }

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    if (email) {
      const { data: existing, error: lookupError } = await admin.auth.admin.getUserById(userId);
      if (lookupError || !existing?.user) {
        return NextResponse.json(
          { error: lookupError?.message || 'Account was not found.' },
          { status: 404 }
        );
      }
      if (
        existing.user.email &&
        existing.user.email.toLowerCase() !== String(email).toLowerCase()
      ) {
        return NextResponse.json({ error: 'Email address does not match account.' }, { status: 403 });
      }
    }

    const { error } = await admin.auth.admin.updateUserById(userId, { email_confirm: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Account auto-confirmation failed.' },
      { status: 500 }
    );
  }
}
