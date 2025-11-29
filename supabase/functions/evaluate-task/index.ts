import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS for browser requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { taskId, code } = await req.json();

    if (!code || !taskId) {
      throw new Error("Missing code or taskId");
    }

    // 1. Construct the Prompt
    // We strictly ask for JSON so your frontend can parse it easily.
    const systemPrompt = `
      You are a Senior Code Reviewer. Evaluate the following code snippet.
      Return ONLY a raw JSON object (no markdown formatting) with this structure:
      {
        "score": number (0-100),
        "summary": "Short executive summary of the code quality",
        "strengths": ["List of 2-3 good points"],
        "weaknesses": ["List of 2-3 bugs or issues"],
        "refactored_code": "The complete fixed and optimized code string"
      }
    `;

    // 2. Call OpenAI API (or Gemini/Anthropic)
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // or gpt-3.5-turbo
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Code to evaluate:\n\n${code}` },
        ],
        temperature: 0.2, // Low temperature for consistent JSON
      }),
    });

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

    // 3. Parse the JSON result
    // Sometimes AI wraps json in markdown blocks like \`\`\`json ... \`\`\`, we clean that.
    const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const feedback = JSON.parse(cleanJson);

    // 4. Save to Supabase Database
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: updateError } = await supabaseClient
      .from("tasks")
      .update({ 
        ai_feedback: feedback,
        // Optional: Update score if you have a separate column, otherwise it's in jsonb
      })
      .eq("id", taskId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, feedback }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
