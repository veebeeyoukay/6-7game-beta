// supabase/functions/get-referral-stats/index.ts
// Purpose: Return referral stats for dashboard

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Get user's referral code
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      throw new Error('User not found')
    }

    const code = userData.referral_code

    // Get click events
    const { data: clicks, error: clicksError } = await supabase
      .from('referral_events')
      .select('id')
      .eq('referrer_id', user.id)
      .eq('event_type', 'click')

    if (clicksError) {
      console.error('Clicks error:', clicksError)
    }

    // Get signup events
    const { data: signups, error: signupsError } = await supabase
      .from('referral_events')
      .select('id, created_at')
      .eq('referrer_id', user.id)
      .eq('event_type', 'signup_complete')

    if (signupsError) {
      console.error('Signups error:', signupsError)
    }

    // Get unclaimed rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from('referral_rewards')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_claimed', false)

    if (rewardsError) {
      console.error('Rewards error:', rewardsError)
    }

    const clickCount = clicks?.length || 0
    const signupCount = signups?.length || 0
    const conversionRate = clickCount > 0 ? (signupCount / clickCount * 100).toFixed(1) : '0.0'

    return new Response(
      JSON.stringify({
        code,
        shareUrl: `https://the67game.com/?ref=${code}`,
        stats: {
          clicks: clickCount,
          signups: signupCount,
          conversionRate: parseFloat(conversionRate),
          totalMollarsEarned: signupCount * 50
        },
        unclaimedRewards: rewards || [],
        recentSignups: signups?.slice(0, 5) || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
