import { supabase } from "./supabase";

export interface LookerProfile {
  user_id: string;
  target_role: string | null;
  seniority: string | null;
  industries: string[];
  visible: boolean;
}

export interface RecentWork {
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string | null;
  description: string;
}

export interface LookerMatch {
  looker_id: string;
  name: string;
  score: number;
  match_reasons: string[];
  profile: LookerProfile;
  recent_work: RecentWork | null;
}

// Score words in target_role against the free-text role_signal.
// Weight: 3 (normalised by word count so a full match = 3.0).
function scoreRole(targetRole: string | null, signal: string): number {
  if (!targetRole || !signal) return 0;
  const words = targetRole.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  if (words.length === 0) return 0;
  const matched = words.filter((w) => signal.includes(w)).length;
  return matched > 0 ? (matched / words.length) * 3 : 0;
}

// Score industries against the free-text role_signal.
// Weight: 1 per matching industry.
function scoreIndustries(industries: string[], signal: string): number {
  if (!industries?.length || !signal) return 0;
  return industries.filter((ind) => signal.includes(ind.toLowerCase())).length;
}

function buildReasons(
  targetRole: string | null,
  industries: string[],
  signal: string,
): string[] {
  const reasons: string[] = [];

  if (scoreRole(targetRole, signal) > 0) reasons.push("Target role match");

  if (scoreIndustries(industries, signal) > 0) reasons.push("Same industry");

  // Always present since only confirmed relationships are considered
  reasons.push("Confirmed connection");

  return reasons;
}

export async function matchLookers(
  referrerId: string,
  roleSignal: string,
): Promise<LookerMatch[]> {
  const { data, error } = await supabase.rpc("get_referrer_lookers", {
    p_referrer_id: referrerId,
  });

  if (error) throw error;

  const signal = roleSignal.toLowerCase();

  const scored = ((data ?? []) as Array<{
    looker_id: string;
    name: string;
    email: string;
    profile: LookerProfile;
    recent_work: RecentWork | null;
  }>).map((row) => {
    const roleScore = scoreRole(row.profile?.target_role ?? null, signal);
    const indScore  = scoreIndustries(row.profile?.industries ?? [], signal);

    return {
      looker_id:    row.looker_id,
      name:         row.name,
      score:        roleScore + indScore,
      match_reasons: buildReasons(
        row.profile?.target_role ?? null,
        row.profile?.industries ?? [],
        signal,
      ),
      profile:      row.profile,
      recent_work:  row.recent_work,
    } satisfies LookerMatch;
  });

  // Sort descending by score, return top 3
  return scored.sort((a, b) => b.score - a.score).slice(0, 3);
}
