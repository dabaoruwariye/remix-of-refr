import Anthropic from "npm:@anthropic-ai/sdk@0.52.0";
import mammoth from "npm:mammoth@1.8.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PARSE_PROMPT = `Extract all work experience and education from this resume.

Return ONLY a valid JSON object — no markdown, no code fences, no explanation. The response must be parseable directly by JSON.parse().

Required structure:
{
  "work_history": [
    {
      "company_name": "string",
      "job_title": "string",
      "start_date": "string (e.g. Jan 2020)",
      "end_date": "string or null for current role",
      "description": "string, 1-2 sentences summarising responsibilities and impact"
    }
  ],
  "education": [
    {
      "school_name": "string",
      "degree_type": "string (e.g. BS, MS, MBA, PhD, BA)",
      "field_of_study": "string",
      "graduation_year": "string (e.g. 2020)"
    }
  ]
}

Rules:
- List positions in reverse chronological order (most recent first)
- Set end_date to null for current positions
- Use null for any field that is not present in the resume
- Keep descriptions factual and concise`;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  // Process in chunks to avoid call stack limits on large files
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunkSize, bytes.length)));
  }
  return btoa(binary);
}

function stripJsonFences(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenced) return fenced[1];
  return text.trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth (optional — if present, we save to DB) ──────────────────────
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      const anonClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: { user } } = await anonClient.auth.getUser();
      userId = user?.id ?? null;
    }

    // ── File from multipart form ─────────────────────────────────────────
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isPdf  = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isDocx = file.name.toLowerCase().endsWith(".docx") || file.name.toLowerCase().endsWith(".doc");

    if (!isPdf && !isDocx) {
      return new Response(JSON.stringify({ error: "Unsupported file type. Upload a PDF or Word document." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Build Anthropic message ──────────────────────────────────────────
    const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });
    const buffer = await file.arrayBuffer();

    let messageContent: Anthropic.MessageParam["content"];

    if (isPdf) {
      // Send PDF directly as a document — Claude reads it natively
      const base64 = arrayBufferToBase64(buffer);
      messageContent = [
        {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: base64 },
        } as Anthropic.DocumentBlockParam,
        { type: "text", text: PARSE_PROMPT },
      ];
    } else {
      // Extract raw text from DOCX with mammoth
      const { value: rawText } = await mammoth.extractRawText({ arrayBuffer: buffer });
      messageContent = `${PARSE_PROMPT}\n\nResume text:\n${rawText}`;
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: messageContent }],
    });

    const rawJson = stripJsonFences(
      (response.content[0] as Anthropic.TextBlock).text,
    );
    const parsed = JSON.parse(rawJson) as {
      work_history: Array<{
        company_name: string;
        job_title: string;
        start_date: string;
        end_date: string | null;
        description: string;
      }>;
      education: Array<{
        school_name: string;
        degree_type: string;
        field_of_study: string;
        graduation_year: string;
      }>;
    };

    // ── Save to DB if authenticated ──────────────────────────────────────
    if (userId) {
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        { auth: { autoRefreshToken: false, persistSession: false } },
      );

      // Delete existing records first
      await adminClient.from("work_history").delete().eq("user_id", userId);
      await adminClient.from("education").delete().eq("user_id", userId);

      if (parsed.work_history.length > 0) {
        await adminClient.from("work_history").insert(
          parsed.work_history.map((item) => ({ ...item, user_id: userId })),
        );
      }

      if (parsed.education.length > 0) {
        await adminClient.from("education").insert(
          parsed.education.map((item) => ({ ...item, user_id: userId })),
        );
      }
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
