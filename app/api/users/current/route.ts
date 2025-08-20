import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // For demo purposes, return a default user
    // In a real app, you'd get this from session/auth
    const user = await db.collection("users").findOne({ email: "demo@example.com" })

    if (!user) {
      // Create a demo user if none exists
      const newUser = {
        email: "demo@example.com",
        name: "Demo User",
        createdAt: new Date(),
      }

      const result = await db.collection("users").insertOne(newUser)
      return NextResponse.json({ id: result.insertedId.toString(), ...newUser })
    }

    return NextResponse.json({ id: user._id.toString(), ...user })
  } catch (error) {
    console.error("Error getting current user:", error)
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 })
  }
}
