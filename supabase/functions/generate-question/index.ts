// supabase/functions/generate-question/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.14.0"

serve(async (req) => {
  const apiKey = Deno.env.get('GOOGLE_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GOOGLE_API_KEY is not set' }), { status: 500 })
  }

  const { state, grade, subject, difficulty, count, exclude_standards, focus_components } = await req.json()

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `Generate ${count || 1} multiple choice quiz question(s) for a ${grade}th grade student in ${state}.

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

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let questions
    try {
      questions = JSON.parse(text.replace(/```json|```/g, '').trim())
    } catch (e) {
      console.error("Failed to parse JSON:", text)
      throw new Error("Invalid format from AI")
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
})
