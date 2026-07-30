import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { files, command } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `You are a Senior Full-Stack Developer AI.
Task: ${command}

Current Project Files:
${files?.html ? `--- HTML ---\n${files.html}\n` : ""}
${files?.css ? `--- CSS ---\n${files.css}\n` : ""}
${files?.js ? `--- JS ---\n${files.js}\n` : ""}
${files?.python ? `--- PYTHON ---\n${files.python}\n` : ""}

Return a valid JSON object ONLY with keys: "html","css","js","python","explanation". No markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("ai gateway error", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error", status: response.status }), {
        status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await response.json();
    let text = data.choices?.[0]?.message?.content?.trim() || "{}";
    text = text.replace(/^```json\n?/i, "").replace(/\n?```$/g, "");
    let parsed: any = {};
    try { parsed = JSON.parse(text); } catch { parsed = { explanation: text }; }
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-orchestrator error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
