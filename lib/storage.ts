export interface User {
  id: string
  email: string
  name: string
  airtableToken?: string
  airtableBaseId?: string
  airtableTableId?: string
  createdAt: string
}

export interface FormField {
  id: string
  type: "text" | "email" | "number" | "select" | "checkbox" | "textarea"
  label: string
  required: boolean
  options?: string[] // for select fields
  conditionalLogic?: {
    showIf: {
      fieldId: string
      operator: "equals" | "not_equals" | "contains"
      value: string
    }
  }
}

export interface Form {
  id: string
  userId: string
  title: string
  description: string
  fields: FormField[]
  airtableBaseId?: string
  airtableTableId?: string
  createdAt: string
  updatedAt: string
}

export interface FormSubmission {
  id: string
  formId: string
  data: Record<string, any>
  submittedAt: string
  synced: boolean
}

export async function createUser(email: string, name: string): Promise<User> {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  })

  if (!response.ok) throw new Error("Failed to create user")
  return response.json()
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`)
  if (!response.ok) return null
  return response.json()
}

export async function getUserById(id: string): Promise<User | null> {
  const response = await fetch(`/api/users/${id}`)
  if (!response.ok) return null
  return response.json()
}

export async function updateUserAirtableSettings(
  userId: string,
  settings: { baseId?: string; tableId?: string; token?: string },
): Promise<User | null> {
  const response = await fetch(`/api/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  })

  if (!response.ok) return null
  return response.json()
}

export async function getUserForms(userId: string): Promise<Form[]> {
  const response = await fetch(`/api/forms?userId=${userId}`)
  if (!response.ok) return []
  return response.json()
}

export async function getForm(formId: string): Promise<Form | null> {
  const response = await fetch(`/api/forms/${formId}`)
  if (!response.ok) return null
  return response.json()
}

export async function saveForm(form: Omit<Form, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<Form> {
  // Determine if this is an update (has valid MongoDB ObjectId) or create (new form)
  const isUpdate = form.id && form.id.length === 24 && /^[0-9a-fA-F]{24}$/.test(form.id)
  const method = isUpdate ? "PUT" : "POST"
  const url = isUpdate ? `/api/forms/${form.id}` : "/api/forms"

  console.log("[v0] Saving form:", { method, url, formId: form.id, title: form.title, isUpdate })

  // For POST requests, remove any client-side ID to let MongoDB generate it
  const formToSave = {
    ...form,
    ...(method === "POST" && { id: undefined })
  }

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formToSave),
    })

    console.log("[v0] Response status:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Save form error response:", errorText)

      let errorMessage = `Failed to save form: ${response.status} ${response.statusText}`
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.error || errorMessage
      } catch {
        if (errorText.includes("404") || errorText.includes("This page could not be found")) {
          errorMessage = "API endpoint not found. Please check if MongoDB is connected and API routes are working."
        } else if (errorText.includes("500")) {
          errorMessage = "Server error. Please check MongoDB connection and server logs."
        }
      }

      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log("[v0] Form saved successfully:", result.id)
    return result
  } catch (error) {
    console.error("[v0] Save form error:", error)
    throw error
  }
}

export async function deleteForm(formId: string): Promise<void> {
  const response = await fetch(`/api/forms/${formId}`, { method: "DELETE" })
  if (!response.ok) throw new Error("Failed to delete form")
}

export async function saveSubmission(formId: string, data: Record<string, any>): Promise<FormSubmission> {
  const response = await fetch("/api/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formId, data }),
  })

  if (!response.ok) throw new Error("Failed to save submission")
  return response.json()
}

export async function getFormSubmissions(formId: string): Promise<FormSubmission[]> {
  const response = await fetch(`/api/submissions?formId=${formId}`)
  if (!response.ok) return []
  return response.json()
}

export async function markSubmissionSynced(submissionId: string): Promise<void> {
  const response = await fetch(`/api/submissions/${submissionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ synced: true }),
  })

  if (!response.ok) throw new Error("Failed to mark submission as synced")
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/users/current")
    if (!response.ok) return null
    return response.json()
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export function getCurrentUserFromStorage(): User | null {
  if (typeof window === "undefined") return null
  const userData = localStorage.getItem("formbuilder_current_user")
  return userData ? JSON.parse(userData) : null
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem("formbuilder_current_user", JSON.stringify(user))
  } else {
    localStorage.removeItem("formbuilder_current_user")
  }
}
