import { NextResponse } from "next/server"
import { insertUser, findUserByEmail } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

  const user = await findUserByEmail(email)
  return NextResponse.json(user)
}

export async function POST(req: Request) {
  const { email, name } = await req.json()
  const user = await insertUser(email, name)
  return NextResponse.json(user)
}