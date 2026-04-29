export type UserType = "looker" | "referrer";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  user_type: UserType;
  created_at: string;
}

export interface LookerProfile {
  id: string;
  user_id: string;
  resume_url: string | null;
  industries: string[];
  target_role: string;
  seniority: "junior" | "mid" | "senior" | "lead" | "executive";
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReferrerProfile {
  id: string;
  user_id: string;
  company: string | null;
  title: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export type ReferralStatus = "sent" | "in_process" | "hired" | "not_progressed";

export interface Referral {
  id: string;
  referrer_id: string;
  looker_id: string;
  looker_name: string;
  company: string;
  role_title: string;
  date_sent: string;
  status: ReferralStatus;
  relationship_context: string;
  vouch_text: string;
  hiring_manager_email: string;
  email_body: string;
  potential_payout: number | null;
  created_at: string;
  updated_at: string;
}

export interface Earning {
  id: string;
  referral_id: string;
  referrer_id: string;
  looker_name: string;
  company: string;
  amount: number;
  status: "pending" | "confirmed" | "paid";
  confirmed_at: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface Connection {
  id: string;
  referrer_id: string;
  looker_id: string;
  confirmed: boolean;
  created_at: string;
}
