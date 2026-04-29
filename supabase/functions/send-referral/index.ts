import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  resendKey: string;
}): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${opts.resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Refr <onboarding@resend.dev>",
        to: [opts.to],
        subject: opts.subject,
        text: opts.text,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

interface SendReferralRequest {
  referral_id: string;
  looker_id: string;
  referrer_name: string;
  looker_name: string;
  company_name: string;
  role_signal: string;
  hiring_manager_email: string;
  email_body: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as SendReferralRequest;
    const {
      looker_id,
      referrer_name,
      looker_name,
      company_name,
      role_signal,
      hiring_manager_email,
      email_body,
    } = body;

    if (!looker_id) {
      return new Response(JSON.stringify({ error: "looker_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up looker's email — requires service role to bypass RLS
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: lookerUser, error: lookerErr } = await admin
      .from("users")
      .select("email")
      .eq("id", looker_id)
      .single();

    if (lookerErr) {
      console.error("looker lookup error:", lookerErr.message);
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ ok: true, emails_sent: 0, reason: "no RESEND_API_KEY" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let emailsSent = 0;

    // Part 2 — Intro email to hiring manager
    if (hiring_manager_email) {
      const subject = `Introduction: ${looker_name} for ${role_signal} at ${company_name}`;
      const ok = await sendEmail({ to: hiring_manager_email, subject, text: email_body, resendKey });
      if (ok) emailsSent++;
    }

    // Part 3 — Notification email to looker
    if (lookerUser?.email) {
      const subject = `${referrer_name} just referred you to ${company_name}`;
      const text =
        `Hi ${looker_name},\n\n` +
        `${referrer_name} just sent a warm intro on your behalf to ${company_name} for the ${role_signal} role.\n\n` +
        `Here is what they said about you:\n\n${email_body}\n\n` +
        `We will keep you updated as things progress. Good luck!`;
      const ok = await sendEmail({ to: lookerUser.email, subject, text, resendKey });
      if (ok) emailsSent++;
    }

    return new Response(JSON.stringify({ ok: true, emails_sent: emailsSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("send-referral error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
