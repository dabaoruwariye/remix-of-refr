import { supabase } from "./supabase";

export interface OverlapResult {
  shared_companies: string[];
  shared_schools: string[];
  has_overlap: boolean;
}

interface WorkEntry {
  company_name: string;
  start_date: string | null;
  end_date: string | null;
}

interface EduEntry {
  school_name: string;
}

// Parse free-text date strings into a comparable Date.
// Handles: "2020-06", "Jan 2020", "2020", "Present", null.
function parseDate(s: string | null | undefined): Date {
  if (!s || /^present$/i.test(s.trim())) return new Date();

  // "YYYY-MM"
  const ym = s.match(/^(\d{4})-(\d{2})$/);
  if (ym) return new Date(+ym[1], +ym[2] - 1, 1);

  // "Mon YYYY" or "Month YYYY"
  const my = s.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (my) {
    const d = new Date(`${my[1]} 1, ${my[2]}`);
    if (!isNaN(d.getTime())) return d;
  }

  // "YYYY"
  const y = s.match(/^(\d{4})$/);
  if (y) return new Date(+y[1], 0, 1);

  const fallback = new Date(s);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

function rangesOverlap(
  start1: string | null,
  end1: string | null,
  start2: string | null,
  end2: string | null,
): boolean {
  // Two intervals [s1, e1) and [s2, e2) overlap when s1 < e2 AND s2 < e1
  return parseDate(start1) < parseDate(end2) && parseDate(start2) < parseDate(end1);
}

export async function detectOverlap(
  referrerId: string,
  lookerId: string,
): Promise<OverlapResult> {
  const { data, error } = await supabase.rpc("get_user_histories", {
    p_user_id_a: referrerId,
    p_user_id_b: lookerId,
  });

  if (error) throw error;

  const referrerWork: WorkEntry[] = data.user_a_work ?? [];
  const lookerWork: WorkEntry[]   = data.user_b_work ?? [];
  const referrerEdu: EduEntry[]   = data.user_a_edu  ?? [];
  const lookerEdu: EduEntry[]     = data.user_b_edu   ?? [];

  // Shared companies where date ranges overlap
  const shared_companies: string[] = [];
  for (const rw of referrerWork) {
    if (!rw.company_name) continue;
    for (const lw of lookerWork) {
      if (
        lw.company_name?.toLowerCase() === rw.company_name.toLowerCase() &&
        rangesOverlap(rw.start_date, rw.end_date, lw.start_date, lw.end_date) &&
        !shared_companies.includes(rw.company_name)
      ) {
        shared_companies.push(rw.company_name);
      }
    }
  }

  // Shared schools (no date check — graduation years rarely overlap meaningfully)
  const shared_schools: string[] = [];
  for (const re of referrerEdu) {
    if (!re.school_name) continue;
    for (const le of lookerEdu) {
      if (
        le.school_name?.toLowerCase() === re.school_name.toLowerCase() &&
        !shared_schools.includes(re.school_name)
      ) {
        shared_schools.push(re.school_name);
      }
    }
  }

  return {
    shared_companies,
    shared_schools,
    has_overlap: shared_companies.length > 0 || shared_schools.length > 0,
  };
}
