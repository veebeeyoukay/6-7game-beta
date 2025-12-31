# 6-7 Game: Corrected Implementation Plan
**Reality-Based | Path-Corrected | Gap-Focused**

**Project Path:** `/Users/vikasbhatia/dev-mm4/6-7game-app/`
**Generated:** 2025-12-31
**Based On:** Ralph plan v2.0 + current codebase audit

---

## 🎯 SCOPE: Only Missing Components

This plan **only includes work that is NOT yet complete**. See `gap-analysis.md` for what already exists.

**Total Remaining Tasks: 12** (down from Ralph's 30)

---

## PHASE 1: DATABASE COMPLETION (2 Tasks)

### TASK-DB-1: Preview & Waitlist Tables ⭐ HIGH PRIORITY

**File:** `supabase/migrations/20251231000000_preview_waitlist.sql`

```sql
-- Preview Sessions (for question generation tracking)
CREATE TABLE IF NOT EXISTS preview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  grade INTEGER NOT NULL CHECK (grade BETWEEN 2 AND 5),
  subject VARCHAR(20) DEFAULT 'math',
  questions_generated INTEGER DEFAULT 0,
  questions_viewed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preview Questions (with rating capability)
CREATE TABLE IF NOT EXISTS preview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES preview_sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer VARCHAR(1) NOT NULL,
  standard_code VARCHAR(20),
  standard_description TEXT,
  difficulty VARCHAR(10),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_flagged BOOLEAN DEFAULT false,
  flagged_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Website Waitlist
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  child_ages INTEGER[] DEFAULT '{}',
  state VARCHAR(2),
  zip_code VARCHAR(10),
  referral_code VARCHAR(12),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  priority_score INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  invited_at TIMESTAMPTZ,
  signed_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE preview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE preview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Users can view their own preview sessions
CREATE POLICY "Users manage preview sessions" ON preview_sessions
  USING (user_id = auth.uid());

-- Users can view their session questions
CREATE POLICY "Users view session questions" ON preview_questions
  USING (EXISTS (
    SELECT 1 FROM preview_sessions
    WHERE preview_sessions.id = preview_questions.session_id
    AND preview_sessions.user_id = auth.uid()
  ));

-- Public can insert to waitlist (for website)
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX idx_preview_sessions_user ON preview_sessions(user_id);
CREATE INDEX idx_preview_questions_session ON preview_questions(session_id);
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_status ON waitlist(status);
CREATE INDEX idx_waitlist_priority ON waitlist(priority_score DESC);
```

**Deployment:**
```bash
cd /Users/vikasbhatia/dev-mm4/6-7game-app
npx supabase db push
```

---

### TASK-DB-2: Referral Rewards Table ⭐ MEDIUM PRIORITY

**File:** `supabase/migrations/20251231000001_referral_rewards.sql`

```sql
-- Referral Rewards (separate from events for unclaimed tracking)
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reward_type VARCHAR(30) NOT NULL, -- signup_bonus, milestone_bonus, etc
  amount INTEGER DEFAULT 50,
  description TEXT,
  is_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own rewards" ON referral_rewards
  USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_referral_rewards_user ON referral_rewards(user_id);
CREATE INDEX idx_referral_rewards_unclaimed ON referral_rewards(user_id, is_claimed)
  WHERE is_claimed = false;
```

**Deployment:**
```bash
cd /Users/vikasbhatia/dev-mm4/6-7game-app
npx supabase db push
```

---

## PHASE 2: EDGE FUNCTIONS (4 Tasks)

### TASK-FUNC-1: request-validation ⭐ HIGH PRIORITY

**File:** `supabase/functions/request-validation/index.ts`

**Purpose:** Child requests validation from Watch app → notifies parents

```typescript
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
        family_id: child.family_id,
        photo_url: photoUrl,
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single()

    if (insertError) throw insertError

    // 4. Trigger n8n webhook for parent notification
    const n8nWebhook = Deno.env.get('N8N_VALIDATION_WEBHOOK')
    if (n8nWebhook) {
      await fetch(n8nWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          familyId: child.family_id,
          childName: child.first_name,
          taskName: task.name,
          mollarsReward: task.mollars_reward,
          photoUrl: photoUrl
        })
      })
    }

    return new Response(
      JSON.stringify({ success: true, requestId: request.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
```

**Deployment:**
```bash
cd /Users/vikasbhatia/dev-mm4/6-7game-app
npx supabase functions deploy request-validation
```

---

### TASK-FUNC-2: process-referral-signup ⭐ MEDIUM PRIORITY

**File:** `supabase/functions/process-referral-signup/index.ts`

**Purpose:** Award Mollars when referred user completes onboarding

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, referralCode } = await req.json()

    // 1. Find referrer
    const { data: referrer, error: refError } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', referralCode)
      .single()

    if (refError || !referrer) {
      return new Response(JSON.stringify({ error: 'Invalid referral code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 2. Prevent self-referral
    if (referrer.id === userId) {
      return new Response(JSON.stringify({ error: 'Cannot refer yourself' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 3. Update referee's referred_by_code
    await supabase
      .from('users')
      .update({ referred_by_code: referralCode })
      .eq('id', userId)

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
    await supabase
      .from('referral_rewards')
      .insert({
        user_id: referrer.id,
        reward_type: 'signup_bonus',
        amount: 50,
        description: `Referral signup completed`,
        is_claimed: true,
        claimed_at: new Date().toISOString()
      })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

**Deployment:**
```bash
npx supabase functions deploy process-referral-signup
```

---

### TASK-FUNC-3: get-referral-stats ⭐ MEDIUM PRIORITY

**File:** `supabase/functions/get-referral-stats/index.ts`

**Purpose:** Return referral stats for dashboard

```typescript
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
    if (!authHeader) throw new Error('Missing authorization header')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    // Get user's referral code
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', user.id)
      .single()

    if (userError || !userData) throw new Error('User not found')

    const code = userData.referral_code

    // Get click events
    const { data: clicks } = await supabase
      .from('referral_events')
      .select('id')
      .eq('referrer_id', user.id)
      .eq('event_type', 'click')

    // Get signup events
    const { data: signups } = await supabase
      .from('referral_events')
      .select('id, created_at')
      .eq('referrer_id', user.id)
      .eq('event_type', 'signup_complete')

    // Get unclaimed rewards
    const { data: rewards } = await supabase
      .from('referral_rewards')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_claimed', false)

    const clickCount = clicks?.length || 0
    const signupCount = signups?.length || 0
    const conversionRate = clickCount > 0 ? (signupCount / clickCount * 100).toFixed(1) : '0.0'

    return new Response(JSON.stringify({
      code,
      shareUrl: `https://the67game.com/?ref=${code}`,
      stats: {
        clicks: clickCount,
        signups: signupCount,
        conversionRate: parseFloat(conversionRate),
        totalMollarsEarned: signupCount * 50
      },
      unclaimedRewards: rewards || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
```

**Deployment:**
```bash
npx supabase functions deploy get-referral-stats
```

---

### TASK-FUNC-4: waitlist-signup ⭐ HIGH PRIORITY

**File:** `supabase/functions/waitlist-signup/index.ts`

**Purpose:** Website waitlist signup with priority scoring

```typescript
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

    if (error) throw error

    // Trigger n8n webhook for welcome email
    const n8nWebhook = Deno.env.get('N8N_WAITLIST_WEBHOOK')
    if (n8nWebhook) {
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
    }

    return new Response(
      JSON.stringify({
        success: true,
        priorityScore,
        message: state === 'FL' ? 'Florida resident - priority access!' : 'Successfully joined waitlist'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

**Deployment:**
```bash
npx supabase functions deploy waitlist-signup
```

---

## PHASE 3: N8N AUTOMATION (3 Tasks)

### TASK-N8N-1: Waitlist Welcome Workflow

**File:** `n8n-workflows/README.md`

```markdown
# n8n Workflows for 6-7 Game

## Setup

1. Create n8n account (cloud or self-hosted)
2. Install SendGrid credential
3. Install Slack credential (optional)
4. Import workflow JSON files

## Environment Variables Needed

Add to Supabase Edge Function secrets:
```bash
N8N_WAITLIST_WEBHOOK=https://your-n8n-instance.com/webhook/waitlist-welcome
N8N_VALIDATION_WEBHOOK=https://your-n8n-instance.com/webhook/validation-request
```

## Workflows

1. **waitlist-welcome.json** - Welcome email + Slack notification
2. **validation-notification.json** - Parent notification for validation requests
3. **daily-summary.json** - 7pm daily Mollar summary

## Testing

Use webhook URLs in Postman to test before integrating with Edge Functions.
```

**File:** `n8n-workflows/waitlist-welcome.json`

```json
{
  "name": "Waitlist Welcome",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "waitlist-welcome",
        "responseMode": "responseNode",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json[\"email\"]}}",
              "operation": "isNotEmpty"
            }
          ]
        }
      },
      "name": "Has Email",
      "type": "n8n-nodes-base.if",
      "position": [450, 300]
    },
    {
      "parameters": {
        "fromEmail": "welcome@the67game.com",
        "toEmail": "={{$json[\"email\"]}}",
        "subject": "Welcome to The 6-7 Game Waitlist! 🎮📚",
        "emailType": "html",
        "message": "<h1>You're on the list!</h1><p>Hi {{$json[\"firstName\"] || 'there'}},</p><p>Thanks for joining The 6-7 Game waitlist. We'll notify you when we're ready to launch in your area.</p><p><strong>Priority Score: {{$json[\"priorityScore\"]}}</strong></p>{{$json[\"state\"] === 'FL' ? '<p>🎉 Florida resident bonus - you're near the front of the line!</p>' : ''}}<p>Stay tuned!<br>The 6-7 Game Team</p>"
      },
      "name": "SendGrid",
      "type": "n8n-nodes-base.sendGrid",
      "position": [650, 200]
    },
    {
      "parameters": {
        "channel": "#waitlist-signups",
        "text": "New waitlist signup: {{$json[\"email\"]}} ({{$json[\"state\"]}}) - Priority: {{$json[\"priorityScore\"]}}",
        "otherOptions": {}
      },
      "name": "Slack",
      "type": "n8n-nodes-base.slack",
      "position": [650, 400]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={\"success\": true}"
      },
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [850, 300]
    }
  ],
  "connections": {
    "Webhook": { "main": [[{ "node": "Has Email", "type": "main", "index": 0 }]] },
    "Has Email": {
      "main": [
        [
          { "node": "SendGrid", "type": "main", "index": 0 },
          { "node": "Slack", "type": "main", "index": 0 }
        ]
      ]
    },
    "SendGrid": { "main": [[{ "node": "Respond", "type": "main", "index": 0 }]] },
    "Slack": { "main": [[{ "node": "Respond", "type": "main", "index": 0 }]] }
  }
}
```

---

### TASK-N8N-2: Validation Notification Workflow

**File:** `n8n-workflows/validation-notification.json`

```json
{
  "name": "Validation Request Notification",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "validation-request",
        "responseMode": "responseNode"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT u.email, u.first_name FROM users u JOIN family_members fm ON u.id = fm.user_id WHERE fm.family_id = '{{$json[\"familyId\"]}}' AND fm.role = 'adult'"
      },
      "name": "Get Family Adults",
      "type": "n8n-nodes-base.postgres",
      "position": [450, 300]
    },
    {
      "parameters": {
        "batchSize": 1,
        "options": {}
      },
      "name": "Loop Parents",
      "type": "n8n-nodes-base.splitInBatches",
      "position": [650, 300]
    },
    {
      "parameters": {
        "fromEmail": "notifications@the67game.com",
        "toEmail": "={{$json[\"email\"]}}",
        "subject": "{{$node[\"Webhook\"].json[\"childName\"]}} needs validation! 🌟",
        "emailType": "html",
        "message": "<h2>Validation Request</h2><p>Hi {{$json[\"first_name\"]}},</p><p><strong>{{$node[\"Webhook\"].json[\"childName\"]}}</strong> completed:</p><h3>{{$node[\"Webhook\"].json[\"taskName\"]}}</h3><p>Reward: <strong>{{$node[\"Webhook\"].json[\"mollarsReward\"]}} Mollars</strong></p><p>Open the app to approve or deny this request.</p>{{$node[\"Webhook\"].json[\"photoUrl\"] ? '<p><img src=\"' + $node[\"Webhook\"].json[\"photoUrl\"] + '\" style=\"max-width: 400px;\"></p>' : ''}}"
      },
      "name": "SendGrid",
      "type": "n8n-nodes-base.sendGrid",
      "position": [850, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={\"success\": true, \"notified\": {{$node[\"Get Family Adults\"].json.length}}}"
      },
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1050, 300]
    }
  ],
  "connections": {
    "Webhook": { "main": [[{ "node": "Get Family Adults", "type": "main", "index": 0 }]] },
    "Get Family Adults": { "main": [[{ "node": "Loop Parents", "type": "main", "index": 0 }]] },
    "Loop Parents": { "main": [[{ "node": "SendGrid", "type": "main", "index": 0 }]] },
    "SendGrid": { "main": [[{ "node": "Respond", "type": "main", "index": 0 }]] }
  }
}
```

---

### TASK-N8N-3: Daily Summary Workflow

**File:** `n8n-workflows/daily-summary.json`

```json
{
  "name": "Daily Mollar Summary",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [{ "field": "cronExpression", "expression": "0 19 * * *" }]
        }
      },
      "name": "Schedule - 7pm Daily",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 300]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT u.id, u.email, u.first_name, f.id as family_id FROM users u JOIN families f ON u.id = f.created_by WHERE u.onboarding_completed = true"
      },
      "name": "Get Active Users",
      "type": "n8n-nodes-base.postgres",
      "position": [450, 300]
    },
    {
      "parameters": {
        "batchSize": 1
      },
      "name": "Loop Users",
      "type": "n8n-nodes-base.splitInBatches",
      "position": [650, 300]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT first_name, mollars_balance, current_streak FROM children WHERE family_id = '{{$json[\"family_id\"]}}' ORDER BY first_name"
      },
      "name": "Get Children",
      "type": "n8n-nodes-base.postgres",
      "position": [850, 300]
    },
    {
      "parameters": {
        "functionCode": "const children = $input.all();\nlet summary = '<ul>';\nlet totalMollars = 0;\n\nfor (const child of children) {\n  summary += `<li><strong>${child.json.first_name}</strong>: ${child.json.mollars_balance} Mollars (${child.json.current_streak} day streak)</li>`;\n  totalMollars += child.json.mollars_balance;\n}\n\nsummary += '</ul>';\n\nreturn [{ json: { childrenSummary: summary, totalMollars } }];"
      },
      "name": "Build Summary",
      "type": "n8n-nodes-base.code",
      "position": [1050, 300]
    },
    {
      "parameters": {
        "fromEmail": "daily@the67game.com",
        "toEmail": "={{$node[\"Loop Users\"].json[\"email\"]}}",
        "subject": "Daily 6-7 Game Summary 📊",
        "emailType": "html",
        "message": "<h2>Today's Progress</h2><p>Hi {{$node[\"Loop Users\"].json[\"first_name\"]}},</p><p>Here's how your family is doing:</p>{{$json[\"childrenSummary\"]}}<p><strong>Family Total: {{$json[\"totalMollars\"]}} Mollars</strong></p><p>Keep up the great work!</p>"
      },
      "name": "SendGrid",
      "type": "n8n-nodes-base.sendGrid",
      "position": [1250, 300]
    }
  ],
  "connections": {
    "Schedule - 7pm Daily": { "main": [[{ "node": "Get Active Users", "type": "main", "index": 0 }]] },
    "Get Active Users": { "main": [[{ "node": "Loop Users", "type": "main", "index": 0 }]] },
    "Loop Users": { "main": [[{ "node": "Get Children", "type": "main", "index": 0 }]] },
    "Get Children": { "main": [[{ "node": "Build Summary", "type": "main", "index": 0 }]] },
    "Build Summary": { "main": [[{ "node": "SendGrid", "type": "main", "index": 0 }]] }
  }
}
```

---

## PHASE 4: INFRASTRUCTURE SETUP (2 Tasks)

### TASK-INFRA-1: Set Supabase Secrets

```bash
# Add these to Supabase dashboard under Settings > Edge Functions
N8N_WAITLIST_WEBHOOK=<your-n8n-webhook-url>
N8N_VALIDATION_WEBHOOK=<your-n8n-webhook-url>
```

---

### TASK-INFRA-2: Website Integration ✅

**Decision Made:** Use existing `6-7game-web` repository (separate repo)

**Action Required:** Follow the complete integration guide in `../../6-7game-web/_ai_wk/planning/integration-guide.md`

**What to Integrate:**
- WaitlistForm React component
- Environment variables (Supabase URL + Anon Key)
- Referral link handling (?ref=67-XXXX-XXXX)
- Analytics tracking (Google Analytics, Meta Pixel)

**No work needed in this repo** - all website changes go in `6-7game-web`

---

### TASK-INFRA-3: Update .gitignore

```bash
echo "_ralph_status/" >> .gitignore
echo "n8n-workflows/.env" >> .gitignore
```

---

## DEPLOYMENT CHECKLIST

### Database Migrations
- [ ] Run migration `20251231000000_preview_waitlist.sql`
- [ ] Run migration `20251231000001_referral_rewards.sql`
- [ ] Verify tables created: `preview_sessions`, `preview_questions`, `waitlist`, `referral_rewards`

### Edge Functions
- [ ] Deploy `request-validation`
- [ ] Deploy `process-referral-signup`
- [ ] Deploy `get-referral-stats`
- [ ] Deploy `waitlist-signup`
- [ ] Test each function with Postman

### n8n Workflows
- [ ] Create n8n account/instance
- [ ] Import workflow: `waitlist-welcome.json`
- [ ] Import workflow: `validation-notification.json`
- [ ] Import workflow: `daily-summary.json`
- [ ] Configure SendGrid credentials
- [ ] Configure Slack credentials (optional)
- [ ] Test webhook URLs
- [ ] Add webhook URLs to Supabase secrets

### Environment Variables
- [ ] `N8N_WAITLIST_WEBHOOK` set in Supabase
- [ ] `N8N_VALIDATION_WEBHOOK` set in Supabase
- [ ] SendGrid API key configured in n8n
- [ ] Slack webhook configured in n8n

---

## TESTING GUIDE

### Test Database Migrations
```bash
cd /Users/vikasbhatia/dev-mm4/6-7game-app
npx supabase db push
npx supabase db reset --db-url <your-supabase-url>
```

### Test Edge Functions
```bash
# Test waitlist-signup
curl -X POST https://<project-ref>.supabase.co/functions/v1/waitlist-signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","state":"FL","childAges":[8,10]}'

# Test request-validation
curl -X POST https://<project-ref>.supabase.co/functions/v1/request-validation \
  -H "Content-Type: application/json" \
  -d '{"childId":"<child-uuid>","taskId":"<task-uuid>"}'

# Test get-referral-stats
curl https://<project-ref>.supabase.co/functions/v1/get-referral-stats \
  -H "Authorization: Bearer <user-token>"
```

---

## ESTIMATED EFFORT

| Task | Complexity | Time Estimate |
|------|------------|---------------|
| DB Migrations | Low | 30 mins |
| Edge Functions | Medium | 2-3 hours |
| n8n Workflows | Medium | 2-3 hours |
| Testing & Debugging | High | 2-4 hours |
| **Total** | | **6-10 hours** |

---

## SUCCESS CRITERIA

### Functional Requirements
- ✅ Users can join waitlist from website
- ✅ Parents receive email when child requests validation
- ✅ Referrals award 50 Mollars automatically
- ✅ Dashboard shows referral stats
- ✅ Daily summary emails sent at 7pm

### Technical Requirements
- ✅ All migrations applied successfully
- ✅ All edge functions deployed and tested
- ✅ n8n workflows active and triggering
- ✅ No RLS policy errors
- ✅ All tables have proper indexes

---

## NEXT STEPS AFTER COMPLETION

1. **Website Integration:**
   - Decide: Create `website/` in this repo OR use `6-7game-web`
   - Integrate waitlist form with `waitlist-signup` function

2. **Watch App Integration:**
   - Connect validation request UI to `request-validation` function

3. **Parent App Enhancements:**
   - Add referral stats dashboard using `get-referral-stats`
   - Add validation approval/denial UI

4. **AI Provider Decision:**
   - Keep Google Gemini OR
   - Switch to Anthropic + Learning Commons MCP

---

**Ready to Execute** | All paths corrected | Reality-based 🚀
