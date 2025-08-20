import { type NextRequest, NextResponse } from "next/server"
import { saveSubmission, getFormSubmissions } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { formId, data } = await request.json()
    const submission = await saveSubmission(formId, data)
    return NextResponse.json(submission)
  } catch (error) {
    console.error("Error saving submission:", error)
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get("formId")

    if (!formId) {
      return NextResponse.json({ error: "Form ID required" }, { status: 400 })
    }

    const submissions = await getFormSubmissions(formId)
    return NextResponse.json(submissions)
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}
