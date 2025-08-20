import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"



export async function GET() {
  return NextResponse.json({ message: "Forms API is working" })
}

export async function POST() {
  return NextResponse.json({ message: "POST to forms API is working" })
}

// export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     console.log("[v0] GET /api/forms/[id] - params:", params)

//     if (!params.id) {
//       return NextResponse.json({ error: "Form ID is required" }, { status: 400 })
//     }

//     if (!ObjectId.isValid(params.id)) {
//       return NextResponse.json({ error: "Invalid form ID format" }, { status: 400 })
//     }

//     const { db } = await connectToDatabase()
//     const form = await db.collection("forms").findOne({ _id: new ObjectId(params.id) })

//     if (!form) {
//       return NextResponse.json({ error: "Form not found" }, { status: 404 })
//     }

//     const formWithId = {
//       ...form,
//       id: form._id.toString(),
//       _id: undefined,
//     }

//     return NextResponse.json(formWithId)
//   } catch (error) {
//     console.error("[v0] Error fetching form:", error)
//     return NextResponse.json({ error: "Failed to fetch form" }, { status: 500 })
//   }
// }

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] PUT /api/forms/[id] - params:", params)

    if (!params.id) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 })
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid form ID format" }, { status: 400 })
    }

    const formData = await request.json()
    console.log("[v0] Form data received:", { ...formData, fields: `${formData.fields?.length || 0} fields` })

    const { db } = await connectToDatabase()

    const updateData = {
      ...formData,
      updatedAt: new Date().toISOString(),
      _id: undefined,
      id: undefined,
    }

    const result = await db.collection("forms").updateOne({ _id: new ObjectId(params.id) }, { $set: updateData })
    console.log("[v0] Update result:", result)

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    const updatedForm = await db.collection("forms").findOne({ _id: new ObjectId(params.id) })
    const formWithId = {
      ...updatedForm,
      id: updatedForm._id.toString(),
      _id: undefined,
    }

    console.log("[v0] Form updated successfully:", formWithId.id)
    return NextResponse.json(formWithId)
  } catch (error) {
    console.error("[v0] Error updating form:", error)
    return NextResponse.json({ error: "Failed to update form", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] DELETE /api/forms/[id] - params:", params)

    if (!params.id) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 })
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid form ID format" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const result = await db.collection("forms").deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    console.log("[v0] Form deleted successfully:", params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting form:", error)
    return NextResponse.json({ error: "Failed to delete form", details: error.message }, { status: 500 })
  }
}
