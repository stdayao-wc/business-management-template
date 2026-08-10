import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/signup"];

export async function updateSession(request) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session and get the current user.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("=== Middleware ===");
  console.log("Path:", request.nextUrl.pathname);
  console.log("User:", user?.email ?? "NOT LOGGED IN");

  const pathname = request.nextUrl.pathname;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Logged in users should not access public routes.
  if (isPublicRoute && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Logged out users cannot access protected routes.
  if (!isPublicRoute && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  console.log("Middleware User:", user?.email);
  return response;
}