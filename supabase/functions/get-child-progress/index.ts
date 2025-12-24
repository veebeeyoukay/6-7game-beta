// supabase/functions/get-child-progress/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
    // TODO: Return mastery data

    return new Response(JSON.stringify({ progress: [] }), {
        headers: { "Content-Type": "application/json" }
    })
})
