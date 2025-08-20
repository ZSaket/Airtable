"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCurrentUser, setCurrentUser, createUser, type User } from "@/lib/storage"
import { FormBuilder } from "@/components/form-builder"
import { FormList } from "@/components/form-list"
import { AirtableSettings } from "@/components/airtable-settings"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [currentView, setCurrentView] = useState<"dashboard" | "builder">("dashboard")
  const [showAirtableSettings, setShowAirtableSettings] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()

    if (currentUser) {
      // Check for Airtable OAuth callback parameters
      const urlParams = new URLSearchParams(window.location.search)
      const airtableToken = urlParams.get("airtable_token")
      const airtableRefreshToken = urlParams.get("airtable_refresh_token")
      const airtableUserId = urlParams.get("airtable_user_id")
      const airtableUserEmail = urlParams.get("airtable_user_email")

      if (airtableToken) {
        const updatedUser = {
          ...currentUser,
          airtableToken,
          airtableRefreshToken,
          airtableUserId,
          airtableUserEmail,
        }
        setCurrentUser(updatedUser)
        setUser(updatedUser)

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      } else {
        setUser(currentUser)
      }
    }

    setIsLoading(false)
  }, []) // Empty dependency array - only run once on mount

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !name) return

    const newUser = await createUser(email, name)
    setCurrentUser(newUser)
    setUser(newUser)
    setShowLogin(false)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setUser(null)
    setCurrentView("dashboard")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Form Builder</CardTitle>
            <CardDescription>Create dynamic forms with Airtable integration</CardDescription>
          </CardHeader>
          <CardContent>
            {!showLogin ? (
              <div className="space-y-4">
                <Button onClick={() => setShowLogin(true)} className="w-full bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
                <p className="text-sm text-gray-600 text-center">
                  Build forms with conditional logic and sync responses to Airtable
                </p>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Continue
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowLogin(false)}>
                    Back
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Form Builder</h1>
            </div>
            <div className="flex items-center gap-4">
              {user?.airtableToken ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Airtable Connected
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowAirtableSettings(true)}>
                    Settings
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowAirtableSettings(true)}>
                  Connect Airtable
                </Button>
              )}
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "dashboard" ? (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Forms</h2>
                <p className="text-gray-600">Create and manage your dynamic forms</p>
              </div>
              <Button onClick={() => setCurrentView("builder")} className="bg-blue-600 hover:bg-blue-700">
                Create New Form
              </Button>
            </div>
            <FormList userId={user.id} onEditForm={() => setCurrentView("builder")} />
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <Button variant="outline" onClick={() => setCurrentView("dashboard")}>
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">Form Builder</h2>
            </div>
            <FormBuilder userId={user.id} onSave={() => setCurrentView("dashboard")} />
          </div>
        )}
      </main>

      {showAirtableSettings && <AirtableSettings onClose={() => setShowAirtableSettings(false)} />}
    </div>
  )
}
