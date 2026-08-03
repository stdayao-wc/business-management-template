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

  const roleIds = roles.map(({ id }) => id);

  const permissions = await getCurrentPermissions(roleIds);

  return {
    user,
    profile,
    roles,
    permissions,
  };
}

/* ==========================================================================
   AUTHORIZATION
   ========================================================================== */

import { notFound } from "next/navigation";

export async function requirePermission(permission) {
  const auth = await getCurrentAuth();

  const hasPermission = auth.permissions.includes(permission);

  if (!hasPermission) {
    notFound();
  }

  return auth;
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

/* ==========================================================================
   PERMISSIONS
   ========================================================================== */

export async function getCurrentPermissions(roleIds) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("role_permissions")
    .select(`
      permissions (
        name
      )
    `)
    .in("role_id", roleIds);

  if (error) {
    throw error;
  }

  return [
    ...new Set(
      data
        .map(({ permissions }) => permissions?.name)
        .filter(Boolean)
    ),
  ];
}