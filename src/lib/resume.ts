import { supabase } from "./supabase";
import type { Position, Education } from "@/components/shared/ExperienceCard";

export interface WorkHistoryItem {
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string | null;
  description: string;
}

export interface EducationItem {
  school_name: string;
  degree_type: string;
  field_of_study: string;
  graduation_year: string;
}

export interface ParsedResume {
  work_history: WorkHistoryItem[];
  education: EducationItem[];
}

export async function uploadResume(file: File): Promise<ParsedResume> {
  const { data: { session } } = await supabase.auth.getSession();

  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-resume`,
    { method: "POST", headers, body: formData },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Resume parsing failed (${response.status})`);
  }

  const parsed = await response.json() as ParsedResume;

  // Persist to DB using the authenticated client so RLS is satisfied
  const userId = session?.user?.id;
  if (userId) {
    // Delete before insert to avoid duplicates
    await Promise.all([
      supabase.from("work_history").delete().eq("user_id", userId),
      supabase.from("education").delete().eq("user_id", userId),
    ]);

    if (parsed.work_history.length > 0) {
      await supabase.from("work_history").insert(
        parsed.work_history.map((item) => ({ ...item, user_id: userId })),
      );
    }
    if (parsed.education.length > 0) {
      await supabase.from("education").insert(
        parsed.education.map((item) => ({ ...item, user_id: userId })),
      );
    }
  }

  return parsed;
}

export function parsedToPositions(workHistory: WorkHistoryItem[]): Position[] {
  return workHistory.map((item) => ({
    id: crypto.randomUUID(),
    company: item.company_name ?? "",
    title: item.job_title ?? "",
    startDate: item.start_date ?? "",
    endDate: item.end_date ?? "Present",
    description: item.description ?? "",
  }));
}

export function parsedToEducation(educationItems: EducationItem[]): Education[] {
  return educationItems.map((item) => ({
    id: crypto.randomUUID(),
    school: item.school_name ?? "",
    degree: item.degree_type ?? "",
    field: item.field_of_study ?? "",
    graduationYear: item.graduation_year ?? "",
  }));
}
