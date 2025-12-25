// supabase/functions/preview-questions/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Anthropic from "npm:@anthropic-ai/sdk"

const anthropic = new Anthropic({
    apiKey: Deno.env.get('ANTHROPIC_API_KEY')
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { state = 'FL', grade = 4, subject = 'math', count = 3 } = await req.json()

        console.log(`Generating preview questions for ${state} Grade ${grade} ${subject}`)

        const systemPrompt = `You are an expert curriculum designer for K-12 education, specifically aligned to ${state} state standards (e.g. B.E.S.T. for Florida).
Your goal is to generate "Preview Mode" questions that validate the system's understanding of specific learning standards.
Always return valid JSON.`

        const userPrompt = `Generate ${count} multiple-choice questions for a Grade ${grade} student in ${subject}.

CRITICAL REQUIREMENTS:
1. Use specific ${state} standard codes (e.g., "MA.4.NSO.2.2"). Do NOT use generic Common Core unless specified.
2. Ensure questions are age-appropriate.
3. Provide 4 options (1 correct, 3 plausible distractors).
4. Return ONLY a JSON array.

Output format:
[
  {
    "question_text": "...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correct_answer": "A",
    "standard_code": "MA.4.NSO.1.1",
    "standard_description": "...",
    "difficulty": "medium"
  }
]`

        const msg = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1500,
            system: systemPrompt,
            messages: [
                { role: "user", content: userPrompt }
            ]
        })

        const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
        // Sanitize and parse JSON
        const jsonStr = text.replace(/```json|```/g, '').trim()
        let questions

        try {
            questions = JSON.parse(jsonStr)
        } catch (e) {
            console.error("Failed to parse JSON from Claude:", text)
            throw new Error("Invalid JSON response from AI")
        }

        return new Response(JSON.stringify({
            success: true,
            meta: { state, grade, subject, count },
            questions
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })

    } catch (error) {
        console.error("Error in preview-questions:", error)
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
    }
})
