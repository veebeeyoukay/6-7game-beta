// supabase/functions/waitlist-signup/index.ts
// Purpose: Website waitlist signup with priority scoring

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

    const {
      email,
      firstName,
      childAges,
      state,
      zipCode,
      referralCode,
      utmSource,
      utmMedium,
      utmCampaign
    } = await req.json()

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email address')
    }

    // Calculate priority score
    let priorityScore = 0
    if (state === 'FL') priorityScore += 20
    if (referralCode) priorityScore += 10
    if (childAges && childAges.length > 0) priorityScore += 5

    // Check for duplicate
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .single()

    if (existing && existing.status === 'active') {
      return new Response(
        JSON.stringify({ error: 'Email already on waitlist' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert or update
    const { data, error } = await supabase
      .from('waitlist')
      .upsert({
        email: email.toLowerCase(),
        first_name: firstName,
        child_ages: childAges || [],
        state,
        zip_code: zipCode,
        referral_code: referralCode,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        priority_score: priorityScore,
        status: 'active'
      }, { onConflict: 'email' })
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      throw new Error('Failed to add to waitlist')
    }

    // Trigger n8n webhook for welcome email
    const n8nWebhook = Deno.env.get('N8N_WAITLIST_WEBHOOK')
    if (n8nWebhook) {
      try {
        await fetch(n8nWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.toLowerCase(),
            firstName,
            state,
            priorityScore
          })
        })
      } catch (webhookError) {
        console.error('Webhook error:', webhookError)
        // Don't fail the request if webhook fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        priorityScore,
        message: state === 'FL'
          ? 'Florida resident - priority access!'
          : 'Successfully joined waitlist',
        position: priorityScore // Could calculate actual position in future
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
