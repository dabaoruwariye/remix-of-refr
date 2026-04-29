import Anthropic from "npm:@anthropic-ai/sdk@0.52.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT =
  "You write warm concise intro emails for a hiring referral platform called Refr. " +
  "Write in a natural human voice — not corporate, not stiff. " +
  "Sound like a real person who genuinely knows both parties. " +
  "Three short paragraphs maximum. No subject line. No sign off name.";

interface DraftEmailRequest {
  referrer_name: string;
  referrer_current_role?: string;
  referrer_current_company?: string;
  looker_name: string;
  looker_current_role?: string;
  looker_industries?: string[];
  looker_target_role?: string;
  company_name?: string;
  role_signal?: string;
  vouch_text?: string;
  relationship_context?: string;
  overlap_company?: string;
  overlap_school?: string;
}

function buildUserPrompt(req: DraftEmailRequest): string {
  const {
    referrer_name,
    referrer_current_role,
    referrer_current_company,
    looker_name,
    looker_current_role,
    looker_industries,
    looker_target_role,
    company_name,
    role_signal,
    vouch_text,
    relationship_context,
    overlap_company,
    overlap_school,
  } = req;

  const referrerDesc = [referrer_current_role, referrer_current_company].filter(Boolean).join(" at ");
  const lookerDesc = looker_current_role ?? looker_target_role ?? "";
  const roleDesc = role_signal ?? looker_target_role ?? "this role";
  const targetCompany = company_name ?? "the company";

  const overlapLine = overlap_company
    ? `They worked together at ${overlap_company}.`
    : overlap_school
    ? `They both attended ${overlap_school}.`
    : "";

  const contextLine = relationship_context
    ? `How the referrer knows them: ${relationship_context}`
    : overlapLine
    ? `How the referrer knows them: ${overlapLine}`
    : "";

  return `Write an introduction email from ${referrer_name}${referrerDesc ? ` (${referrerDesc})` : ""} to a hiring manager at ${targetCompany}, introducing ${looker_name}${lookerDesc ? ` (${lookerDesc})` : ""} for the ${roleDesc} role.

${contextLine ? `${contextLine}\n` : ""}${vouch_text ? `Referrer's vouch: ${vouch_text}\n` : ""}${looker_industries?.length ? `${looker_name}'s industries: ${looker_industries.join(", ")}\n` : ""}
Paragraph 1: ${referrer_name} briefly introduces themselves and ${looker_name}, mentioning how they know each other${overlapLine ? " (shared background)" : ""}.
Paragraph 2: Explain why ${looker_name} is a great fit for ${roleDesc} at ${targetCompany}. Reference their background and${vouch_text ? " the referrer's vouch" : " what makes them stand out"}.
Paragraph 3: Soft call to action — suggest the hiring manager take a look or set up a quick chat.`;
}

function fallbackDraft(req: DraftEmailRequest): string {
  const {
    referrer_name,
    looker_name,
    looker_target_role,
    role_signal,
    company_name,
    relationship_context,
    overlap_company,
    overlap_school,
    vouch_text,
  } = req;

  const roleDesc = role_signal ?? looker_target_role ?? "this role";
  const targetCompany = company_name ?? "your company";
  const howKnow = relationship_context
    ?? (overlap_company ? `we worked together at ${overlap_company}` : null)
    ?? (overlap_school ? `we both attended ${overlap_school}` : null)
    ?? "we have a confirmed connection through Refr";

  return `Hi,

I wanted to reach out to introduce ${looker_name} — ${howKnow}. They're actively exploring ${roleDesc} opportunities and I immediately thought of ${targetCompany}.

${vouch_text ? vouch_text + "\n\n" : ""}I think they'd be a great fit and worth a conversation. Happy to share more context if helpful.

Best,
${referrer_name}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as DraftEmailRequest;

    if (!body.referrer_name || !body.looker_name) {
      return new Response(JSON.stringify({ error: "referrer_name and looker_name are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });

    let draft: string;
    try {
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(body) }],
      });
      draft = (response.content[0] as Anthropic.TextBlock).text.trim();
    } catch {
      draft = fallbackDraft(body);
    }

    return new Response(JSON.stringify({ draft }), {
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
