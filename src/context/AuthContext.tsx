import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { login, logout, signup, getUserType } from "@/lib/auth";
import type { UserType } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  userType: UserType | null;
  loading: boolean;
  signup: (name: string, email: string, password: string, userType: UserType, inviteId?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<UserType | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getUserType(session.user.id).then(setUserType);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getUserType(session.user.id).then(setUserType);
      } else {
        setUserType(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignup = async (
    name: string,
    email: string,
    password: string,
    userType: UserType,
    inviteId?: string,
  ) => {
    await signup(name, email, password, userType, inviteId);
  };

  const handleLogin = async (email: string, password: string): Promise<UserType | null> => {
    const data = await login(email, password);
    if (data.user) {
      const type = await getUserType(data.user.id);
      setUserType(type);
      return type;
    }
    return null;
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setUserType(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        loading,
        signup: handleSignup,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
