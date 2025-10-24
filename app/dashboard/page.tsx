"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { EmailStats } from "@/components/email-stats"
import { EmailListItem } from "@/components/email-list-item"
import { ClassificationProgress } from "@/components/classification-progress"
import { CategoryDistribution } from "@/components/category-distribution"
import { LogOut, RefreshCw, Zap, Search } from "lucide-react"

interface Email {
  id: string
  from: string
  subject: string
  snippet: string
  category?: string
  confidence?: number
  priority?: "high" | "medium" | "low"
  actionRequired?: boolean
  internalDate: string
}

export default function Dashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(false)
  const [classifying, setClassifying] = useState(false)
  const [openaiKey, setOpenaiKey] = useState("")
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [userEmail, setUserEmail] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())

  const categories = ["All", "Important", "Promotions", "Social", "Marketing", "Spam", "General", "Unclassified"]

  useEffect(() => {
    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")

    if (accessToken) {
      localStorage.setItem("access_token", accessToken)
      if (refreshToken) localStorage.setItem("refresh_token", refreshToken)
      window.history.replaceState({}, document.title, "/dashboard")
    }

    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/")
      return
    }

    const savedKey = localStorage.getItem("openai_key")
    if (savedKey) {
      setOpenaiKey(savedKey)
    } else {
      setShowKeyInput(true)
    }

    fetchUserInfo(token)
    fetchEmails(token)
  }, [searchParams, router])

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setUserEmail(data.email)
    } catch (err) {
      console.error("Failed to fetch user info:", err)
    }
  }

  const fetchEmails = async (token: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=20", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to fetch emails")

      const data = await response.json()
      const messageIds = data.messages || []

      const emailDetails = await Promise.all(
        messageIds.map(async (msg: any) => {
          const msgResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const msgData = await msgResponse.json()
          const headers = msgData.payload.headers

          return {
            id: msg.id,
            from: headers.find((h: any) => h.name === "From")?.value || "Unknown",
            subject: headers.find((h: any) => h.name === "Subject")?.value || "(No Subject)",
            snippet: msgData.snippet,
            internalDate: msgData.internalDate,
          }
        }),
      )

      const savedEmails = localStorage.getItem("classified_emails")
      const classified = savedEmails ? JSON.parse(savedEmails) : {}

      const enrichedEmails = emailDetails.map((email: Email) => ({
        ...email,
        category: classified[email.id]?.category || "Unclassified",
        confidence: classified[email.id]?.confidence || 0,
        priority: classified[email.id]?.priority || "medium",
        actionRequired: classified[email.id]?.actionRequired || false,
      }))

      setEmails(enrichedEmails)
    } catch (err) {
      setError("Failed to fetch emails. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const classifyEmails = useCallback(async () => {
    if (!openaiKey) {
      setError("Please enter your OpenAI API key")
      setShowKeyInput(true)
      return
    }

    const unclassified = emails.filter((e) => e.category === "Unclassified")
    if (unclassified.length === 0) {
      setError("All emails are already classified")
      return
    }

    setClassifying(true)
    setError(null)

    try {
      const response = await fetch("/api/classify-advanced", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-openai-key": openaiKey,
        },
        body: JSON.stringify({ emails: unclassified }),
      })

      if (!response.ok) throw new Error("Classification failed")

      const { classifications } = await response.json()

      const classified: Record<string, any> = {}
      classifications.forEach((email: any) => {
        classified[email.id] = {
          category: email.category,
          confidence: email.confidence,
          priority: email.priority,
          actionRequired: email.actionRequired,
        }
      })

      localStorage.setItem("classified_emails", JSON.stringify(classified))

      setEmails((prev) =>
        prev.map((email) => ({
          ...email,
          category: classified[email.id]?.category || email.category,
          confidence: classified[email.id]?.confidence || email.confidence,
          priority: classified[email.id]?.priority || email.priority,
          actionRequired: classified[email.id]?.actionRequired || email.actionRequired,
        })),
      )
    } catch (err) {
      setError("Failed to classify emails. Check your OpenAI key.")
      console.error(err)
    } finally {
      setClassifying(false)
    }
  }, [emails, openaiKey])

  const handleSaveKey = () => {
    if (openaiKey.trim()) {
      localStorage.setItem("openai_key", openaiKey)
      setShowKeyInput(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    router.push("/")
  }

  const handleSelectEmail = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedEmails)
    if (selected) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedEmails(newSelected)
  }

  const categoryStats = emails.reduce(
    (acc, email) => {
      const cat = email.category || "Unclassified"
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const classifiedCount = emails.filter((e) => e.category !== "Unclassified").length
  const unclassifiedCount = emails.filter((e) => e.category === "Unclassified").length

  const filteredEmails = emails.filter((email) => {
    const matchesCategory = selectedCategory === "All" || email.category === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Email Classifier</h1>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-foreground border-border hover:bg-muted bg-transparent gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* OpenAI Key Input */}
        {showKeyInput && (
          <Card className="mb-6 p-6 border-2 border-primary/20 bg-primary/5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">OpenAI API Key</label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSaveKey} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Save
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 p-4 bg-destructive/10 border border-destructive/30">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {/* Stats Cards */}
        <EmailStats
          totalEmails={emails.length}
          classifiedEmails={classifiedCount}
          unclassifiedEmails={unclassifiedCount}
          categories={categoryStats}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <Button
            onClick={() => fetchEmails(localStorage.getItem("access_token")!)}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Fetching..." : "Refresh Emails"}
          </Button>
          <Button
            onClick={classifyEmails}
            disabled={classifying || emails.length === 0}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <Zap className={`w-4 h-4 ${classifying ? "animate-pulse" : ""}`} />
            {classifying ? "Classifying..." : "Classify Emails"}
          </Button>
          <Button
            onClick={() => setShowKeyInput(!showKeyInput)}
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
          >
            {showKeyInput ? "Hide" : "Change"} API Key
          </Button>
        </div>

        {/* Classification Progress */}
        {unclassifiedCount > 0 && (
          <ClassificationProgress total={emails.length} classified={classifiedCount} isClassifying={classifying} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Email List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search and Filter */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    className={
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "border-border text-foreground hover:bg-muted"
                    }
                  >
                    {cat}
                    {categoryStats[cat] && <span className="ml-2 text-xs opacity-70">({categoryStats[cat]})</span>}
                  </Button>
                ))}
              </div>
            </div>

            {/* Email List */}
            <div className="space-y-3">
              {filteredEmails.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {emails.length === 0 ? "No emails found" : "No emails match your filters"}
                  </p>
                </Card>
              ) : (
                filteredEmails.map((email) => (
                  <EmailListItem
                    key={email.id}
                    id={email.id}
                    from={email.from}
                    subject={email.subject}
                    snippet={email.snippet}
                    category={email.category || "Unclassified"}
                    confidence={email.confidence}
                    priority={email.priority}
                    actionRequired={email.actionRequired}
                    isSelected={selectedEmails.has(email.id)}
                    onSelect={handleSelectEmail}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar - Distribution Chart */}
          <div className="lg:col-span-1">
            <CategoryDistribution categories={categoryStats} />
          </div>
        </div>
      </main>
    </div>
  )
}
