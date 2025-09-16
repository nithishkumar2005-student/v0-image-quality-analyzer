"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Lightbulb, Award, CheckCircle, AlertCircle, Star, Zap } from "lucide-react"
import type { AIClassificationResult } from "@/lib/ai-classification"

interface AIClassificationResultsProps {
  results: AIClassificationResult
}

export function AIClassificationResults({ results }: AIClassificationResultsProps) {
  const getQualityClassColor = (qualityClass: string) => {
    switch (qualityClass) {
      case "excellent":
        return "bg-purple-500"
      case "good":
        return "bg-green-500"
      case "fair":
        return "bg-yellow-500"
      case "poor":
        return "bg-orange-500"
      case "very_poor":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "low":
        return "text-green-600 bg-green-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getFeatureIcon = (score: number) => {
    if (score >= 0.8) return <Star className="h-4 w-4 text-yellow-500" />
    if (score >= 0.6) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <AlertCircle className="h-4 w-4 text-orange-500" />
  }

  return (
    <div className="space-y-6">
      {/* AI Classification Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AI Quality Classification
            </div>
            <Badge className={`${getQualityClassColor(results.qualityClass)} text-white text-lg px-3 py-1`}>
              {results.qualityClass.replace("_", " ").toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>Advanced AI-powered quality assessment and classification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>AI Confidence</span>
              <span className="font-medium">{Math.round(results.confidence * 100)}%</span>
            </div>
            <Progress value={results.confidence * 100} className="h-2" />
          </div>

          {results.features.professionalGrade && (
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Award className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Professional Grade Quality</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>AI Feature Analysis</CardTitle>
          <CardDescription>Detailed breakdown of image characteristics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getFeatureIcon(results.features.aestheticScore)}
                  <span className="text-sm font-medium">Aesthetic Score</span>
                </div>
                <span className="font-semibold">{Math.round(results.features.aestheticScore * 100)}%</span>
              </div>
              <Progress value={results.features.aestheticScore * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getFeatureIcon(results.features.technicalScore)}
                  <span className="text-sm font-medium">Technical Score</span>
                </div>
                <span className="font-semibold">{Math.round(results.features.technicalScore * 100)}%</span>
              </div>
              <Progress value={results.features.technicalScore * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getFeatureIcon(results.features.compositionScore)}
                  <span className="text-sm font-medium">Composition Score</span>
                </div>
                <span className="font-semibold">{Math.round(results.features.compositionScore * 100)}%</span>
              </div>
              <Progress value={results.features.compositionScore * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getFeatureIcon(results.features.colorHarmony)}
                  <span className="text-sm font-medium">Color Harmony</span>
                </div>
                <span className="font-semibold">{Math.round(results.features.colorHarmony * 100)}%</span>
              </div>
              <Progress value={results.features.colorHarmony * 100} className="h-2" />
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Visual Complexity</span>
              <Badge variant="outline">
                {results.features.visualComplexity > 0.7
                  ? "High"
                  : results.features.visualComplexity > 0.4
                    ? "Medium"
                    : "Low"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {results.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Recommendations
            </CardTitle>
            <CardDescription>Personalized suggestions to improve image quality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                <div className="flex-shrink-0">
                  <Badge className={getPriorityColor(recommendation.priority)} variant="secondary">
                    {recommendation.priority}
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="font-medium capitalize mb-1">{recommendation.category} Improvement</p>
                  <p className="text-sm text-muted-foreground mb-2">{recommendation.suggestion}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Expected improvement:</span>
                    <Badge variant="outline" className="text-xs">
                      +{Math.round(recommendation.expectedImprovement * 100)}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Technical Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Assessment</CardTitle>
          <CardDescription>Suitability for different use cases</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Print Suitable</span>
              <Badge variant={results.technicalAssessment.suitableForPrint ? "default" : "secondary"}>
                {results.technicalAssessment.suitableForPrint ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Web Optimized</span>
              <Badge variant={results.technicalAssessment.webOptimized ? "default" : "secondary"}>
                {results.technicalAssessment.webOptimized ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Professional Use</span>
              <Badge variant={results.technicalAssessment.professionalUse ? "default" : "secondary"}>
                {results.technicalAssessment.professionalUse ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Archival Quality</span>
              <Badge variant={results.technicalAssessment.archivalQuality ? "default" : "secondary"}>
                {results.technicalAssessment.archivalQuality ? "Yes" : "No"}
              </Badge>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium mb-2">Recommended Uses</h4>
            <div className="flex flex-wrap gap-2">
              {results.technicalAssessment.recommendedUses.map((use, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {use}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
