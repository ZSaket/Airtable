import { type NextRequest, NextResponse } from "next/server"
import { AirtableAPI } from "@/lib/airtable"
import { getCurrentUser, getForm } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { formId, submissionData } = await request.json()

    if (!formId || !submissionData) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    // Get form details
    const form = getForm(formId)
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Get user and check Airtable connection
    const user = getCurrentUser()
    if (!user?.airtableToken || !user.airtableBaseId || !user.airtableTableId) {
      return NextResponse.json({ error: "Airtable not configured" }, { status: 400 })
    }

    // Initialize Airtable API
    const airtableAPI = new AirtableAPI(user.airtableToken)

    // Prepare data for Airtable (convert field IDs to labels)
    const airtableData: Record<string, any> = {}

    Object.entries(submissionData).forEach(([fieldId, value]) => {
      const field = form.fields.find((f) => f.id === fieldId)
      if (field) {
        airtableData[field.label] = value
      }
    })

    // Add metadata
    airtableData["Form Name"] = form.title
    airtableData["Submitted At"] = new Date().toISOString()

    // Create record in Airtable
    const result = await airtableAPI.createRecord(user.airtableBaseId, user.airtableTableId, airtableData)

    return NextResponse.json({ success: true, recordId: result.id })
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json({ error: "Failed to sync to Airtable" }, { status: 500 })
  }
}
