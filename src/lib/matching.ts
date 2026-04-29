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

function scoreRole(targetRole: string | null, signal: string): number {
  if (!targetRole || !signal) return 0;
  const words = targetRole.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  if (words.length === 0) return 0;
  const matched = words.filter((w) => signal.includes(w)).length;
  return matched > 0 ? (matched / words.length) * 3 : 0;
}

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
  reasons.push("Confirmed connection");
  return reasons;
}

export async function matchLookers(
  referrerId: string,
  roleSignal: string,
): Promise<LookerMatch[]> {
  // 1. Get confirmed relationships for this referrer
  const { data: rels, error: relsError } = await supabase
    .from("relationships")
    .select("looker_id")
    .eq("referrer_id", referrerId)
    .eq("confirmed_by_looker", true);

  if (relsError) throw relsError;
  if (!rels || rels.length === 0) return [];

  const lookerIds = rels.map((r) => r.looker_id as string);

  // 2. Fetch user names, visible profiles, and work history in parallel.
  //    The cross-user RLS policies allow referrers to read confirmed connections.
  const [
    { data: userRows, error: usersError },
    { data: profiles },
    { data: workRows },
  ] = await Promise.all([
    supabase.from("users").select("id, name").in("id", lookerIds),
    supabase
      .from("looker_profiles")
      .select("user_id, target_role, seniority, industries, visible")
      .in("user_id", lookerIds)
      .eq("visible", true),
    supabase
      .from("work_history")
      .select("user_id, company_name, job_title, start_date, end_date, description")
      .in("user_id", lookerIds)
      .order("start_date", { ascending: false }),
  ]);

  if (usersError) throw usersError;

  // 3. Index profiles by user_id
  const profileMap = new Map<string, LookerProfile>();
  for (const p of (profiles ?? [])) {
    profileMap.set(p.user_id, {
      user_id: p.user_id,
      target_role: p.target_role ?? null,
      seniority: p.seniority ?? null,
      industries: p.industries ?? [],
      visible: p.visible ?? true,
    });
  }

  // 4. Index most-recent work entry by user_id (rows already ordered desc by start_date)
  const workMap = new Map<string, RecentWork>();
  for (const w of (workRows ?? [])) {
    if (!workMap.has(w.user_id)) {
      workMap.set(w.user_id, {
        company_name: w.company_name ?? "",
        job_title: w.job_title ?? "",
        start_date: w.start_date ?? "",
        end_date: w.end_date ?? null,
        description: w.description ?? "",
      });
    }
  }

  const signal = roleSignal.toLowerCase();

  // 5. Assemble, score, sort, return top 3
  const scored: LookerMatch[] = [];
  for (const u of (userRows ?? [])) {
    const profile = profileMap.get(u.id);
    if (!profile) continue; // no visible profile — skip

    scored.push({
      looker_id: u.id,
      name: u.name ?? "",
      score: scoreRole(profile.target_role, signal) + scoreIndustries(profile.industries, signal),
      match_reasons: buildReasons(profile.target_role, profile.industries, signal),
      profile,
      recent_work: workMap.get(u.id) ?? null,
    });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, 3);
}
