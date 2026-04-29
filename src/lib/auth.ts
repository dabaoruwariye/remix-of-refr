import { supabase } from "./supabase";
import type { UserType } from "./types";

export async function signup(
  name: string,
  email: string,
  password: string,
  userType: UserType,
  inviteId?: string,
) {
  const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) throw signUpError;

  const userId = authData.user?.id;
  if (!userId) throw new Error("Signup succeeded but no user ID returned");

  // SECURITY DEFINER function — runs server-side with postgres privileges,
  // bypasses RLS without needing the service role key in the browser.
  const { error: rpcError } = await supabase.rpc("create_user_profile", {
    p_user_id:   userId,
    p_email:     email,
    p_name:      name,
    p_user_type: userType,
    p_invite_id: inviteId ?? null,
  });
  if (rpcError) throw rpcError;

  return authData;
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function getUserType(userId: string): Promise<UserType | null> {
  const { data, error } = await supabase
    .from("users")
    .select("user_type")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return data.user_type as UserType;
}
