"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"
import type { FormField } from "@/lib/storage"
import { getFieldsForConditions } from "@/lib/conditional-logic"

interface ConditionalLogicEditorProps {
  field: FormField
  allFields: FormField[]
  onUpdate: (updates: Partial<FormField>) => void
}

export function ConditionalLogicEditor({ field, allFields, onUpdate }: ConditionalLogicEditorProps) {
  const [showEditor, setShowEditor] = useState(!!field.conditionalLogic?.showIf)
  const availableFields = getFieldsForConditions(allFields, field.id)

  const handleAddCondition = () => {
    setShowEditor(true)
    onUpdate({
      conditionalLogic: {
        showIf: {
          fieldId: "",
          operator: "equals",
          value: "",
        },
      },
    })
  }

  const handleRemoveCondition = () => {
    setShowEditor(false)
    onUpdate({
      conditionalLogic: undefined,
    })
  }

  const handleUpdateCondition = (updates: Partial<FormField["conditionalLogic"]["showIf"]>) => {
    if (!field.conditionalLogic?.showIf) return

    onUpdate({
      conditionalLogic: {
        showIf: {
          ...field.conditionalLogic.showIf,
          ...updates,
        },
      },
    })
  }

  if (!showEditor) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Conditional Logic</Label>
        <Button variant="outline" size="sm" onClick={handleAddCondition} disabled={availableFields.length === 0}>
          Add Condition
        </Button>
        {availableFields.length === 0 && (
          <p className="text-xs text-muted-foreground">Add other fields first to create conditions</p>
        )}
      </div>
    )
  }

  const selectedField = availableFields.find((f) => f.id === field.conditionalLogic?.showIf?.fieldId)

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Conditional Logic</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleRemoveCondition}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">Show this field when:</div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-xs">Field</Label>
            <Select
              value={field.conditionalLogic?.showIf?.fieldId || ""}
              onValueChange={(value) => handleUpdateCondition({ fieldId: value })}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {availableFields.map((availableField) => (
                  <SelectItem key={availableField.id} value={availableField.id}>
                    {availableField.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Condition</Label>
            <Select
              value={field.conditionalLogic?.showIf?.operator || "equals"}
              onValueChange={(value: any) => handleUpdateCondition({ operator: value })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="not_equals">Not equals</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="is_empty">Is empty</SelectItem>
                <SelectItem value="is_not_empty">Is not empty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Value</Label>
            {selectedField?.type === "select" ? (
              <Select
                value={field.conditionalLogic?.showIf?.value || ""}
                onValueChange={(value) => handleUpdateCondition({ value })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select value" />
                </SelectTrigger>
                <SelectContent>
                  {selectedField.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : selectedField?.type === "checkbox" ? (
              <Select
                value={field.conditionalLogic?.showIf?.value || ""}
                onValueChange={(value) => handleUpdateCondition({ value })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select value" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Checked</SelectItem>
                  <SelectItem value="false">Unchecked</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                className="h-8"
                value={field.conditionalLogic?.showIf?.value || ""}
                onChange={(e) => handleUpdateCondition({ value: e.target.value })}
                placeholder="Enter value"
                disabled={
                  field.conditionalLogic?.showIf?.operator === "is_empty" ||
                  field.conditionalLogic?.showIf?.operator === "is_not_empty"
                }
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
