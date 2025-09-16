"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { HistogramChart } from "./histogram-chart"
import type { ContrastBrightnessAnalysis } from "@/lib/contrast-brightness-analysis"

interface ContrastBrightnessAnalysisProps {
  analysis: ContrastBrightnessAnalysis
}

export function ContrastBrightnessAnalysisComponent({ analysis }: ContrastBrightnessAnalysisProps) {
  const getExposureColor = (level: string) => {
    switch (level) {
      case "optimal":
        return "bg-green-500"
      case "underexposed":
        return "bg-blue-500"
      case "overexposed":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getExposureIcon = (level: string) => {
    switch (level) {
      case "optimal":
        return <CheckCircle className="h-4 w-4" />
      case "underexposed":
        return <TrendingDown className="h-4 w-4" />
      case "overexposed":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Minus className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Exposure Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Exposure Analysis
            <Badge
              className={`${getExposureColor(analysis.brightness.exposureLevel)} text-white flex items-center gap-1`}
            >
              {getExposureIcon(analysis.brightness.exposureLevel)}
              {analysis.brightness.exposureLevel.charAt(0).toUpperCase() + analysis.brightness.exposureLevel.slice(1)}
            </Badge>
          </CardTitle>
          <CardDescription>Comprehensive brightness and exposure assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Average Brightness</span>
                <span className="font-medium">{Math.round(analysis.brightness.averageBrightness * 100)}%</span>
              </div>
              <Progress value={analysis.brightness.averageBrightness * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Dynamic Range</span>
                <span className="font-medium">{Math.round(analysis.dynamicRange * 100)}%</span>
              </div>
              <Progress value={analysis.dynamicRange * 100} className="h-2" />
            </div>
          </div>

          {/* Clipping Analysis */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Clipped Shadows</span>
                <span
                  className={`font-medium ${analysis.exposureAnalysis.clippedShadows > 0.05 ? "text-red-600" : "text-green-600"}`}
                >
                  {Math.round(analysis.exposureAnalysis.clippedShadows * 100)}%
                </span>
              </div>
              <Progress value={Math.min(analysis.exposureAnalysis.clippedShadows * 100, 100)} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Clipped Highlights</span>
                <span
                  className={`font-medium ${analysis.exposureAnalysis.clippedHighlights > 0.05 ? "text-red-600" : "text-green-600"}`}
                >
                  {Math.round(analysis.exposureAnalysis.clippedHighlights * 100)}%
                </span>
              </div>
              <Progress value={Math.min(analysis.exposureAnalysis.clippedHighlights * 100, 100)} className="h-2" />
            </div>
          </div>

          {/* Recommendation */}
          {!analysis.exposureAnalysis.optimalExposure && (
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Exposure Recommendation</p>
                <p className="text-sm text-muted-foreground">{analysis.exposureAnalysis.recommendedAdjustment}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contrast Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Contrast Analysis</CardTitle>
          <CardDescription>Multiple contrast measurement techniques</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Global Contrast</span>
                <span className="font-medium">{Math.round(analysis.contrast.globalContrast * 100)}%</span>
              </div>
              <Progress value={analysis.contrast.globalContrast * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Local Contrast</span>
                <span className="font-medium">{Math.round(analysis.contrast.localContrast * 100)}%</span>
              </div>
              <Progress value={analysis.contrast.localContrast * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Michelson Contrast</span>
                <span className="font-medium">{Math.round(analysis.contrast.michelsonContrast * 100)}%</span>
              </div>
              <Progress value={analysis.contrast.michelsonContrast * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>RMS Contrast</span>
                <span className="font-medium">{Math.round(analysis.contrast.rmsContrast * 100)}%</span>
              </div>
              <Progress value={analysis.contrast.rmsContrast * 100} className="h-2" />
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Contrast Ratio</span>
              <Badge variant="outline">{analysis.contrast.contrastRatio.toFixed(1)}:1</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histogram Visualization */}
      <HistogramChart
        histogram={analysis.histogram}
        brightnessDistribution={analysis.brightness.brightnessDistribution}
      />
    </div>
  )
}
