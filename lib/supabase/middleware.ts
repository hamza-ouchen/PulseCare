import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnvironment } from "./env";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const isLoginRoute = request.nextUrl.pathname === "/login";
  const isDashboardRoute = request.nextUrl.pathname === "/dashboard"
    || request.nextUrl.pathname.startsWith("/dashboard/");
  const isPatientRoute = request.nextUrl.pathname === "/patient"
    || request.nextUrl.pathname.startsWith("/patient/");
  const isStationRoute = ["/patients", "/alerts", "/records", "/environment"].some((route) =>
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`),
  );
  const isProtectedRoute = isDashboardRoute || isPatientRoute || isStationRoute;
  const hasAuthCookie = request.cookies.getAll().some(({ name }) =>
    /^sb-.*-auth-token(?:\.\d+)?$/.test(name),
  );

  if (!hasAuthCookie) {
    if (isProtectedRoute) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  const { url, publishableKey } = getSupabaseEnvironment();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user && isProtectedRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (user && isLoginRoute) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
