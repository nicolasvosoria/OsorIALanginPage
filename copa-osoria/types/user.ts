/**
 * Tipos para la tabla public.users.
 * id es FK de auth.users (Supabase Auth).
 */

export interface UserProfile {
  id: string;
  created_at: string;
  username: string;
  email: string;
  register_code: string | null;
}

export type UserProfileInsert = Omit<UserProfile, "created_at"> & {
  created_at?: string;
};
