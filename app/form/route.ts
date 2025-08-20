import { type NextRequest, NextResponse } from "next/server"
import { getUserForms, saveForm } from "@/lib/storage"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const forms = await getUserForms(userId)
    return NextResponse.json(forms)
  } catch (error) {
    console.error("Error fetching forms:", error)
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()
    const form = await saveForm(formData)
    return NextResponse.json(form)
  } catch (error) {
    console.error("Error saving form:", error)
    return NextResponse.json({ error: "Failed to save form" }, { status: 500 })
  }
}
