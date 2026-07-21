import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Skip:
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - image files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};