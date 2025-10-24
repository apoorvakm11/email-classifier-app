"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Star, AlertCircle, TrendingUp } from "lucide-react"
import { useState } from "react"

interface EmailListItemProps {
  id: string
  from: string
  subject: string
  snippet: string
  category: string
  confidence?: number
  priority?: "high" | "medium" | "low"
  actionRequired?: boolean
  onSelect?: (id: string, selected: boolean) => void
  isSelected?: boolean
}

export function EmailListItem({
  id,
  from,
  subject,
  snippet,
  category,
  confidence = 0.8,
  priority = "medium",
  actionRequired = false,
  onSelect,
  isSelected = false,
}: EmailListItemProps) {
  const [isStarred, setIsStarred] = useState(false)

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      Important: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Promotions: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      Social: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Marketing: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Spam: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      General: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
      Unclassified: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    }
    return colors[cat] || colors.General
  }

  const getPriorityColor = (p: string) => {
    const colors: Record<string, string> = {
      high: "text-red-600 dark:text-red-400",
      medium: "text-amber-600 dark:text-amber-400",
      low: "text-green-600 dark:text-green-400",
    }
    return colors[p] || colors.medium
  }

  const confidencePercentage = Math.round(confidence * 100)

  return (
    <Card className="p-4 hover:shadow-md transition-all border border-border hover:border-primary/30 group">
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect?.(id, checked as boolean)}
          className="mt-1"
        />

        {/* Email Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate text-balance">{subject}</h3>
              <p className="text-sm text-muted-foreground truncate">{from}</p>
            </div>

            {/* Star Button */}
            <button
              onClick={() => setIsStarred(!isStarred)}
              className="flex-shrink-0 p-1 hover:bg-muted rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <Star className={`w-5 h-5 ${isStarred ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
            </button>
          </div>

          {/* Email Preview */}
          <p className="text-sm text-foreground line-clamp-2 mb-3">{snippet}</p>

          {/* Badges and Metadata */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${getCategoryColor(category)} border-0`}>{category}</Badge>

            {actionRequired && (
              <Badge variant="outline" className="gap-1">
                <AlertCircle className="w-3 h-3" />
                Action
              </Badge>
            )}

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              <span>{confidencePercentage}%</span>
            </div>

            {priority !== "medium" && (
              <Badge variant="outline" className={`text-xs ${getPriorityColor(priority)}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
