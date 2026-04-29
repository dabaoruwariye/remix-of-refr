import { supabase } from "./supabase";
import type { UserType } from "./types";

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function getUserType(userId: string): Promise<UserType | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("user_type")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return data.user_type as UserType;
}
