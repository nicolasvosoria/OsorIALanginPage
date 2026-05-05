import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/copa-osoria/lib/supabase";
import type { UserProfile } from "@/copa-osoria/types/user";

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, username: string, register_code?: string | null) => Promise<{ error: { message: string } | null }>;
  signOut: () => Promise<void>;
  updateProfile: (username: string, email: string) => Promise<{ error: string | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    error: null,
  });

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) return null;
    return data as UserProfile;
  }, []);

  const setAuth = useCallback(
    async (user: User | null, session: Session | null) => {
      if (!user || !session) {
        setState((s) => ({ ...s, user: null, session: null, profile: null, loading: false }));
        return;
      }
      const profile = await fetchProfile(user.id);
      setState((s) => ({ ...s, user, session, profile, loading: false }));
    },
    [fetchProfile]
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session?.user ?? null, session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session?.user ?? null, session);
    });

    return () => subscription.unsubscribe();
  }, [setAuth]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setState((s) => ({ ...s, error: null }));
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setState((s) => ({ ...s, error: error.message }));
        return { error };
      }
      await setAuth(data.user, data.session);
      return { error: null };
    },
    [setAuth]
  );

  const signUp = useCallback(
    async (email: string, password: string, username: string, register_code?: string | null) => {
      setState((s) => ({ ...s, error: null }));
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: username,
            username,
            register_code: register_code?.trim() || null,
          },
        },
      });
      if (authError) {
        setState((s) => ({ ...s, error: authError.message }));
        return { error: authError };
      }
      return { error: null };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState((s) => ({ ...s, user: null, session: null, profile: null, error: null }));
  }, []);

  const updateProfile = useCallback(
    async (username: string, email: string) => {
      const { user } = state;
      if (!user) return { error: "No hay sesión" };
      setState((s) => ({ ...s, error: null }));

      const { error: updateUserError } = await supabase.from("users").update({
        username: username.trim(),
        email: email.trim(),
      }).eq("id", user.id);

      if (updateUserError) {
        setState((s) => ({ ...s, error: updateUserError.message }));
        return { error: updateUserError.message };
      }

      if (email.trim() !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({ email: email.trim() });
        if (authError) {
          setState((s) => ({ ...s, error: authError.message }));
          return { error: authError.message };
        }
      }

      const profile = await fetchProfile(user.id);
      setState((s) => ({ ...s, profile }));
      return { error: null };
    },
    [state.user, fetchProfile]
  );

  const resetPasswordForEmail = useCallback(async (email: string) => {
    setState((s) => ({ ...s, error: null }));
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const redirectTo = `${origin}/change-password`;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (err) {
      setState((s) => ({ ...s, error: err.message }));
      return { error: err.message };
    }
    return { error: null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    setState((s) => ({ ...s, error: null }));
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    if (err) {
      setState((s) => ({ ...s, error: err.message }));
      return { error: err.message };
    }
    return { error: null };
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPasswordForEmail,
    updatePassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
