// @ts-nocheck
// Deno Edge Function — runs in Supabase's Deno runtime, not Node.js.
// VS Code TypeScript errors here are expected false positives (Deno globals, esm.sh imports).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    // ── 1. Get caller's identity from their JWT ──
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user: caller }, error: authErr } = await supabaseUser.auth.getUser()
    if (authErr || !caller) throw new Error('Unauthorized — invalid token')

    // ── 2. Verify caller role is admin or dept_head ──
    const { data: profile, error: profileErr } = await supabaseUser
      .from('users')
      .select('role')
      .eq('id', caller.id)   // <-- MUST scope to caller's own row
      .single()

    if (profileErr || !profile) throw new Error('Unauthorized — profile not found')
    if (!['admin', 'dept_head'].includes(profile.role)) {
      throw new Error('Insufficient permissions')
    }

    // ── 2. Get the target userId from request body ──
    const { userId } = await req.json()
    if (!userId) throw new Error('userId is required')

    // ── 3. Delete from auth.users using service role key ──
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteErr) throw deleteErr

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
