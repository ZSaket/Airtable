"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getCurrentUser, setCurrentUser, type User } from "@/lib/storage"
import { CheckCircle, AlertCircle, ExternalLink } from "lucide-react"

interface AirtableSettingsProps {
  onClose: () => void
}

export function AirtableSettings({ onClose }: AirtableSettingsProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [baseId, setBaseId] = useState("")
  const [tableId, setTableId] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleConnect = async () => {
    setIsConnecting(true)

    // Simulate OAuth flow delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (user) {
      // Mock Airtable token
      const updatedUser: User = {
        ...user,
        airtableToken: `mock_token_${Date.now()}`,
      }

      setCurrentUser(updatedUser)
      setUser(updatedUser)
      setShowSuccess(true)

      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    }

    setIsConnecting(false)
  }

  const handleDisconnect = () => {
    if (user) {
      const updatedUser: User = {
        ...user,
        airtableToken: undefined,
      }

      setCurrentUser(updatedUser)
      setUser(updatedUser)
    }
  }

  const isConnected = user?.airtableToken

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                Airtable Integration
                {isConnected && <CheckCircle className="h-5 w-5 text-green-600" />}
              </CardTitle>
              <CardDescription>Connect your Airtable account to sync form responses</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">Successfully connected to Airtable!</AlertDescription>
            </Alert>
          )}

          {!isConnected ? (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You'll be redirected to Airtable to authorize access to your bases and tables.
                </AlertDescription>
              </Alert>

              <Button onClick={handleConnect} disabled={isConnecting} className="w-full bg-blue-600 hover:bg-blue-700">
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Connecting to Airtable...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Connect Airtable Account
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Connected to Airtable</span>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-300">
                  Active
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="baseId">Default Base ID (Optional)</Label>
                  <Input
                    id="baseId"
                    value={baseId}
                    onChange={(e) => setBaseId(e.target.value)}
                    placeholder="appXXXXXXXXXXXXXX"
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="tableId">Default Table ID (Optional)</Label>
                  <Input
                    id="tableId"
                    value={tableId}
                    onChange={(e) => setTableId(e.target.value)}
                    placeholder="tblXXXXXXXXXXXXXX"
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDisconnect} className="flex-1 bg-transparent">
                  Disconnect
                </Button>
                <Button onClick={onClose} className="flex-1">
                  Save Settings
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
