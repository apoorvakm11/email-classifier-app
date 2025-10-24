"use client"

import { Card } from "@/components/ui/card"

interface CategoryDistributionProps {
  categories: Record<string, number>
}

export function CategoryDistribution({ categories }: CategoryDistributionProps) {
  const data = Object.entries(categories)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const maxValue = Math.max(...data.map((d) => d.value), 1)

  const colors: Record<string, string> = {
    Important: "bg-red-500",
    Promotions: "bg-amber-500",
    Social: "bg-blue-500",
    Marketing: "bg-purple-500",
    Spam: "bg-gray-500",
    General: "bg-cyan-500",
    Unclassified: "bg-gray-400",
  }

  const textColors: Record<string, string> = {
    Important: "text-red-600 dark:text-red-400",
    Promotions: "text-amber-600 dark:text-amber-400",
    Social: "text-blue-600 dark:text-blue-400",
    Marketing: "text-purple-600 dark:text-purple-400",
    Spam: "text-gray-600 dark:text-gray-400",
    General: "text-cyan-600 dark:text-cyan-400",
    Unclassified: "text-gray-500 dark:text-gray-400",
  }

  return (
    <Card className="p-6 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-6">Email Distribution</h3>
      <div className="space-y-4">
        {data.map((entry) => {
          const percentage = (entry.value / maxValue) * 100
          return (
            <div key={entry.name} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textColors[entry.name] || "text-gray-600"}`}>{entry.name}</span>
                <span className="text-sm font-semibold text-muted-foreground">{entry.value}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${colors[entry.name] || "bg-gray-400"} rounded-full transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
