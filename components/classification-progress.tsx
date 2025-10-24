"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ClassificationProgressProps {
  total: number
  classified: number
  isClassifying: boolean
}

export function ClassificationProgress({ total, classified, isClassifying }: ClassificationProgressProps) {
  const percentage = total > 0 ? (classified / total) * 100 : 0

  return (
    <Card className="p-4 border border-border bg-card/50">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Classification Progress</p>
          <p className="text-sm text-muted-foreground">
            {classified} of {total}
          </p>
        </div>
        <Progress value={percentage} className="h-2" />
        {isClassifying && <p className="text-xs text-muted-foreground animate-pulse">Classifying emails...</p>}
      </div>
    </Card>
  )
}
