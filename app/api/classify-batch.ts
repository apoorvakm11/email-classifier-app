import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

interface Email {
  id: string
  from: string
  subject: string
  snippet?: string
}

interface BatchClassificationResult {
  id: string
  category: string
  confidence: number
}

const CATEGORIES = ["Important", "Promotions", "Social", "Marketing", "Spam", "General"]

export async function POST(request: NextRequest) {
  try {
    const { emails } = await request.json()

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "Invalid emails" }, { status: 400 })
    }

    const emailSummaries = emails
      .map((email: Email, idx: number) => `${idx + 1}. From: ${email.from} | Subject: ${email.subject}`)
      .join("\n")

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: `You are an expert email classifier. Classify each email into one of these categories: ${CATEGORIES.join(", ")}.

Respond in JSON format with an array of objects:
[
  { "index": 1, "category": "category_name", "confidence": 0.0-1.0 },
  ...
]

Guidelines:
- Important: Urgent, from colleagues/managers, critical information
- Promotions: Sales, discounts, marketing offers
- Social: Social media, notifications, friend requests
- Marketing: Company announcements, product updates
- Spam: Unsolicited, phishing, suspicious
- General: Regular correspondence, receipts, confirmations`,
      prompt: `Classify these emails:\n\n${emailSummaries}`,
      temperature: 0.3,
      maxTokens: 500,
    })

    // Parse the response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse classification response" }, { status: 500 })
    }

    const results = JSON.parse(jsonMatch[0])

    // Map results back to email IDs
    const classifications: BatchClassificationResult[] = results.map((result: any, idx: number) => ({
      id: emails[idx].id,
      category: CATEGORIES.includes(result.category) ? result.category : "General",
      confidence: Math.min(Math.max(result.confidence || 0.5, 0), 1),
    }))

    return NextResponse.json({ classifications })
  } catch (error) {
    console.error("Batch classification error:", error)
    return NextResponse.json({ error: "Batch classification failed" }, { status: 500 })
  }
}
