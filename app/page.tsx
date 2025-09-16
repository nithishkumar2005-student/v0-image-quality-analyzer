"use client"

import { useState } from "react"
import { Upload, ImageIcon, Zap, Eye, Contrast } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/image-upload"
import { AnalysisResults } from "@/components/analysis-results"
import { ImageAnalyzer, type ImageAnalysisResult } from "@/lib/image-analysis"

export default function ImageQualityAnalyzer() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<ImageAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl)
    setAnalysisResults(null)
  }

  const handleAnalyze = async () => {
    if (!uploadedImage) return

    setIsAnalyzing(true)

    try {
      const analyzer = new ImageAnalyzer()
      const results = await analyzer.analyzeImage(uploadedImage)
      setAnalysisResults(results)
    } catch (error) {
      console.error("Analysis failed:", error)
      // Fallback to API call if client-side analysis fails
      try {
        const response = await fetch("/api/analyze-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: uploadedImage }),
        })

        if (response.ok) {
          const results = await response.json()
          setAnalysisResults(results)
        } else {
          throw new Error("API analysis failed")
        }
      } catch (apiError) {
        console.error("API analysis also failed:", apiError)
        // Show error state or fallback results
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Eye className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Image Quality Analyzer</h1>
              <p className="text-sm text-muted-foreground">Advanced AI-powered image quality assessment and analysis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Image
                </CardTitle>
                <CardDescription>Upload an image to analyze its quality using our AI-powered system</CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload onImageUpload={handleImageUpload} />

                {uploadedImage && (
                  <div className="mt-6 space-y-4">
                    <div className="relative overflow-hidden rounded-lg border border-border">
                      <img
                        src={uploadedImage || "/placeholder.svg"}
                        alt="Uploaded image"
                        className="h-64 w-full object-cover"
                      />
                    </div>
                    <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
                      {isAnalyzing ? (
                        <>
                          <Zap className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Analyze Image Quality
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Features</CardTitle>
                <CardDescription>Our AI system analyzes multiple quality aspects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-chart-1/10">
                    <Eye className="h-4 w-4 text-chart-1" />
                  </div>
                  <div>
                    <p className="font-medium">Blur Detection</p>
                    <p className="text-sm text-muted-foreground">Identifies motion blur and focus issues</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-chart-2/10">
                    <Contrast className="h-4 w-4 text-chart-2" />
                  </div>
                  <div>
                    <p className="font-medium">Contrast Analysis</p>
                    <p className="text-sm text-muted-foreground">Evaluates dynamic range and contrast levels</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-chart-3/10">
                    <ImageIcon className="h-4 w-4 text-chart-3" />
                  </div>
                  <div>
                    <p className="font-medium">Overall Quality</p>
                    <p className="text-sm text-muted-foreground">AI-powered comprehensive quality assessment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div>
            {analysisResults ? (
              <AnalysisResults results={analysisResults} imageUrl={uploadedImage} />
            ) : (
              <Card className="h-full">
                <CardContent className="flex h-full items-center justify-center p-8">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium text-foreground">No Analysis Yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Upload an image and click analyze to see quality assessment results
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
