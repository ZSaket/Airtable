import type { FormField } from "./storage"

export interface ConditionalRule {
  fieldId: string
  operator: "equals" | "not_equals" | "contains" | "is_empty" | "is_not_empty"
  value: string
}

export function evaluateCondition(rule: ConditionalRule, formData: Record<string, any>): boolean {
  const fieldValue = formData[rule.fieldId]
  const ruleValue = rule.value

  switch (rule.operator) {
    case "equals":
      return String(fieldValue || "") === ruleValue
    case "not_equals":
      return String(fieldValue || "") !== ruleValue
    case "contains":
      return String(fieldValue || "")
        .toLowerCase()
        .includes(ruleValue.toLowerCase())
    case "is_empty":
      return !fieldValue || String(fieldValue).trim() === ""
    case "is_not_empty":
      return fieldValue && String(fieldValue).trim() !== ""
    default:
      return true
  }
}

export function shouldShowField(field: FormField, formData: Record<string, any>, allFields: FormField[]): boolean {
  if (!field.conditionalLogic?.showIf) {
    return true
  }

  return evaluateCondition(field.conditionalLogic.showIf, formData)
}

export function getVisibleFields(fields: FormField[], formData: Record<string, any>): FormField[] {
  return fields.filter((field) => shouldShowField(field, formData, fields))
}

export function getFieldsForConditions(fields: FormField[], currentFieldId?: string): FormField[] {
  return fields.filter(
    (field) =>
      field.id !== currentFieldId &&
      (field.type === "text" || field.type === "email" || field.type === "select" || field.type === "checkbox"),
  )
}
