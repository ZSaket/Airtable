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

export async function createUser(email: string, name: string) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  })
  if (!res.ok) throw new Error("Failed to create user")
  return res.json()
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const response = await fetch(`${baseUrl}/api/users?email=${encodeURIComponent(email)}`)
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

export async function saveForm(
  form: Omit<Form, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<Form> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const method = form.id ? "PUT" : "POST"
  const url = form.id ? `${baseUrl}/api/forms/${form.id}` : `${baseUrl}/api/forms`


  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to save form: ${response.status} ${errorText}`)
  }

  return response.json()
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

export function getCurrentUser(): User | null {
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
