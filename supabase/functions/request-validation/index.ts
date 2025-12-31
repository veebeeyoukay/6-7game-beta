// supabase/functions/request-validation/index.ts
// Purpose: Child requests validation from Watch app → notifies parents

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

    const { childId, taskId, photoUrl } = await req.json()

    if (!childId || !taskId) {
      throw new Error('childId and taskId are required')
    }

    // 1. Verify child and task exist
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, family_id, first_name')
      .eq('id', childId)
      .single()

    if (childError || !child) {
      throw new Error('Child not found')
    }

    const { data: task, error: taskError } = await supabase
      .from('validation_tasks')
      .select('id, name, mollars_reward, family_id')
      .eq('id', taskId)
      .eq('family_id', child.family_id)
      .single()

    if (taskError || !task) {
      throw new Error('Task not found or not in family')
    }

    // 2. Check for duplicate pending request
    const { data: existing } = await supabase
      .from('validation_requests')
      .select('id')
      .eq('child_id', childId)
      .eq('task_id', taskId)
      .eq('status', 'pending')
      .single()

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'Pending request already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 3. Create validation request
    const { data: request, error: insertError } = await supabase
      .from('validation_requests')
      .insert({
        task_id: taskId,
        child_id: childId,
        status: 'pending',
        requested_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      throw new Error('Failed to create validation request')
    }

    // 4. Trigger n8n webhook for parent notification
    const n8nWebhook = Deno.env.get('N8N_VALIDATION_WEBHOOK')
    if (n8nWebhook) {
      try {
        await fetch(n8nWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: request.id,
            familyId: child.family_id,
            childName: child.first_name,
            taskName: task.name,
            mollarsReward: task.mollars_reward,
            photoUrl: photoUrl || null
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
        requestId: request.id,
        expiresIn: '24 hours'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
