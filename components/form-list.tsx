"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getUserForms, deleteForm, type Form } from "@/lib/storage"
import { Trash2, ExternalLink, Edit } from "lucide-react"

interface FormListProps {
  userId: string
  onEditForm: (formId?: string) => void
}

export function FormList({ userId, onEditForm }: FormListProps) {
  const [forms, setForms] = useState<Form[]>([])

  useEffect(() => {
    const fetchForms = async () => {
      const userForms = await getUserForms(userId)
      setForms(userForms)
    }
    fetchForms()
  }, [userId])

  const handleDelete = (formId: string) => {
    if (confirm("Are you sure you want to delete this form?")) {
      deleteForm(formId)
      setForms(forms.filter((form) => form.id !== formId))
    }
  }

  const handleViewForm = (formId: string) => {
    window.open(`/form/${formId}`, "_blank")
  }

  if (forms.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
          <p className="text-gray-600 mb-4">Create your first form to get started</p>
          <Button onClick={() => onEditForm()} className="bg-blue-600 hover:bg-blue-700">
            Create Your First Form
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {forms.map((form) => (
        <Card key={form.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg">{form.title}</CardTitle>
                <CardDescription className="mt-1">{form.description || "No description"}</CardDescription>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEditForm(form.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(form.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Fields:</span>
                <Badge variant="secondary">{form.fields.length}</Badge>
              </div>

              {form.airtableBaseId && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Airtable:</span>
                  <Badge variant="outline" className="text-green-600">
                    Connected
                  </Badge>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleViewForm(form.id)} className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Form
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
