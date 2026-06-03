import type { Session, User } from "@supabase/supabase-js";

export type AuthUserProfile = {
  avatarUrl?: string | null;
  createdAt?: string | null;
  email?: string | null;
  fullName?: string | null;
  id: string;
};

export type AuthState = {
  isOnboarded: boolean;
  loading: boolean;
  profile: AuthUserProfile | null;
  session: Session | null;
  user: User | null;
};
