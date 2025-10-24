import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

interface Email {
  id: string
  from: string
  subject: string
  snippet?: string
}

interface ClassificationResult {
  id: string
  from: string
  subject: string
  snippet?: string
  category: string
  confidence: number
  reasoning: string
}

const CATEGORIES = ["Important", "Promotions", "Social", "Marketing", "Spam", "General"]

export async function POST(request: NextRequest) {
  try {
    const { emails } = await request.json()

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json({ error: "Invalid emails" }, { status: 400 })
    }

    const classifications = await Promise.all(
      emails.map(async (email: Email): Promise<ClassificationResult> => {
        try {
          const emailContent = `
From: ${email.from}
Subject: ${email.subject}
Preview: ${email.snippet || "No preview available"}
          `.trim()

          const { text } = await generateText({
            model: "openai/gpt-4o-mini",
            system: `You are an expert email classifier. Analyze the given email and classify it into one of these categories: ${CATEGORIES.join(", ")}.

Respond in JSON format with the following structure:
{
  "category": "one of the categories",
  "confidence": 0.0 to 1.0,
  "reasoning": "brief explanation of why this category was chosen"
}

Consider these guidelines:
- Important: Emails from colleagues, managers, or containing urgent/critical information
- Promotions: Marketing emails, sales offers, discounts, newsletters
- Social: Social media notifications, friend requests, comments
- Marketing: Marketing campaigns, product updates, company announcements
- Spam: Unsolicited emails, phishing attempts, suspicious content
- General: Regular correspondence, receipts, confirmations`,
            prompt: emailContent,
            temperature: 0.3,
            maxTokens: 200,
          })

          // Parse the response
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (!jsonMatch) {
            return {
              ...email,
              category: "General",
              confidence: 0.5,
              reasoning: "Unable to parse classification response",
            }
          }

          const result = JSON.parse(jsonMatch[0])

          // Validate category
          const validCategory = CATEGORIES.includes(result.category) ? result.category : "General"
          const confidence = Math.min(Math.max(result.confidence || 0.5, 0), 1)

          return {
            ...email,
            category: validCategory,
            confidence,
            reasoning: result.reasoning || "Classification completed",
          }
        } catch (error) {
          console.error("Classification error for email:", email.id, error)
          return {
            ...email,
            category: "General",
            confidence: 0,
            reasoning: "Error during classification",
          }
        }
      }),
    )

    return NextResponse.json({ classifications })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Classification failed" }, { status: 500 })
  }
}
