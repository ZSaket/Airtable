import { NextResponse } from "next/server"
import { generateCodeVerifier, generateCodeChallenge } from "@/lib/oauth-pkce"

const AIRTABLE_CLIENT_ID = process.env.AIRTABLE_CLIENT_ID
const REDIRECT_URI = process.env.AIRTABLE_REDIRECT_URI || "http://localhost:3000/auth/airtable/callback"

export async function GET() {
  if (!AIRTABLE_CLIENT_ID) {
    return NextResponse.json({ error: "Airtable client ID not configured" }, { status: 500 })
  }

  const state = crypto.randomUUID()
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  const authUrl = new URL("https://airtable.com/oauth2/v1/authorize")

  authUrl.searchParams.set("client_id", AIRTABLE_CLIENT_ID)
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("scope", "data.records:read data.records:write schema.bases:read")
  authUrl.searchParams.set("state", state)
  authUrl.searchParams.set("code_challenge", codeChallenge)
  authUrl.searchParams.set("code_challenge_method", "S256")

  const response = NextResponse.redirect(authUrl.toString())

  // Store state and code verifier securely
  response.cookies.set("airtable_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  })

  response.cookies.set("airtable_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  })

  return response
}
