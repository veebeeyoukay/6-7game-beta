// supabase/functions/process-answer/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
    // TODO: Implement answer processing
    // 1. Validate answer
    // 2. Update battle state if in battle
    // 3. Update learning_progress
    // 4. Award Mollars

    return new Response(JSON.stringify({ correct: true, mollars_earned: 5 }), {
        headers: { "Content-Type": "application/json" }
    })
})
