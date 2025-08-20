import { type NextRequest, NextResponse } from "next/server"

const AIRTABLE_CLIENT_ID = process.env.AIRTABLE_CLIENT_ID
const AIRTABLE_CLIENT_SECRET = process.env.AIRTABLE_CLIENT_SECRET
const REDIRECT_URI = process.env.NEXT_PUBLIC_URL
  ? `${process.env.NEXT_PUBLIC_URL}/api/auth/airtable/callback`
  : `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/auth/airtable/callback`

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(`${request.nextUrl.origin}?error=airtable_auth_failed`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${request.nextUrl.origin}?error=missing_parameters`)
  }

  const storedState = request.cookies.get("airtable_oauth_state")?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${request.nextUrl.origin}?error=invalid_state`)
  }

  if (!AIRTABLE_CLIENT_ID || !AIRTABLE_CLIENT_SECRET) {
    return NextResponse.redirect(`${request.nextUrl.origin}?error=missing_config`)
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://airtable.com/oauth2/v1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: AIRTABLE_CLIENT_ID,
        client_secret: AIRTABLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token")
    }

    const tokenData = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch("https://api.airtable.com/v0/meta/whoami", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to get user info")
    }

    const userData = await userResponse.json()

    // Store token and user info in URL params for client-side handling
    const redirectUrl = new URL(request.nextUrl.origin)
    redirectUrl.searchParams.set("airtable_token", tokenData.access_token)
    redirectUrl.searchParams.set("airtable_refresh_token", tokenData.refresh_token || "")
    redirectUrl.searchParams.set("airtable_user_id", userData.id)
    redirectUrl.searchParams.set("airtable_user_email", userData.email || "")

    const response = NextResponse.redirect(redirectUrl.toString())
    response.cookies.delete("airtable_oauth_state")

    return response
  } catch (error) {
    console.error("Airtable OAuth error:", error)
    return NextResponse.redirect(`${request.nextUrl.origin}?error=token_exchange_failed`)
  }
}
