import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchJobsForCompanies, getRoleType, inferDomain, type Job } from "@/lib/jobs";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

const ROLE_TYPES = ["Engineering", "Product", "Design", "Marketing", "Sales", "Operations", "Other"];

const LOCATION_OPTIONS = [
  { label: "Remote", value: "remote" },
  { label: "San Francisco", value: "san francisco" },
  { label: "New York", value: "new york" },
  { label: "Los Angeles", value: "los angeles" },
  { label: "Austin", value: "austin" },
  { label: "Seattle", value: "seattle" },
  { label: "Boston", value: "boston" },
  { label: "Chicago", value: "chicago" },
  { label: "London", value: "london" },
];

const LOGO_COLORS = [
  "bg-blue-500/20 text-blue-400",
  "bg-violet-500/20 text-violet-400",
  "bg-emerald-500/20 text-emerald-400",
  "bg-orange-500/20 text-orange-400",
  "bg-rose-500/20 text-rose-400",
  "bg-cyan-500/20 text-cyan-400",
  "bg-amber-500/20 text-amber-400",
  "bg-indigo-500/20 text-indigo-400",
];

function logoColor(name: string): string {
  const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % LOGO_COLORS.length;
  return LOGO_COLORS[idx];
}

function CompanyLogo({ company }: { company: string }) {
  const [failed, setFailed] = useState(false);
  const domain = inferDomain(company);
  const initial = company.trim().charAt(0).toUpperCase();
  const colorClass = logoColor(company);

  if (failed) {
    return (
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 ${colorClass}`}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={`https://logo.clearbit.com/${domain}`}
      alt={company}
      width={32}
      height={32}
      className="w-8 h-8 rounded-lg object-contain bg-white shrink-0"
      onError={() => setFailed(true)}
    />
  );
}

const REFERRALS_REMAINING = 3;
const RESET_DATE = "May 1, 2026";
const PAGE_SIZE = 24;

function JobCard({ job, onRefer }: { job: Job; onRefer: () => void }) {
  return (
    <div className="glass-card p-5 flex flex-col gap-3 hover:ring-1 hover:ring-border transition-all">
      {/* Header: logo + company + title */}
      <div className="flex items-start gap-3">
        <CompanyLogo company={job.company_name} />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            {job.company_name}
          </p>
          <h3 className="text-sm font-semibold text-foreground mt-0.5 leading-snug line-clamp-2">
            {job.job_title}
          </h3>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1 flex-1">
        {job.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">{job.location}</span>
          </div>
        )}
      </div>

      {/* Role type badge */}
      <Badge
        variant="outline"
        className="text-[10px] font-medium border-border/60 text-muted-foreground w-fit"
      >
        {getRoleType(job.department, job.job_title)}
      </Badge>

      <Button
        size="sm"
        className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs w-full"
        onClick={onRefer}
      >
        I know someone for this
      </Button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <Skeleton className="h-3 w-2/5" />
      <Skeleton className="h-5 w-24 rounded-full" />
      <Skeleton className="h-8 w-full rounded-full" />
    </div>
  );
}

function EmptyState({ noWorkHistory, hasFilters }: { noWorkHistory: boolean; hasFilters: boolean }) {
  const navigate = useNavigate();

  if (noWorkHistory) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-base font-medium text-foreground mb-2">No work history found</p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-5">
          Add your past employers in your Profile and we'll surface open roles at those companies.
        </p>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => navigate("/dashboard?tab=profile")}
        >
          Go to Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="glass-card p-12 text-center">
      <p className="text-base font-medium text-foreground mb-2">
        {hasFilters ? "No roles match your filters" : "No open roles found"}
      </p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {hasFilters
          ? "Try adjusting or clearing your filters."
          : "None of your former companies have open listings right now. Check back soon — listings refresh hourly."}
      </p>
    </div>
  );
}

const OpportunitiesTab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [noWorkHistory, setNoWorkHistory] = useState(false);
  const [search, setSearch] = useState("");
  const [roleType, setRoleType] = useState("all");
  const [location, setLocation] = useState("all");
  const [showCount, setShowCount] = useState(PAGE_SIZE);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);

      // Fetch the referrer's work history to get company names
      const { data: workHistory } = await supabase
        .from("work_history")
        .select("company_name")
        .eq("user_id", user.id);

      const companies = [
        ...new Set(
          (workHistory ?? [])
            .map((r) => r.company_name?.trim())
            .filter(Boolean) as string[],
        ),
      ];

      if (companies.length === 0) {
        setNoWorkHistory(true);
        setLoading(false);
        return;
      }

      const jobs = await fetchJobsForCompanies(companies, user.id);
      setJobs(jobs);
      setLoading(false);
    };

    load();
  }, [user?.id]);

  const hasFilters = !!(search.trim() || roleType !== "all" || location !== "all");

  const filtered = useMemo(() => {
    let result = jobs;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.job_title.toLowerCase().includes(q) ||
          j.company_name.toLowerCase().includes(q) ||
          j.department.toLowerCase().includes(q),
      );
    }

    if (roleType !== "all") {
      result = result.filter((j) => getRoleType(j.department, j.job_title) === roleType);
    }

    if (location !== "all") {
      result = result.filter((j) => j.location.toLowerCase().includes(location));
    }

    return result;
  }, [jobs, search, roleType, location]);

  const clearFilters = () => {
    setSearch("");
    setRoleType("all");
    setLocation("all");
    setShowCount(PAGE_SIZE);
  };

  const handleRefer = (job: Job) => {
    navigate(
      `/refer?role_signal=${encodeURIComponent(job.job_title)}&company_name=${encodeURIComponent(job.company_name)}&job_url=${encodeURIComponent(job.job_url)}`,
    );
  };

  const visible = filtered.slice(0, showCount);
  const remaining = filtered.length - showCount;

  return (
    <div className="space-y-5">
      {/* Referral quota banner */}
      {REFERRALS_REMAINING > 0 ? (
        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-accent/10 text-xs text-accent border border-accent/20">
          You have {REFERRALS_REMAINING} referrals remaining this month.
        </div>
      ) : (
        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground border border-border/50">
          Monthly referral limit reached. Resets {RESET_DATE}.
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setShowCount(PAGE_SIZE); }}
          placeholder="Search by title, company, or team…"
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={roleType} onValueChange={(v) => { setRoleType(v); setShowCount(PAGE_SIZE); }}>
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue placeholder="Role Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Role Types</SelectItem>
            {ROLE_TYPES.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={location} onValueChange={(v) => { setLocation(v); setShowCount(PAGE_SIZE); }}>
          <SelectTrigger className="w-44 h-8 text-xs">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {LOCATION_OPTIONS.map((l) => (
              <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear filters
          </button>
        )}

        {!loading && !noWorkHistory && (
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length.toLocaleString()} {filtered.length === 1 ? "role" : "roles"}
          </span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : noWorkHistory || filtered.length === 0 ? (
        <EmptyState noWorkHistory={noWorkHistory} hasFilters={hasFilters} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((job, i) => (
              <motion.div
                key={`${job.source}-${job.job_url}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.025, 0.35) }}
              >
                <JobCard job={job} onRefer={() => handleRefer(job)} />
              </motion.div>
            ))}
          </div>

          {remaining > 0 && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => setShowCount((c) => c + PAGE_SIZE)}
                className="rounded-full text-sm"
              >
                Show {Math.min(remaining, PAGE_SIZE)} more
                <span className="ml-1.5 text-muted-foreground text-xs">({remaining} remaining)</span>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OpportunitiesTab;
