import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const error = request.nextUrl.searchParams.get("error")

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=${error}`)
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=no_code`)
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
        grant_type: "authorization_code",
      }).toString(),
    })

    const tokens = await tokenResponse.json()

    if (tokens.error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=${tokens.error}`)
    }

    // Redirect to dashboard with tokens in URL (will be stored in localStorage)
    const redirectUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)
    redirectUrl.searchParams.append("access_token", tokens.access_token)
    redirectUrl.searchParams.append("refresh_token", tokens.refresh_token || "")
    redirectUrl.searchParams.append("expires_in", tokens.expires_in)

    return NextResponse.redirect(redirectUrl.toString())
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=auth_failed`)
  }
}
