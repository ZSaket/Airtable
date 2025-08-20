export interface AirtableUser {
  id: string
  email: string
  accessToken: string
  refreshToken?: string
}

export interface AirtableBase {
  id: string
  name: string
  permissionLevel: string
}

export interface AirtableTable {
  id: string
  name: string
  primaryFieldId: string
  fields: AirtableField[]
}

export interface AirtableField {
  id: string
  name: string
  type: string
}

export class AirtableAPI {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async getBases(): Promise<AirtableBase[]> {
    const response = await fetch("https://api.airtable.com/v0/meta/bases", {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch bases")
    }

    const data = await response.json()
    return data.bases
  }

  async getTables(baseId: string): Promise<AirtableTable[]> {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch tables")
    }

    const data = await response.json()
    return data.tables
  }

  async createRecord(baseId: string, tableId: string, fields: Record<string, any>) {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create record")
    }

    return response.json()
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch("https://api.airtable.com/v0/meta/whoami", {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })
      return response.ok
    } catch {
      return false
    }
  }
}
