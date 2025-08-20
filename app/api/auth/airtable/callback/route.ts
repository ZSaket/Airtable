import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

const AIRTABLE_CLIENT_ID = process.env.AIRTABLE_CLIENT_ID
const AIRTABLE_CLIENT_SECRET = process.env.AIRTABLE_CLIENT_SECRET
const REDIRECT_URI = process.env.AIRTABLE_REDIRECT_URI || "http://localhost:3000/auth/airtable/callback"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(`${APP_URL}?error=airtable_auth_failed`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${APP_URL}?error=missing_parameters`)
  }

  const storedState = request.cookies.get("airtable_oauth_state")?.value
  const codeVerifier = request.cookies.get("airtable_code_verifier")?.value

  if (!storedState || storedState !== state || !codeVerifier) {
    return NextResponse.redirect(`${APP_URL}?error=invalid_state`)
  }

  if (!AIRTABLE_CLIENT_ID) {
    return NextResponse.redirect(`${APP_URL}?error=missing_config`)
  }

  try {
    // Exchange code for access token using PKCE
    const tokenParams = new URLSearchParams({
      client_id: AIRTABLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code,
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
    })

    // Add client secret if available (recommended for server-side)
    if (AIRTABLE_CLIENT_SECRET) {
      tokenParams.set("client_secret", AIRTABLE_CLIENT_SECRET)
    }

    const tokenResponse = await fetch("https://airtable.com/oauth2/v1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams,
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error("Token exchange failed:", errorData)
      throw new Error("Failed to exchange code for token")
    }

    const tokenData = await tokenResponse.json()

    // Get user info from Airtable
    const userResponse = await fetch("https://api.airtable.com/v0/meta/whoami", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to get user info")
    }

    const userData = await userResponse.json()

    // Store/update user in database
    const { db } = await connectToDatabase()

    const userUpdate = {
      email: userData.email || `airtable_${userData.id}@example.com`,
      name: userData.name || "Airtable User",
      airtableToken: tokenData.access_token,
      airtableRefreshToken: tokenData.refresh_token,
      airtableUserId: userData.id,
      updatedAt: new Date(),
    }

    const result = await db.collection("users").findOneAndUpdate(
      { email: userUpdate.email },
      {
        $set: userUpdate,
        $setOnInsert: { createdAt: new Date() },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    )

    const user = result.value
    if (!user) {
      throw new Error("Failed to create/update user")
    }

    const redirectUrl = new URL(APP_URL)
    redirectUrl.searchParams.set("auth_success", "true")
    redirectUrl.searchParams.set("user_id", user._id.toString())

    const response = NextResponse.redirect(redirectUrl.toString())

    // Clean up OAuth cookies
    response.cookies.delete("airtable_oauth_state")
    response.cookies.delete("airtable_code_verifier")

    return response
  } catch (error) {
    console.error("Airtable OAuth error:", error)
    return NextResponse.redirect(`${APP_URL}?error=token_exchange_failed`)
  }
}
