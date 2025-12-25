#!/bin/bash

# setup_backend.sh

echo "🚀 Starting Supabase Setup..."

# 1. Login to Supabase (Interactive)
if ! npx supabase projects list > /dev/null 2>&1; then
    echo "⚠️  You are not logged in. Please log in when prompted."
    npx supabase login
fi

# 2. Link Project
echo "🔗 Linking to project 'The 6-7 Game' (nxdcttkyegnwnjnnjjqg)..."
npx supabase link --project-ref nxdcttkyegnwnjnnjjqg

# 3. Push Database Schema
echo "🗄️  Pushing database schema..."
npx supabase db push

# 4. Set Secrets
echo "🔑 Setting secrets..."
# 3. Set OpenAI/Anthropic Key (if needed for Edge Functions)
supabase secrets set ANTHROPIC_API_KEY="your_api_key_here"

# 5. Deploy Edge Functions
echo "⚡ Deploying Edge Functions..."
npx supabase functions deploy generate-question --no-verify-jwt
npx supabase functions deploy validate-pairing-code --no-verify-jwt
npx supabase functions deploy generate-battle --no-verify-jwt
npx supabase functions deploy process-answer --no-verify-jwt
npx supabase functions deploy get-child-progress --no-verify-jwt
npx supabase functions deploy preview-questions --no-verify-jwt

echo "✅ Backend setup complete!"
