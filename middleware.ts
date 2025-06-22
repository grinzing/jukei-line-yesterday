import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This middleware ensures that the webhook endpoint is properly handled
export function middleware(request: NextRequest) {
  // You can add additional security or logging here if needed
  return NextResponse.next()
}

// Only run middleware on the webhook path
export const config = {
  matcher: "/api/webhook",
}
