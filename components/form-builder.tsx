"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, GripVertical } from "lucide-react"
import { saveForm, type Form, type FormField } from "@/lib/storage"
import { ConditionalLogicEditor } from "@/components/conditional-logic-editor"

interface FormBuilderProps {
  userId: string
  onSave: () => void
  editingForm?: Form
}

export function FormBuilder({ userId, onSave, editingForm }: FormBuilderProps) {
  const [title, setTitle] = useState(editingForm?.title || "")
  const [description, setDescription] = useState(editingForm?.description || "")
  const [fields, setFields] = useState<FormField[]>(editingForm?.fields || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addField = (type: FormField["type"]) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `New ${type} field`,
      required: false,
    }

    if (type === "select") {
      newField.options = ["Option 1", "Option 2"]
    }

    setFields([...fields, newField])
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)))
  }

  const removeField = (fieldId: string) => {
    setFields(fields.filter((field) => field.id !== fieldId))
  }

  const handleSave = async () => {
    if (!title.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const form: Form = {
        id: editingForm?.id || crypto.randomUUID(),
        userId,
        title: title.trim(),
        description: description.trim(),
        fields,
        createdAt: editingForm?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await saveForm(form)
      onSave()
    } catch (err) {
      console.error("Failed to save form:", err)
      setError("Failed to save form. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Form Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Form Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter form title" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter form description"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <Badge variant="secondary">{field.type}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeField(field.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Field Label</Label>
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="Enter field label"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id={`required-${field.id}`}
                      checked={field.required}
                      onCheckedChange={(checked) => updateField(field.id, { required: !!checked })}
                    />
                    <Label htmlFor={`required-${field.id}`}>Required</Label>
                  </div>
                </div>

                {field.type === "select" && (
                  <div>
                    <Label>Options (one per line)</Label>
                    <Textarea
                      value={field.options?.join("\n") || ""}
                      onChange={(e) =>
                        updateField(field.id, {
                          options: e.target.value.split("\n").filter((opt) => opt.trim()),
                        })
                      }
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      rows={3}
                    />
                  </div>
                )}

                <ConditionalLogicEditor
                  field={field}
                  allFields={fields}
                  onUpdate={(updates) => updateField(field.id, updates)}
                />
              </div>
            ))}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => addField("text")}>
                <Plus className="w-4 h-4 mr-2" />
                Text Field
              </Button>
              <Button variant="outline" onClick={() => addField("email")}>
                <Plus className="w-4 h-4 mr-2" />
                Email Field
              </Button>
              <Button variant="outline" onClick={() => addField("select")}>
                <Plus className="w-4 h-4 mr-2" />
                Select Field
              </Button>
              <Button variant="outline" onClick={() => addField("textarea")}>
                <Plus className="w-4 h-4 mr-2" />
                Textarea
              </Button>
              <Button variant="outline" onClick={() => addField("checkbox")}>
                <Plus className="w-4 h-4 mr-2" />
                Checkbox
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onSave}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!title.trim() || isLoading}>
          {isLoading ? "Saving..." : editingForm ? "Update Form" : "Save Form"}
        </Button>
      </div>
    </div>
  )
}
