import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

interface Email {
  id: string
  from: string
  subject: string
  snippet?: string
  body?: string
}

interface AdvancedClassificationResult {
  id: string
  category: string
  confidence: number
  priority: "high" | "medium" | "low"
  tags: string[]
  actionRequired: boolean
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
      emails.map(async (email: Email): Promise<AdvancedClassificationResult> => {
        try {
          const emailContent = `
From: ${email.from}
Subject: ${email.subject}
Preview: ${email.snippet || "No preview available"}
${email.body ? `Body: ${email.body.substring(0, 500)}` : ""}
          `.trim()

          const { text } = await generateText({
            model: "openai/gpt-4o-mini",
            system: `You are an expert email classifier and analyzer. Analyze the given email and provide comprehensive classification.

Respond in JSON format:
{
  "category": "one of the categories",
  "confidence": 0.0-1.0,
  "priority": "high|medium|low",
  "tags": ["tag1", "tag2"],
  "actionRequired": true|false,
  "reasoning": "explanation"
}

Categories: ${CATEGORIES.join(", ")}

Priority guidelines:
- high: Urgent, from important contacts, requires immediate action
- medium: Regular business, should be addressed soon
- low: Informational, can be addressed later

Tags: Use relevant tags like "invoice", "meeting", "feedback", "urgent", "followup", etc.`,
            prompt: emailContent,
            temperature: 0.3,
            maxTokens: 300,
          })

          // Parse the response
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (!jsonMatch) {
            return {
              id: email.id,
              category: "General",
              confidence: 0.5,
              priority: "medium",
              tags: [],
              actionRequired: false,
              reasoning: "Unable to parse classification response",
            }
          }

          const result = JSON.parse(jsonMatch[0])

          return {
            id: email.id,
            category: CATEGORIES.includes(result.category) ? result.category : "General",
            confidence: Math.min(Math.max(result.confidence || 0.5, 0), 1),
            priority: ["high", "medium", "low"].includes(result.priority) ? result.priority : "medium",
            tags: Array.isArray(result.tags) ? result.tags.slice(0, 5) : [],
            actionRequired: Boolean(result.actionRequired),
            reasoning: result.reasoning || "Classification completed",
          }
        } catch (error) {
          console.error("Advanced classification error:", error)
          return {
            id: email.id,
            category: "General",
            confidence: 0,
            priority: "medium",
            tags: [],
            actionRequired: false,
            reasoning: "Error during classification",
          }
        }
      }),
    )

    return NextResponse.json({ classifications })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Advanced classification failed" }, { status: 500 })
  }
}
