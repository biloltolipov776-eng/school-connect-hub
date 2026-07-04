import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string; user_id: string | null; username: string;
  display_name: string; avatar_url: string | null; bio: string | null;
  is_bot: boolean; bot_owner_id: string | null;
};

const Ctx = createContext<{
  user: User | null; session: Session | null; profile: Profile | null;
  loading: boolean; refreshProfile: () => Promise<void>;
}>({ user: null, session: null, profile: null, loading: true, refreshProfile: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle();
    setProfile(data as Profile | null);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) setTimeout(() => loadProfile(s.user.id), 0);
      else setProfile(null);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) loadProfile(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider value={{
      user: session?.user ?? null, session, profile, loading,
      refreshProfile: async () => { if (session?.user) await loadProfile(session.user.id); },
    }}>{children}</Ctx.Provider>
  );
}
export const useAuth = () => useContext(Ctx);
