import { supabase } from "./supabase";

export interface OverlapResult {
  shared_companies: string[];
  shared_schools: string[];
  has_overlap: boolean;
}

function parseDate(s: string | null | undefined): Date {
  if (!s || /^present$/i.test(s.trim())) return new Date();
  const ym = s.match(/^(\d{4})-(\d{2})$/);
  if (ym) return new Date(+ym[1], +ym[2] - 1, 1);
  const my = s.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (my) { const d = new Date(`${my[1]} 1, ${my[2]}`); if (!isNaN(d.getTime())) return d; }
  const y = s.match(/^(\d{4})$/);
  if (y) return new Date(+y[1], 0, 1);
  const fallback = new Date(s);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

function rangesOverlap(s1: string | null, e1: string | null, s2: string | null, e2: string | null): boolean {
  return parseDate(s1) < parseDate(e2) && parseDate(s2) < parseDate(e1);
}

export async function detectOverlap(
  referrerId: string,
  lookerId: string,
): Promise<OverlapResult> {
  try {
    // Fetch all four datasets in parallel.
    // Referrer reads own rows via ownership policy.
    // Looker rows are readable via the cross-user RLS policies:
    //   "work_history: referrer can read confirmed connections"
    //   "education: referrer can read confirmed connections"
    // If those rows return empty (policy not met), we gracefully return no overlap.
    const [
      { data: referrerWork },
      { data: lookerWork },
      { data: referrerEdu },
      { data: lookerEdu },
    ] = await Promise.all([
      supabase.from("work_history").select("company_name, start_date, end_date").eq("user_id", referrerId),
      supabase.from("work_history").select("company_name, start_date, end_date").eq("user_id", lookerId),
      supabase.from("education").select("school_name").eq("user_id", referrerId),
      supabase.from("education").select("school_name").eq("user_id", lookerId),
    ]);

    const rWork = referrerWork ?? [];
    const lWork = lookerWork ?? [];
    const rEdu  = referrerEdu ?? [];
    const lEdu  = lookerEdu ?? [];

    const shared_companies: string[] = [];
    for (const rw of rWork) {
      if (!rw.company_name) continue;
      for (const lw of lWork) {
        if (
          lw.company_name?.toLowerCase() === rw.company_name.toLowerCase() &&
          rangesOverlap(rw.start_date, rw.end_date, lw.start_date, lw.end_date) &&
          !shared_companies.includes(rw.company_name)
        ) {
          shared_companies.push(rw.company_name);
        }
      }
    }

    const shared_schools: string[] = [];
    for (const re of rEdu) {
      if (!re.school_name) continue;
      for (const le of lEdu) {
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
  } catch {
    return { shared_companies: [], shared_schools: [], has_overlap: false };
  }
}
