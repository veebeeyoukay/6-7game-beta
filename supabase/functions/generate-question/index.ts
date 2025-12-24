// supabase/functions/generate-question/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Anthropic from "npm:@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY')
})

serve(async (req) => {
  const { state, grade, subject, difficulty, count, exclude_standards, focus_components } = await req.json()

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: `Generate ${count || 1} multiple choice quiz question(s) for a ${grade}th grade student in ${state}.

Requirements:
- Subject: ${subject || 'any'}
- Difficulty: ${difficulty || 'auto (grade-appropriate)'}
- Align to ${state} state standards (use FL B.E.S.T. standards for Florida)
${exclude_standards?.length ? `- Exclude these standards: ${exclude_standards.join(', ')}` : ''}
${focus_components?.length ? `- Focus on these weak areas: ${focus_components.join(', ')}` : ''}

Return JSON array with this structure for each question:
{
  "question_text": "The question",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correct_answer": "A",
  "standard_code": "MA.4.AR.1.1",
  "standard_description": "Human readable standard",
  "learning_component": "Specific skill being tested",
  "difficulty_level": "easy|medium|hard",
  "explanation": "Why the answer is correct",
  "prerequisite_standards": ["MA.3.AR.1.1"]
}

Return ONLY valid JSON, no markdown.`
      }],
      // Note: MCP servers configuration might differ in actual deployment depending on Supabase support.
      // This is a placeholder for how it interacts conceptually.
      // In a real Edge Function, you might need to proxy the request or use a specific library if Supabase supports MCP natively.
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const questions = JSON.parse(text.replace(/```json|```/g, '').trim())

    return new Response(JSON.stringify({ questions }), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
})
