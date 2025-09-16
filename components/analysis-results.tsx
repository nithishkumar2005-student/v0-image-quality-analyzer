"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, Eye, Contrast, Sun, Volume2 } from "lucide-react"
import { BlurVisualization } from "./blur-visualization"
import { ContrastBrightnessAnalysisComponent } from "./contrast-brightness-analysis"
import { IssueVisualization } from "./issue-visualization"
import { QualityScoreChart } from "./quality-score-chart"
import { AIClassificationResults } from "./ai-classification-results" // Added AI classification import
import type { ImageAnalysisResult } from "@/lib/image-analysis"

interface AnalysisResultsProps {
  results: ImageAnalysisResult
  imageUrl: string | null
}

export function AnalysisResults({ results, imageUrl }: AnalysisResultsProps) {
  const getQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case "good":
        return "bg-green-500"
      case "fair":
        return "bg-yellow-500"
      case "poor":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "low":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "high":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getIssueIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "blur":
        return <Eye className="h-4 w-4" />
      case "contrast":
        return <Contrast className="h-4 w-4" />
      case "brightness":
        return <Sun className="h-4 w-4" />
      case "noise":
        return <Volume2 className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Quality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Analysis Results
          </CardTitle>
          <CardDescription>AI-powered quality assessment with confidence score</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Quality</span>
            <Badge className={`${getQualityColor(results.overallQuality)} text-white`}>{results.overallQuality}</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Confidence Score</span>
              <span className="font-medium">{Math.round(results.confidence * 100)}%</span>
            </div>
            <Progress value={results.confidence * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* AI Classification Results */}
      {results.aiClassification && <AIClassificationResults results={results.aiClassification} />}

      {/* Quality Score Chart */}
      <QualityScoreChart results={results} />

      {/* Interactive Issue Visualization */}
      {imageUrl && <IssueVisualization imageUrl={imageUrl} analysisResults={results} />}

      {results.metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Quality Metrics</CardTitle>
            <CardDescription>Detailed technical measurements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Sharpness</span>
                  <span className="font-medium">{Math.round(results.metrics.sharpness * 100)}%</span>
                </div>
                <Progress value={results.metrics.sharpness * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Contrast</span>
                  <span className="font-medium">{Math.round(results.metrics.contrast * 100)}%</span>
                </div>
                <Progress value={results.metrics.contrast * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Brightness</span>
                  <span className="font-medium">{Math.round(results.metrics.brightness * 100)}%</span>
                </div>
                <Progress value={results.metrics.brightness * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Saturation</span>
                  <span className="font-medium">{Math.round(results.metrics.saturation * 100)}%</span>
                </div>
                <Progress value={results.metrics.saturation * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contrast & Brightness Analysis */}
      {results.contrastBrightnessAnalysis && (
        <ContrastBrightnessAnalysisComponent analysis={results.contrastBrightnessAnalysis} />
      )}

      {/* Blur Analysis Visualization */}
      {results.blurAnalysis && imageUrl && (
        <BlurVisualization imageUrl={imageUrl} blurAnalysis={results.blurAnalysis} />
      )}

      {/* Detailed Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Issues Detected</CardTitle>
          <CardDescription>Detailed breakdown of potential quality problems</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.issues.length > 0 ? (
            results.issues.map((issue, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded ${getSeverityColor(issue.severity).replace("text-", "bg-").replace("-600", "-100")}`}
                  >
                    {getIssueIcon(issue.type)}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{issue.type} Detection</p>
                    <p className={`text-sm ${getSeverityColor(issue.severity)}`}>
                      {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)} severity
                    </p>
                    <p className="text-xs text-muted-foreground">{issue.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{Math.round(issue.score * 100)}%</p>
                  <p className="text-xs text-muted-foreground">Issue score</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">No significant quality issues detected</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview with Overlay */}
      {imageUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Analyzed Image</CardTitle>
            <CardDescription>Original image with quality assessment overlay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-hidden rounded-lg border border-border">
              <img src={imageUrl || "/placeholder.svg"} alt="Analyzed image" className="h-64 w-full object-cover" />
              <div className="absolute top-2 right-2">
                <Badge className={`${getQualityColor(results.overallQuality)} text-white`}>
                  {results.overallQuality}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
