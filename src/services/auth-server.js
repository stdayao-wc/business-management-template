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

  if (!user) {
    return {
      user: null,
      profile: null,
      roles: [],
      permissions: [],
    };
  }

  const profile = await getCurrentProfile(user.id);
  const roles = await getCurrentRoles(user.id);

  return {
    user,
    profile,
    roles,
    permissions: [],
  };
}

export async function getCurrentProfile(userId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Authenticated user has no profile.");
  }

  return data;
}

export async function getCurrentRoles(userId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_roles")
    .select(`
      roles (
        id,
        name,
        description
      )
    `)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  const roles = data
    .map((row) => row.roles)
    .filter(Boolean);

  if (roles.length === 0) {
    throw new Error("Authenticated user has no assigned roles.");
  }

  return roles;
}