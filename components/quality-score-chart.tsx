"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { ImageAnalysisResult } from "@/lib/image-analysis"

interface QualityScoreChartProps {
  results: ImageAnalysisResult
}

export function QualityScoreChart({ results }: QualityScoreChartProps) {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (score >= 0.6) return <Minus className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const calculateOverallScore = () => {
    const weights = {
      sharpness: 0.3,
      contrast: 0.25,
      brightness: 0.2,
      saturation: 0.15,
      noise: 0.1,
    }

    return (
      results.metrics.sharpness * weights.sharpness +
      results.metrics.contrast * weights.contrast +
      results.metrics.brightness * weights.brightness +
      results.metrics.saturation * weights.saturation +
      (1 - results.metrics.noise) * weights.noise
    )
  }

  const overallScore = calculateOverallScore()

  const scoreCategories = [
    {
      name: "Sharpness",
      score: results.metrics.sharpness,
      description: "Image clarity and focus quality",
      weight: "30%",
    },
    {
      name: "Contrast",
      score: results.metrics.contrast,
      description: "Dynamic range and tonal separation",
      weight: "25%",
    },
    {
      name: "Brightness",
      score: results.metrics.brightness,
      description: "Exposure and luminance levels",
      weight: "20%",
    },
    {
      name: "Saturation",
      score: results.metrics.saturation,
      description: "Color richness and vibrancy",
      weight: "15%",
    },
    {
      name: "Noise Level",
      score: 1 - results.metrics.noise,
      description: "Absence of grain and artifacts",
      weight: "10%",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Quality Score Breakdown
          <Badge variant="outline" className="text-lg px-3 py-1">
            {Math.round(overallScore * 100)}/100
          </Badge>
        </CardTitle>
        <CardDescription>Weighted analysis of image quality components</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Overall Quality Score</span>
            <div className="flex items-center gap-2">
              {getScoreIcon(overallScore)}
              <span className={`text-lg font-bold ${getScoreColor(overallScore)}`}>
                {Math.round(overallScore * 100)}%
              </span>
            </div>
          </div>
          <Progress value={overallScore * 100} className="h-3" />
          <p className="text-sm text-muted-foreground">Composite score based on weighted quality metrics</p>
        </div>

        {/* Individual Scores */}
        <div className="space-y-4">
          <h4 className="font-medium">Component Scores</h4>
          {scoreCategories.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {category.weight}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {getScoreIcon(category.score)}
                  <span className={`font-semibold ${getScoreColor(category.score)}`}>
                    {Math.round(category.score * 100)}%
                  </span>
                </div>
              </div>
              <Progress value={category.score * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">{category.description}</p>
            </div>
          ))}
        </div>

        {/* Quality Grade */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="font-medium">Quality Grade</span>
            <Badge
              className={`
                ${
                  results.overallQuality === "Good"
                    ? "bg-green-500"
                    : results.overallQuality === "Fair"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                } 
                text-white
              `}
            >
              {results.overallQuality}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Based on AI analysis with {Math.round(results.confidence * 100)}% confidence
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
