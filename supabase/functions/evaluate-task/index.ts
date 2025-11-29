// Use a specific, stable version of the Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Model priority list
const GEMINI_MODELS = [
  "gemini-2.5-flash-lite", 
  "gemini-2.5-flash",   
  "gemini-2.5-pro"
];

// MODERN SYNTAX: Use Deno.serve instead of 'serve' import
Deno.serve(async (req) => {
  // 1. Handle Preflight (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("🚀 [Gemini Function] Request received");

    // 2. Initialize Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Parse Request Body
    const { taskId, code } = await req.json()
    if (!code || !taskId) throw new Error("Missing code or taskId");

    // 4. Verify Gemini Key
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      throw new Error("Server config error: Missing GEMINI_API_KEY");
    }

    // 5. System Prompt
    const systemPrompt = `
      You are a code analysis engine. Analyze the code for bugs, performance, and security.
      CRITICAL: Return ONLY a raw JSON object. No markdown formatting.
      JSON Schema:
      {
        "score": number,
        "summary": "string",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "refactored_code": "string"
      }
    `;

    let aiResponseText = null;
    let lastError = null;

    // 6. Robust Model Retry Loop
    for (const model of GEMINI_MODELS) {
      try {
        console.log(`🤖 Trying model: ${model}...`);
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `${systemPrompt}\n\nCODE TO EVALUATE:\n${code}`
                }]
              }],
              generationConfig: {
                responseMimeType: "application/json"
              }
            }),
          }
        );

        const data = await response.json();
        
        if (data.error) throw new Error(`API Error: ${data.error.message}`);

        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidate) throw new Error("Empty response");

        console.log(`✅ Success with ${model}`);
        aiResponseText = candidate;
        break; // Success!

      } catch (err: any) {
        console.warn(`❌ ${model} failed: ${err.message}`);
        lastError = err;
      }
    }

    if (!aiResponseText) {
      throw new Error(`All models failed. Last error: ${lastError?.message}`);
    }

    // 7. Parse & Clean JSON
    const cleanJson = aiResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
    let feedback;
    try {
      feedback = JSON.parse(cleanJson);
    } catch (e) {
      console.error("JSON Parse Error:", aiResponseText);
      throw new Error("AI returned invalid JSON");
    }

    // 8. Update Database
    const { error: updateError } = await supabaseClient
      .from('tasks')
      .update({ ai_feedback: feedback })
      .eq('id', taskId)

    if (updateError) throw updateError;

    // 9. Return Success
    return new Response(JSON.stringify({ success: true, feedback }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("🚨 Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500, // Internal Server Error
    })
  }
})
