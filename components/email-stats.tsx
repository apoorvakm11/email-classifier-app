"use client"

import { Card } from "@/components/ui/card"
import { Mail, AlertCircle, Zap } from "lucide-react"

interface EmailStatsProps {
  totalEmails: number
  classifiedEmails: number
  unclassifiedEmails: number
  categories: Record<string, number>
}

export function EmailStats({ totalEmails, classifiedEmails, unclassifiedEmails, categories }: EmailStatsProps) {
  const classificationRate = totalEmails > 0 ? Math.round((classifiedEmails / totalEmails) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="p-6 border border-border hover:border-primary/30 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Emails</p>
            <p className="text-3xl font-bold text-foreground">{totalEmails}</p>
          </div>
          <Mail className="w-10 h-10 text-primary/30" />
        </div>
      </Card>

      <Card className="p-6 border border-border hover:border-primary/30 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Classified</p>
            <p className="text-3xl font-bold text-foreground">{classifiedEmails}</p>
            <p className="text-xs text-muted-foreground mt-1">{classificationRate}% complete</p>
          </div>
          <Zap className="w-10 h-10 text-accent/30" />
        </div>
      </Card>

      <Card className="p-6 border border-border hover:border-primary/30 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Unclassified</p>
            <p className="text-3xl font-bold text-foreground">{unclassifiedEmails}</p>
          </div>
          <AlertCircle className="w-10 h-10 text-destructive/30" />
        </div>
      </Card>

      <Card className="p-6 border border-border hover:border-primary/30 transition-colors">
        <div>
          <p className="text-sm text-muted-foreground mb-3">Top Category</p>
          <div className="space-y-2">
            {Object.entries(categories)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 1)
              .map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{category}</span>
                  <span className="text-lg font-bold text-primary">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
