"use client"

import { useMemo } from "react"
import { XAxis, YAxis, CartesianGrid, ReferenceLine, Area, AreaChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface GoldPriceChartProps {
  investmentAmount: number
  targetDate: string
  modelOutput: string
  showPrediction: boolean
  historicalData?: { date: string; price: number }[]
  currentPrice?: number
  predictedPrice?: number
}

export function GoldPriceChart({
  investmentAmount,
  targetDate,
  modelOutput,
  showPrediction,
  historicalData = [],
  currentPrice,
  predictedPrice,
}: GoldPriceChartProps) {
  const data = useMemo(() => [...historicalData].sort((a, b) => a.date.localeCompare(b.date)), [historicalData])

  const fallbackCurrent = data.length > 0 ? data[0].price : 2720
  const baseCurrent = typeof currentPrice === "number" ? currentPrice : fallbackCurrent

  const derivedPredicted =
    typeof predictedPrice === "number"
      ? predictedPrice
      : showPrediction && modelOutput
        ? Number.parseFloat(modelOutput)
        : baseCurrent

  const percentageDiff = ((derivedPredicted - baseCurrent) / baseCurrent) * 100
  const isPositive = percentageDiff > 0
  const isHighlyPositive = percentageDiff > 10
  const isHighlyNegative = percentageDiff < -10

  const [yMin, yMax] = useMemo(() => {
    if (!data.length) {
      const v = baseCurrent || 1
      return [v * 0.98, v * 1.02]
    }
    const vals = data.map((d) => d.price)
    vals.push(derivedPredicted)
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    if (min === max) {
      return [min - 1, max + 1]
    }
    const pad = (max - min) * 0.06
    return [min - pad, max + pad]
  }, [data, baseCurrent, derivedPredicted])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-2xl font-bold text-foreground">${baseCurrent.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Current Gold Price (per oz)</p>
        </div>
        {showPrediction && (
          <div className="text-right space-y-1">
            <p
              className={`text-2xl font-bold ${
                isHighlyPositive
                  ? "text-green-600"
                  : isPositive
                    ? "text-green-500"
                    : isHighlyNegative
                      ? "text-red-600"
                      : "text-red-500"
              }`}
            >
              ${derivedPredicted.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Predicted Price</p>
            <div
              className={`text-sm font-medium ${
                isHighlyPositive
                  ? "text-green-600"
                  : isPositive
                    ? "text-green-500"
                    : isHighlyNegative
                      ? "text-red-600"
                      : "text-red-500"
              }`}
            >
              {isPositive ? "+" : ""}
              {percentageDiff.toFixed(1)}%{isHighlyPositive && " 🚀"}
              {isHighlyNegative && " ⚠️"}
            </div>
          </div>
        )}
      </div>

      {showPrediction && (
        <div
          className={`p-3 rounded-lg border ${
            isHighlyPositive
              ? "bg-green-50 border-green-200 text-green-800"
              : isPositive
                ? "bg-green-50 border-green-200 text-green-700"
                : isHighlyNegative
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <p className="text-sm font-medium">
            {isHighlyPositive
              ? "Excellent Prediction! Strong upward trend expected (+10% or more)"
              : isPositive
                ? "Positive Prediction! Price increase expected"
                : isHighlyNegative
                  ? "High Risk Alert! Significant price drop predicted (-10% or more)"
                  : "Negative Prediction! Price decrease expected"}
          </p>
        </div>
      )}

      <ChartContainer
        config={{
          price: { label: "Gold Price", color: "hsl(var(--chart-1))" },
        }}
        className="h-[400px]"
      >
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          key={`${data.length}-${data[0]?.price ?? "n"}-${data[data.length - 1]?.price ?? "n"}-${derivedPredicted}`}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            domain={[yMin, yMax]}
            tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
            allowDecimals
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Gold Price"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            fill="url(#colorPrice)"
            dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 3 }}
            isAnimationActive={false}
          />
          {showPrediction && (
            <>
              {data.length > 0 && (
                <ReferenceLine x={data[data.length - 1].date} stroke="hsl(var(--border))" strokeDasharray="2 2" />
              )}
              <ReferenceLine
                y={derivedPredicted}
                stroke={isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            </>
          )}
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
