import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const updates = await request.json()

    const result = await db
      .collection("users")
      .findOneAndUpdate(
        { _id: new ObjectId(params.id) },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: "after" },
      )

    if (!result || !result.value) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ id: result.value._id.toString(), ...result.value })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
