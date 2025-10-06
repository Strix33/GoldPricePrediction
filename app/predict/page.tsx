"use client"

import GoldPredictionDashboard from "@/components/gold-prediction-dashboard"

export default function Page() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-semibold text-balance">Gold Price Prediction</h1>
      <GoldPredictionDashboard />
    </main>
  )
}
