import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SESSION_COOKIE = "curevo_session"

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value)

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("from", `${pathname}${search}`)

  if (!hasSessionCookie) return NextResponse.redirect(loginUrl)

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin-dashboard/:path*",
    "/profile/:path*",
  ],
}
