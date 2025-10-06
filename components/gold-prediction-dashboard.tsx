"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, TrendingUpIcon, DollarSignIcon, SparklesIcon } from "lucide-react"
import { GoldPriceChart } from "@/components/gold-price-chart"
import { PredictionResults } from "@/components/prediction-results"

export function GoldPredictionDashboard() {
  const [investmentAmount, setInvestmentAmount] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [modelOutput, setModelOutput] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [mode, setMode] = useState<"graph" | "summary">("graph")
  const [historicalCsv, setHistoricalCsv] = useState("")
  const [currentPriceInput, setCurrentPriceInput] = useState("")
  const [dailyEntries, setDailyEntries] = useState<{ date: string; price: string }[]>([])
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false)
  const [predictionError, setPredictionError] = useState("")

  function fmt(d: Date) {
    return d.toISOString().slice(0, 10)
  }

  useEffect(() => {
    if (mode !== "graph" || !targetDate) {
      setDailyEntries([])
      setPredictionError("")
      return
    }
    
    const fetchPredictions = async () => {
      setIsLoadingPredictions(true)
      setPredictionError("")
      
      try {
        const response = await fetch('/api/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ targetDate }),
        })
        
        const data = await response.json()
        
        if (data.error) {
          setPredictionError(data.error)
          setDailyEntries([])
        } else if (data.predictions) {
          const predictions = data.predictions.map((p: { date: string; price: number }) => ({
            date: p.date,
            price: p.price.toFixed(2)
          }))
          setDailyEntries(predictions)
        }
      } catch (error) {
        setPredictionError("Failed to fetch predictions")
        setDailyEntries([])
      } finally {
        setIsLoadingPredictions(false)
      }
    }
    
    fetchPredictions()
  }, [targetDate, mode])

  function parseHistoricalCsv(csv: string): { date: string; price: number }[] {
    const rows = csv
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean)

    const parsed = []
    for (const row of rows) {
      const parts = row.split(/[,\s;]+/).filter(Boolean)
      if (parts.length < 2) continue
      const [dateRaw, priceRaw] = [parts[0], parts[1]]
      const price = Number.parseFloat(priceRaw)
      if (Number.isNaN(price)) continue
      const d = dateRaw.slice(0, 7)
      parsed.push({ date: d, price })
    }
    return parsed.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  }

  const historicalDataForDate = useMemo(() => {
    if (mode === "graph") {
      return dailyEntries
        .filter((e) => e.price.trim().length > 0 && Number.isFinite(Number.parseFloat(e.price)))
        .map((e) => ({ date: e.date, price: Number.parseFloat(e.price) }))
    }
    if (!historicalCsv) return []
    const all = parseHistoricalCsv(historicalCsv)
    if (!targetDate) return all
    const cutoff = targetDate.slice(0, 7)
    return all.filter((p) => p.date <= cutoff)
  }, [mode, dailyEntries, historicalCsv, targetDate])

  const derivedCurrentPrice = useMemo(() => {
    if (mode === "graph") {
      const firstFilled = historicalDataForDate.find((d) => Number.isFinite(d.price))
      return firstFilled?.price
    }
    const fromInput = Number.parseFloat(currentPriceInput)
    return Number.isFinite(fromInput) ? fromInput : undefined
  }, [mode, historicalDataForDate, currentPriceInput])

  const predictedOverrideGraph = useMemo(() => {
    if (mode !== "graph") return undefined
    const filled = historicalDataForDate.filter((d) => Number.isFinite(d.price))
    return filled.length ? filled[filled.length - 1].price : undefined
  }, [mode, historicalDataForDate])

  const handlePredict = async () => {
    const baseValid = !!investmentAmount && !!targetDate
    const modeValid =
      mode === "graph"
        ? dailyEntries.length > 0 &&
          dailyEntries.every((e) => {
            const v = Number.parseFloat(e.price)
            return Number.isFinite(v)
          })
        : !!modelOutput && Number.isFinite(derivedCurrentPrice)
    if (!baseValid || !modeValid) return

    setIsAnalyzing(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsAnalyzing(false)
    setShowResults(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <SparklesIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">GoldPredict</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Gold Price Predictions</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              Live Market Data
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <DollarSignIcon className="h-5 w-5 text-primary" />
                  Prediction Parameters
                </CardTitle>
                <CardDescription>Enter your investment details and model output, then choose a mode</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-card-foreground">Mode</Label>
                  <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
                    <TabsList className="grid grid-cols-2">
                      <TabsTrigger value="graph">Exact Graph</TabsTrigger>
                      <TabsTrigger value="summary">Summary Only</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-card-foreground">
                    Investment Amount ($)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="10000"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-card-foreground">
                    Target Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                {mode === "summary" && (
                  <div className="space-y-2">
                    <Label htmlFor="model-output" className="text-card-foreground">
                      Predicted Gold Price ($) *
                    </Label>
                    <Input
                      id="model-output"
                      type="number"
                      placeholder="2850"
                      value={modelOutput}
                      onChange={(e) => setModelOutput(e.target.value)}
                      className="bg-background/50 border-border/50"
                    />
                    <p className="text-xs text-muted-foreground">Enter your ML model's predicted price per oz</p>
                  </div>
                )}

                {mode === "graph" ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">AI-Generated Predictions</Label>
                      {isLoadingPredictions ? (
                        <div className="flex items-center justify-center py-4">
                          <SparklesIcon className="mr-2 h-4 w-4 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">Generating predictions...</p>
                        </div>
                      ) : predictionError ? (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                          {predictionError}
                        </div>
                      ) : dailyEntries.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Select a target date to generate predictions automatically.
                        </p>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-auto pr-1">
                            {dailyEntries.map((entry) => (
                              <div key={entry.date} className="grid grid-cols-2 items-center gap-2">
                                <Input readOnly value={entry.date} className="bg-muted/30" />
                                <Input
                                  readOnly
                                  value={`$${Number.parseFloat(entry.price).toFixed(2)}`}
                                  className="bg-background/50 border-border/50"
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Predictions generated by AI model. The last date's price is used as the final prediction.
                          </p>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="current" className="text-card-foreground">
                      Current Gold Price up to Date ($)
                    </Label>
                    <Input
                      id="current"
                      type="number"
                      placeholder="2720"
                      value={currentPriceInput}
                      onChange={(e) => setCurrentPriceInput(e.target.value)}
                      className="bg-background/50 border-border/50"
                    />
                    <p className="text-xs text-muted-foreground">Provide the price up to the selected date.</p>
                  </div>
                )}

                <Button
                  onClick={handlePredict}
                  disabled={
                    isAnalyzing ||
                    !investmentAmount ||
                    !targetDate ||
                    (mode === "graph"
                      ? dailyEntries.length === 0 ||
                        dailyEntries.some((e) => !Number.isFinite(Number.parseFloat(e.price)))
                      : !modelOutput || !derivedCurrentPrice)
                  }
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isAnalyzing ? (
                    <>
                      <SparklesIcon className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUpIcon className="mr-2 h-4 w-4" />
                      Generate Prediction
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Chart and Results */}
          <div className="lg:col-span-2 space-y-8">
            {mode === "graph" && (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    Gold Price Trends & Predictions
                  </CardTitle>
                  <CardDescription>Your data up to the prediction date and comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <GoldPriceChart
                    investmentAmount={Number.parseFloat(investmentAmount) || 0}
                    targetDate={targetDate}
                    modelOutput={""}
                    showPrediction={showResults}
                    historicalData={historicalDataForDate}
                    currentPrice={derivedCurrentPrice}
                    predictedPrice={predictedOverrideGraph}
                  />
                </CardContent>
              </Card>
            )}

            {showResults && (
              <PredictionResults
                investmentAmount={Number.parseFloat(investmentAmount) || 0}
                targetDate={targetDate}
                modelOutput={mode === "summary" ? modelOutput : ""}
                currentPrice={derivedCurrentPrice}
                predictedOverride={mode === "graph" ? predictedOverrideGraph : undefined}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GoldPredictionDashboard
