# n8n Workflows for 6-7 Game

Automation workflows for The 6-7 Game platform.

---

## 📋 Overview

This directory contains n8n workflow definitions for automating:
1. **Waitlist welcome emails** - Send welcome email when user joins waitlist
2. **Validation notifications** - Notify parents when child requests validation
3. **Daily summaries** - Send daily Mollar summary emails at 7pm

---

## 🚀 Setup Instructions

### 1. Create n8n Instance

**Option A: n8n Cloud (Recommended)**
- Sign up at https://n8n.io/
- Create new workspace
- Skip to step 2

**Option B: Self-Hosted**
```bash
npx n8n
# or
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

### 2. Install Credentials

Navigate to **Settings → Credentials** and add:

**SendGrid API Key:**
- Name: `SendGrid - 6-7 Game`
- API Key: `<your-sendgrid-api-key>`

**Slack Webhook (Optional):**
- Name: `Slack - 6-7 Game`
- Webhook URL: `<your-slack-webhook-url>`

**Supabase (PostgreSQL):**
- Name: `Supabase - 6-7 Game`
- Host: `<your-project>.supabase.co`
- Database: `postgres`
- User: `postgres`
- Password: `<your-supabase-password>`
- Port: `5432`
- SSL: `true`

### 3. Import Workflows

1. Go to **Workflows** in n8n
2. Click **Import from File**
3. Select each JSON file from this directory:
   - `waitlist-welcome.json`
   - `validation-notification.json`
   - `daily-summary.json`
4. Activate each workflow

### 4. Configure Webhook URLs

After importing, each webhook will have a unique URL. Copy these URLs.

**Example webhook URLs:**
```
https://your-n8n-instance.app.n8n.cloud/webhook/waitlist-welcome
https://your-n8n-instance.app.n8n.cloud/webhook/validation-request
```

### 5. Add Webhook URLs to Supabase

Add the webhook URLs as Supabase Edge Function secrets:

1. Go to Supabase Dashboard → **Settings** → **Edge Functions**
2. Add secrets:
   ```
   N8N_WAITLIST_WEBHOOK=https://your-n8n-instance.app.n8n.cloud/webhook/waitlist-welcome
   N8N_VALIDATION_WEBHOOK=https://your-n8n-instance.app.n8n.cloud/webhook/validation-request
   ```

---

## 📊 Workflow Details

### 1. Waitlist Welcome (`waitlist-welcome.json`)

**Trigger:** Webhook POST from `waitlist-signup` Edge Function

**Payload:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "state": "FL",
  "priorityScore": 20
}
```

**Actions:**
1. Validate email exists
2. Send welcome email via SendGrid
3. Post notification to Slack #waitlist-signups channel
4. Respond with success

**SendGrid Template Variables:**
- `{{firstName}}` - First name or "there"
- `{{priorityScore}}` - Priority score
- `{{state}}` - State abbreviation

---

### 2. Validation Notification (`validation-notification.json`)

**Trigger:** Webhook POST from `request-validation` Edge Function

**Payload:**
```json
{
  "requestId": "uuid",
  "familyId": "uuid",
  "childName": "Emma",
  "taskName": "Made bed",
  "mollarsReward": 10,
  "photoUrl": "https://..."
}
```

**Actions:**
1. Query Supabase for family adults (parents)
2. Loop through each parent
3. Send notification email with task details
4. Include photo if provided
5. Respond with count of parents notified

**Email Content:**
- Child name and task
- Mollar reward amount
- Optional photo
- Link to approve/deny in app

---

### 3. Daily Summary (`daily-summary.json`)

**Trigger:** Schedule (cron: `0 19 * * *` = 7pm daily)

**Actions:**
1. Query all users with `onboarding_completed = true`
2. Loop through each user
3. Get children for their family
4. Calculate total Mollars and streaks
5. Send summary email

**Email Content:**
- List of children with Mollars and streaks
- Family total Mollars
- Motivational message

---

## 🧪 Testing Workflows

### Test Waitlist Welcome

```bash
curl -X POST "https://your-n8n-instance.app.n8n.cloud/webhook/waitlist-welcome" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test User",
    "state": "FL",
    "priorityScore": 20
  }'
```

### Test Validation Notification

```bash
curl -X POST "https://your-n8n-instance.app.n8n.cloud/webhook/validation-request" \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "123e4567-e89b-12d3-a456-426614174000",
    "familyId": "123e4567-e89b-12d3-a456-426614174001",
    "childName": "Emma",
    "taskName": "Made bed",
    "mollarsReward": 10
  }'
```

### Test Daily Summary

Manually trigger the workflow in n8n dashboard (click "Execute Workflow")

---

## 📧 Email Templates

### SendGrid Setup

1. Go to SendGrid → **Email API** → **Dynamic Templates**
2. Create templates (or use HTML in workflow)

**Recommended:** Keep HTML in workflow for now, migrate to SendGrid templates later for easier updates.

---

## 🔧 Troubleshooting

### Webhook not triggering
- Check Supabase Edge Function logs for webhook errors
- Verify webhook URL is correct in Supabase secrets
- Test webhook directly with curl

### Emails not sending
- Verify SendGrid API key is valid
- Check SendGrid activity logs
- Ensure sender email is verified in SendGrid

### Database queries failing
- Verify Supabase credentials in n8n
- Check RLS policies allow service role access
- Test query directly in Supabase SQL editor

### Slack notifications not working
- Verify Slack webhook URL is correct
- Test webhook URL directly with curl
- Check Slack app permissions

---

## 📝 Workflow Modifications

### Change email sending time
Edit `daily-summary.json`:
```json
"cronExpression": "0 19 * * *"  // 7pm
// Change to:
"cronExpression": "0 20 * * *"  // 8pm
```

### Add more notification channels
Add new nodes to workflows:
- SMS via Twilio
- Push notifications via OneSignal
- Discord webhooks

### Customize email content
Edit the `message` parameter in SendGrid nodes.

---

## 🔒 Security Notes

- Never commit `.env` files with credentials
- Use n8n credential system (encrypted storage)
- Rotate Supabase service role key if compromised
- Use webhook authentication in production

---

## 📚 Resources

- [n8n Documentation](https://docs.n8n.io/)
- [SendGrid Node Docs](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.sendgrid/)
- [Webhook Node Docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [Schedule Trigger Docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/)

---

**Questions?** Check the main project `README.md` or create an issue.
