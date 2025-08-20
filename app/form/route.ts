import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const forms = await db.collection("forms").find({ userId }).toArray()

    const formsWithId = forms.map((form) => ({
      ...form,
      id: form._id.toString(),
      _id: undefined,
    }))

    return NextResponse.json(formsWithId)
  } catch (error) {
    console.error("Error fetching forms:", error)
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()
    console.log("[v0] Creating form with data:", { ...formData, fields: `${formData.fields?.length || 0} fields` })

    const { db } = await connectToDatabase()

    const now = new Date().toISOString()
    const form = {
      ...formData,
      createdAt: now,
      updatedAt: now,
      // Remove client-generated ID to let MongoDB generate ObjectId
      _id: undefined,
      id: undefined,
    }

    const result = await db.collection("forms").insertOne(form)
    console.log("[v0] Form created with MongoDB ID:", result.insertedId.toString())

    const savedForm = {
      ...form,
      id: result.insertedId.toString(),
    }

    return NextResponse.json(savedForm)
  } catch (error) {
    console.error("[v0] Error saving form:", error)
    return NextResponse.json(
      {
        error: "Failed to save form",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
