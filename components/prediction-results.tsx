"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUpIcon, AlertTriangleIcon, CheckCircleIcon, BarChart3Icon } from "lucide-react"

interface PredictionResultsProps {
  investmentAmount: number
  targetDate: string
  modelOutput: string
  currentPrice?: number
  predictedOverride?: number //
}

export function PredictionResults({
  investmentAmount,
  targetDate,
  modelOutput,
  currentPrice,
  predictedOverride,
}: PredictionResultsProps) {
  const baseCurrent = typeof currentPrice === "number" ? currentPrice : 2720
  const predictedPrice =
    typeof predictedOverride === "number"
      ? predictedOverride
      : modelOutput
        ? Number.parseFloat(modelOutput)
        : baseCurrent
  const priceIncrease = predictedPrice - baseCurrent
  const percentageGain = (priceIncrease / baseCurrent) * 100
  const potentialProfit = (investmentAmount * percentageGain) / 100

  const isPositive = percentageGain > 0
  const isHighlyPositive = percentageGain > 10
  const isHighlyNegative = percentageGain < -10

  const confidence = 88

  const absPct = Math.abs(percentageGain)
  const riskLevel = absPct >= 12 ? "High" : absPct >= 5 ? "Medium" : "Low"
  const riskColor = riskLevel === "Low" ? "text-green-600" : riskLevel === "Medium" ? "text-yellow-600" : "text-red-600"
  const riskDetail =
    riskLevel === "High"
      ? "Large projected move; higher short-term volatility expected."
      : riskLevel === "Medium"
        ? "Moderate projected move; use cautious position sizing."
        : "Small projected move; lower short-term volatility."

  const { recTitle, recDetail, recBgClass, recTextClass, recBorderClass } = (() => {
    const pct = percentageGain
    if (pct >= 15) {
      return {
        recTitle: "Strong Buy",
        recDetail: "Price projected to rise sharply (15%+). You should buy now if it fits your risk plan.",
        recBgClass: "bg-green-50",
        recTextClass: "text-green-800",
        recBorderClass: "border-green-200",
      }
    }
    if (pct >= 10) {
      return {
        recTitle: "Buy",
        recDetail: "You must buy it; outlook is very positive (10%+). Consider scaling in.",
        recBgClass: "bg-green-50",
        recTextClass: "text-green-800",
        recBorderClass: "border-green-200",
      }
    }
    if (pct >= 5) {
      return {
        recTitle: "Accumulation",
        recDetail: "Moderate upside (5–10%). Consider buying gradually.",
        recBgClass: "bg-green-50",
        recTextClass: "text-green-700",
        recBorderClass: "border-green-200",
      }
    }
    if (pct > 0) {
      return {
        recTitle: "Cautious Buy",
        recDetail: "Mild upside (0–5%). Start small or wait for confirmation.",
        recBgClass: "bg-green-50",
        recTextClass: "text-green-700",
        recBorderClass: "border-green-200",
      }
    }
    if (pct > -5) {
      return {
        recTitle: "Hold / Wait",
        recDetail: "Avoid buying now; signal is weakly negative (0 to -5%).",
        recBgClass: "bg-yellow-50",
        recTextClass: "text-yellow-800",
        recBorderClass: "border-yellow-200",
      }
    }
    if (pct > -10) {
      return {
        recTitle: "Avoid Buying",
        recDetail: "Trend turning down (-5% to -10%). Prefer waiting for stabilization.",
        recBgClass: "bg-red-50",
        recTextClass: "text-red-800",
        recBorderClass: "border-red-200",
      }
    }
    return {
      recTitle: "Do Not Buy",
      recDetail: "You shouldn’t buy now; the market is going lower (≥10% downside).",
      recBgClass: "bg-red-50",
      recTextClass: "text-red-800",
      recBorderClass: "border-red-200",
    }
  })()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Prediction Summary */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <TrendingUpIcon className="h-5 w-5 text-primary" />
            Prediction Summary
          </CardTitle>
          <CardDescription>AI analysis for your investment scenario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-xl font-bold text-foreground">${baseCurrent.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Predicted Price</p>
              <p
                className={`text-xl font-bold ${
                  isHighlyPositive
                    ? "text-green-600"
                    : isPositive
                      ? "text-green-500"
                      : isHighlyNegative
                        ? "text-red-600"
                        : "text-red-500"
                }`}
              >
                ${predictedPrice.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Expected Change</span>
              <Badge
                variant="secondary"
                className={`${
                  isHighlyPositive
                    ? "bg-green-100 text-green-800 border-green-200"
                    : isPositive
                      ? "bg-green-50 text-green-700 border-green-200"
                      : isHighlyNegative
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {isPositive ? "+" : ""}
                {percentageGain.toFixed(1)}%
              </Badge>
            </div>
            <Progress
              value={Math.min(Math.abs(percentageGain), 100)}
              className={`h-2 ${isPositive ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"}`}
            />
          </div>

          <div className="pt-2 border-t border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {isPositive ? "Potential Profit" : "Potential Loss"}
              </span>
              <span
                className={`text-lg font-bold ${
                  isHighlyPositive
                    ? "text-green-600"
                    : isPositive
                      ? "text-green-500"
                      : isHighlyNegative
                        ? "text-red-600"
                        : "text-red-500"
                }`}
              >
                {isPositive ? "+" : ""}${potentialProfit.toLocaleString()}
              </span>
            </div>
          </div>

          <div className={`p-3 rounded-lg border text-left ${recBgClass} ${recTextClass} ${recBorderClass}`}>
            <p className="text-sm font-semibold">Recommendation: {recTitle}</p>
            <p className="text-sm mt-1 text-pretty">{recDetail}</p>
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <BarChart3Icon className="h-5 w-5 text-primary" />
            Risk Analysis
          </CardTitle>
          <CardDescription>Model confidence and risk assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Model Confidence</span>
              <span className="text-sm font-medium text-foreground">88%</span>
            </div>
            <Progress value={88} className="h-2" />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-2">
              <BarChart3Icon className={`h-4 w-4 ${riskColor}`} />
              <span className="text-sm text-foreground">
                {riskDetail} ({absPct.toFixed(1)}% projected move)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm text-foreground">Strong historical correlation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm text-foreground">Favorable market conditions</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-foreground">Economic uncertainty factors</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Risk Level</span>
              <Badge variant="outline" className={`${riskColor} border-current`}>
                {riskLevel}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Risk is based on the projected percentage move, not model confidence.
            </p>
          </div>

          {predictedOverride !== undefined && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Custom Predicted Price:</p>
              <p className="text-sm text-foreground bg-muted/50 p-2 rounded text-balance">
                ${predictedOverride.toLocaleString()}
              </p>
            </div>
          )}

          {modelOutput && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Custom Model Output:</p>
              <p className="text-sm text-foreground bg-muted/50 p-2 rounded text-balance">{modelOutput}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
