export interface Job {
  company_name: string;
  job_title: string;
  location: string;
  department: string;
  job_url: string;
  source: "greenhouse" | "lever";
}

export const JOBS_CACHE_PREFIX = "refr_jobs_v2_";
const CACHE_PREFIX = JOBS_CACHE_PREFIX;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
  fingerprint: string; // sorted slug list — invalidates when work_history changes
  data: Job[];
  ts: number;
}

// Converts a free-text company name to an API slug.
// "Goldman Sachs" → "goldmansachs", "J.P. Morgan" → "jpmorgan"
export function slugifyCompany(name: string): string {
  return name
    .replace(/\./g, "")
    .replace(/[&+]/g, "")
    .toLowerCase()
    .replace(
      /\b(inc|llc|ltd|corp|co|company|group|holdings|international|technologies|technology|solutions|services|global|the)\b/g,
      "",
    )
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

// Infers a company's primary domain for the Clearbit logo API.
// "Goldman Sachs" → "goldmansachs.com", "J.P. Morgan" → "jpmorgan.com"
export function inferDomain(name: string): string {
  const slug = slugifyCompany(name);
  return `${slug}.com`;
}

export function getRoleType(department: string, title: string): string {
  const text = `${department} ${title}`.toLowerCase();
  if (/\b(engineer|engineering|software|developer|infrastructure|backend|frontend|devops|sre|platform|security|data\s*scien|machine\s*learn|ml\b|ai\b)\b/.test(text)) return "Engineering";
  if (/\bproduct\s*(manager|management|lead|director|vp|head)\b|\bpm\b/.test(text)) return "Product";
  if (/\b(design|ux|ui|user\s*experience|creative|brand|visual)\b/.test(text)) return "Design";
  if (/\b(marketing|growth|content|seo|demand\s*gen|communications|pr\b|public\s*relations)\b/.test(text)) return "Marketing";
  if (/\b(sales|account\s*executive|business\s*development|revenue|account\s*manager|ae\b|bdr\b|sdr\b)\b/.test(text)) return "Sales";
  if (/\b(operations|ops|support|customer\s*success|customer\s*experience|bizops|strategy)\b/.test(text)) return "Operations";
  return "Other";
}

async function fetchGreenhouse(companyName: string): Promise<Job[]> {
  const slug = slugifyCompany(companyName);
  if (!slug) return [];
  try {
    const res = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.jobs ?? []).map((job: Record<string, unknown>) => ({
      company_name: companyName,
      job_title: (job.title as string) ?? "",
      location: ((job.location as Record<string, string>)?.name) ?? "",
      department: ((job.departments as Array<Record<string, string>>)?.[0]?.name) ?? "",
      job_url: (job.absolute_url as string) ?? "",
      source: "greenhouse" as const,
    }));
  } catch {
    return [];
  }
}

async function fetchLever(companyName: string): Promise<Job[]> {
  const slug = slugifyCompany(companyName);
  if (!slug) return [];
  try {
    const res = await fetch(
      `https://api.lever.co/v0/postings/${slug}?mode=json`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((job: Record<string, unknown>) => {
      const cats = (job.categories as Record<string, string>) ?? {};
      return {
        company_name: companyName,
        job_title: (job.text as string) ?? "",
        location: cats.location ?? "",
        department: cats.team ?? "",
        job_url: (job.hostedUrl as string) ?? "",
        source: "lever" as const,
      };
    });
  } catch {
    return [];
  }
}

export async function fetchJobsForCompanies(
  companyNames: string[],
  userId: string,
): Promise<Job[]> {
  const fingerprint = [...companyNames].map(slugifyCompany).sort().join("|");
  const cacheKey = CACHE_PREFIX + userId;

  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const entry = JSON.parse(raw) as CacheEntry;
      if (entry.fingerprint === fingerprint && Date.now() - entry.ts < CACHE_TTL) {
        return entry.data;
      }
    }
  } catch { /* ignore */ }

  // Try both Greenhouse and Lever for every company in parallel.
  // allSettled ensures a single failing fetch never blocks the rest.
  const results = await Promise.allSettled(
    companyNames.flatMap((name) => [fetchGreenhouse(name), fetchLever(name)]),
  );

  const jobs: Job[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") jobs.push(...r.value);
  }

  // Deduplicate by job_url (same posting could appear on both boards for some companies)
  const seen = new Set<string>();
  const deduped = jobs.filter((j) => {
    if (!j.job_url || seen.has(j.job_url)) return false;
    seen.add(j.job_url);
    return true;
  });

  deduped.sort((a, b) =>
    a.company_name.localeCompare(b.company_name) || a.job_title.localeCompare(b.job_title),
  );

  try {
    const entry: CacheEntry = { fingerprint, data: deduped, ts: Date.now() };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch { /* ignore quota errors */ }

  return deduped;
}
