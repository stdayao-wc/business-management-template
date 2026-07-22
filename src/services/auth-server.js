import { createClient } from "@/lib/supabase/server";

/* ==========================================================================
   SERVER AUTH
   ========================================================================== */

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
}

export async function getCurrentSession() {
  const supabase = await createClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
}

export async function getCurrentAuth() {
  const user = await getCurrentUser();

  return {
    user,
    profile: null,
    roles: [],
    permissions: [],
  };
}