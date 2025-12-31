// supabase/functions/process-referral-signup/index.ts
// Purpose: Award Mollars when referred user completes onboarding

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, referralCode } = await req.json()

    if (!userId || !referralCode) {
      throw new Error('userId and referralCode are required')
    }

    // 1. Find referrer
    const { data: referrer, error: refError } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', referralCode.toUpperCase())
      .single()

    if (refError || !referrer) {
      return new Response(
        JSON.stringify({ error: 'Invalid referral code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Prevent self-referral
    if (referrer.id === userId) {
      return new Response(
        JSON.stringify({ error: 'Cannot refer yourself' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Update referee's referred_by_code
    const { error: updateError } = await supabase
      .from('users')
      .update({ referred_by_code: referralCode.toUpperCase() })
      .eq('id', userId)

    if (updateError) {
      console.error('Update error:', updateError)
    }

    // 4. Award 50 Mollars to each of referrer's children
    const { data: referrerFamily } = await supabase
      .from('families')
      .select('id')
      .eq('created_by', referrer.id)
      .single()

    if (referrerFamily) {
      const { data: children } = await supabase
        .from('children')
        .select('id, mollars_balance')
        .eq('family_id', referrerFamily.id)

      if (children && children.length > 0) {
        for (const child of children) {
          // Update balance
          await supabase
            .from('children')
            .update({ mollars_balance: child.mollars_balance + 50 })
            .eq('id', child.id)

          // Record transaction
          await supabase
            .from('mollar_transactions')
            .insert({
              child_id: child.id,
              amount: 50,
              reason: 'referral_bonus'
            })
        }
      }
    }

    // 5. Create reward record
    const { error: rewardError } = await supabase
      .from('referral_rewards')
      .insert({
        user_id: referrer.id,
        reward_type: 'signup_bonus',
        amount: 50,
        description: `Referral signup completed`,
        is_claimed: true,
        claimed_at: new Date().toISOString()
      })

    if (rewardError) {
      console.error('Reward insert error:', rewardError)
    }

    // 6. Record event
    await supabase
      .from('referral_events')
      .insert({
        referrer_id: referrer.id,
        referee_id: userId,
        event_type: 'signup_complete',
        mollars_awarded: 50
      })

    return new Response(
      JSON.stringify({
        success: true,
        mollarsAwarded: 50,
        referrerId: referrer.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
