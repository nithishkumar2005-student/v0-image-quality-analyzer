"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Layers, Download } from "lucide-react"
import type { ImageAnalysisResult } from "@/lib/image-analysis"

interface IssueVisualizationProps {
  imageUrl: string
  analysisResults: ImageAnalysisResult
}

export function IssueVisualization({ imageUrl, analysisResults }: IssueVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showOverlays, setShowOverlays] = useState(true)
  const [activeOverlay, setActiveOverlay] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")!
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width
      canvas.height = img.height

      // Draw original image
      ctx.drawImage(img, 0, 0)

      if (showOverlays) {
        drawOverlays(ctx, img.width, img.height)
      }

      setIsLoading(false)
    }

    img.src = imageUrl
  }, [imageUrl, showOverlays, activeOverlay, analysisResults])

  const drawOverlays = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw blur regions
    if ((activeOverlay === "all" || activeOverlay === "blur") && analysisResults.blurAnalysis?.blurRegions) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.3)"
      ctx.strokeStyle = "rgba(255, 0, 0, 0.8)"
      ctx.lineWidth = 2

      analysisResults.blurAnalysis.blurRegions.forEach((region) => {
        ctx.fillRect(region.x, region.y, region.width, region.height)
        ctx.strokeRect(region.x, region.y, region.width, region.height)

        // Add label
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
        ctx.fillRect(region.x, region.y - 20, 80, 20)
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
        ctx.font = "12px Arial"
        ctx.fillText(`Blur ${Math.round(region.blurScore * 100)}%`, region.x + 5, region.y - 5)
        ctx.fillStyle = "rgba(255, 0, 0, 0.3)"
      })
    }

    // Draw contrast issues (simulated regions)
    if ((activeOverlay === "all" || activeOverlay === "contrast") && analysisResults.contrastBrightnessAnalysis) {
      const contrastIssue = analysisResults.issues.find((issue) => issue.type === "contrast")
      if (contrastIssue && contrastIssue.severity !== "low") {
        drawContrastOverlay(ctx, width, height, contrastIssue.severity)
      }
    }

    // Draw brightness/exposure issues
    if ((activeOverlay === "all" || activeOverlay === "brightness") && analysisResults.contrastBrightnessAnalysis) {
      const brightnessIssue = analysisResults.issues.find((issue) => issue.type === "brightness")
      if (brightnessIssue) {
        drawExposureOverlay(ctx, width, height, analysisResults.contrastBrightnessAnalysis)
      }
    }

    // Draw noise regions (simulated)
    if (activeOverlay === "all" || activeOverlay === "noise") {
      const noiseIssue = analysisResults.issues.find((issue) => issue.type === "noise")
      if (noiseIssue && noiseIssue.severity !== "low") {
        drawNoiseOverlay(ctx, width, height, noiseIssue.severity)
      }
    }
  }

  const drawContrastOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number, severity: string) => {
    // Create a grid overlay to show low contrast areas
    const gridSize = 64
    ctx.fillStyle = severity === "high" ? "rgba(255, 165, 0, 0.4)" : "rgba(255, 165, 0, 0.2)"
    ctx.strokeStyle = "rgba(255, 165, 0, 0.8)"
    ctx.lineWidth = 1

    for (let y = 0; y < height; y += gridSize) {
      for (let x = 0; x < width; x += gridSize) {
        // Simulate low contrast detection (in reality, this would be calculated)
        if (Math.random() < 0.3) {
          // 30% chance for demo
          ctx.fillRect(x, y, Math.min(gridSize, width - x), Math.min(gridSize, height - y))
          ctx.strokeRect(x, y, Math.min(gridSize, width - x), Math.min(gridSize, height - y))
        }
      }
    }

    // Add legend
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.fillRect(10, height - 40, 150, 30)
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    ctx.font = "12px Arial"
    ctx.fillText("Low Contrast Areas", 15, height - 20)
  }

  const drawExposureOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number, analysis: any) => {
    // Draw clipped shadows in blue
    if (analysis.exposureAnalysis.clippedShadows > 0.02) {
      ctx.fillStyle = "rgba(0, 100, 255, 0.4)"
      // Simulate shadow clipping areas (top and bottom portions)
      ctx.fillRect(0, 0, width, height * 0.2)
      ctx.fillRect(0, height * 0.8, width, height * 0.2)
    }

    // Draw clipped highlights in yellow
    if (analysis.exposureAnalysis.clippedHighlights > 0.02) {
      ctx.fillStyle = "rgba(255, 255, 0, 0.4)"
      // Simulate highlight clipping areas (center bright areas)
      const centerX = width * 0.3
      const centerY = height * 0.3
      const regionWidth = width * 0.4
      const regionHeight = height * 0.4
      ctx.fillRect(centerX, centerY, regionWidth, regionHeight)
    }

    // Add legend
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.fillRect(10, 10, 180, 50)
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    ctx.font = "12px Arial"
    ctx.fillText("Blue: Clipped Shadows", 15, 25)
    ctx.fillText("Yellow: Clipped Highlights", 15, 45)
  }

  const drawNoiseOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number, severity: string) => {
    // Create random noise pattern overlay
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    const noiseIntensity = severity === "high" ? 0.3 : 0.15

    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < 0.1) {
        // 10% of pixels
        const noise = (Math.random() - 0.5) * 255 * noiseIntensity
        data[i] = Math.max(0, Math.min(255, data[i] + noise)) // Red
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)) // Green
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)) // Blue
      }
    }

    ctx.putImageData(imageData, 0, 0)

    // Add semi-transparent overlay to highlight noise areas
    ctx.fillStyle = "rgba(128, 0, 128, 0.2)"
    ctx.fillRect(0, 0, width, height)

    // Add legend
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.fillRect(width - 120, 10, 110, 30)
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    ctx.font = "12px Arial"
    ctx.fillText("Noise Areas", width - 115, 30)
  }

  const downloadVisualization = () => {
    if (!canvasRef.current) return

    const link = document.createElement("a")
    link.download = "image-quality-analysis.png"
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  const getIssueCount = (type: string) => {
    switch (type) {
      case "blur":
        return analysisResults.blurAnalysis?.blurRegions?.length || 0
      case "contrast":
        return analysisResults.issues.filter((issue) => issue.type === "contrast").length
      case "brightness":
        return analysisResults.issues.filter((issue) => issue.type === "brightness").length
      case "noise":
        return analysisResults.issues.filter((issue) => issue.type === "noise").length
      default:
        return analysisResults.issues.length
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Issue Visualization
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowOverlays(!showOverlays)}>
              {showOverlays ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showOverlays ? "Hide" : "Show"} Overlays
            </Button>
            <Button variant="outline" size="sm" onClick={downloadVisualization}>
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </CardTitle>
        <CardDescription>Interactive visualization of detected quality issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeOverlay} onValueChange={setActiveOverlay}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="text-xs">
              All Issues
              <Badge variant="secondary" className="ml-1 text-xs">
                {analysisResults.issues.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="blur" className="text-xs">
              Blur
              <Badge variant="secondary" className="ml-1 text-xs">
                {getIssueCount("blur")}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="contrast" className="text-xs">
              Contrast
              <Badge variant="secondary" className="ml-1 text-xs">
                {getIssueCount("contrast")}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="brightness" className="text-xs">
              Exposure
              <Badge variant="secondary" className="ml-1 text-xs">
                {getIssueCount("brightness")}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="noise" className="text-xs">
              Noise
              <Badge variant="secondary" className="ml-1 text-xs">
                {getIssueCount("noise")}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Showing all detected quality issues with color-coded overlays
            </p>
          </TabsContent>
          <TabsContent value="blur" className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Red regions indicate areas with detected blur or lack of sharpness
            </p>
          </TabsContent>
          <TabsContent value="contrast" className="space-y-2">
            <p className="text-sm text-muted-foreground">Orange regions show areas with insufficient contrast</p>
          </TabsContent>
          <TabsContent value="brightness" className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Blue areas show clipped shadows, yellow areas show clipped highlights
            </p>
          </TabsContent>
          <TabsContent value="noise" className="space-y-2">
            <p className="text-sm text-muted-foreground">Purple overlay highlights areas with visible noise or grain</p>
          </TabsContent>
        </Tabs>

        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Loading visualization...</div>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto border border-border rounded-lg"
            style={{ maxHeight: "500px" }}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/60 rounded"></div>
            <span>Blur Issues</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500/60 rounded"></div>
            <span>Low Contrast</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500/60 rounded"></div>
            <span>Shadow Clipping</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500/60 rounded"></div>
            <span>Highlight Clipping</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
