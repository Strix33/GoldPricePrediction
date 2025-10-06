"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

type Props = {
  currentPrice: number
  predictedPrice: number
}

function getTone(percent: number) {
  if (percent >= 10) return { tone: "strong-positive", badge: "Strong Positive", variant: "default" as const }
  if (percent > 0) return { tone: "positive", badge: "Positive", variant: "default" as const }
  if (percent <= -10) return { tone: "strong-negative", badge: "Strong Negative", variant: "destructive" as const }
  if (percent < 0) return { tone: "negative", badge: "Negative", variant: "destructive" as const }
  return { tone: "neutral", badge: "Neutral", variant: "default" as const }
}

function formatPercent(p: number) {
  return `${p.toFixed(2)}%`
}

export function PredictionSignal({ currentPrice, predictedPrice }: Props) {
  const percent = currentPrice > 0 ? ((predictedPrice - currentPrice) / currentPrice) * 100 : 0
  const { tone, badge, variant } = getTone(percent)

  let title = ""
  let desc = ""

  if (tone === "strong-positive") {
    title = "Strongly Positive Outlook"
    desc = `Predicted price is ${formatPercent(percent)} above current. Momentum looks robust.`
  } else if (tone === "positive") {
    title = "Positive Outlook"
    desc = `Predicted price is ${formatPercent(percent)} above current. Trend is favorable.`
  } else if (tone === "neutral") {
    title = "Neutral Outlook"
    desc = `Predicted price is roughly unchanged (${formatPercent(percent)}). Consider waiting for clearer signal.`
  } else if (tone === "negative") {
    title = "Negative Outlook"
    desc = `Predicted price is ${formatPercent(Math.abs(percent))} below current. Consider defensive positioning.`
  } else if (tone === "strong-negative") {
    title = "Strongly Negative Outlook"
    desc = `Predicted price is ${formatPercent(Math.abs(percent))} below current. Elevated downside risk.`
  }

  return (
    <Alert variant={variant} className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <AlertTitle className="text-pretty">{title}</AlertTitle>
        <Badge variant={variant === "destructive" ? "destructive" : "default"}>{badge}</Badge>
      </div>
      <AlertDescription className="text-pretty">{desc}</AlertDescription>
      <div className="text-xs text-muted-foreground">
        Baseline: {currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} • Predicted:{" "}
        {predictedPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} • Change: {formatPercent(percent)}
      </div>
    </Alert>
  )
}

export default PredictionSignal
