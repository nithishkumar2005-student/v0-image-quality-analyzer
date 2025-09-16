"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { BlurAnalysis } from "@/lib/blur-detection"

interface BlurVisualizationProps {
  imageUrl: string
  blurAnalysis: BlurAnalysis
}

export function BlurVisualization({ imageUrl, blurAnalysis }: BlurVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")!
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      // Set canvas size
      canvas.width = img.width
      canvas.height = img.height

      // Draw original image
      ctx.drawImage(img, 0, 0)

      // Draw blur region overlays
      ctx.fillStyle = "rgba(255, 0, 0, 0.3)"
      ctx.strokeStyle = "rgba(255, 0, 0, 0.8)"
      ctx.lineWidth = 2

      blurAnalysis.blurRegions.forEach((region) => {
        // Draw semi-transparent overlay
        ctx.fillRect(region.x, region.y, region.width, region.height)

        // Draw border
        ctx.strokeRect(region.x, region.y, region.width, region.height)

        // Add blur score text
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
        ctx.fillRect(region.x, region.y, 60, 20)
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
        ctx.font = "12px Arial"
        ctx.fillText(`${Math.round(region.blurScore * 100)}%`, region.x + 5, region.y + 15)
        ctx.fillStyle = "rgba(255, 0, 0, 0.3)"
      })
    }

    img.src = imageUrl
  }, [imageUrl, blurAnalysis])

  const getBlurTypeColor = (type: string) => {
    switch (type) {
      case "motion":
        return "bg-orange-500"
      case "focus":
        return "bg-red-500"
      case "gaussian":
        return "bg-yellow-500"
      default:
        return "bg-green-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Blur Analysis
          <Badge className={`${getBlurTypeColor(blurAnalysis.blurType)} text-white`}>
            {blurAnalysis.blurType === "none" ? "Sharp" : `${blurAnalysis.blurType} blur`}
          </Badge>
        </CardTitle>
        <CardDescription>Advanced blur detection with regional analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Overall Blur Score:</span>
            <span className="ml-2">{Math.round(blurAnalysis.overallBlurScore * 100)}%</span>
          </div>
          <div>
            <span className="font-medium">Confidence:</span>
            <span className="ml-2">{Math.round(blurAnalysis.confidence * 100)}%</span>
          </div>
          <div>
            <span className="font-medium">Blur Type:</span>
            <span className="ml-2 capitalize">{blurAnalysis.blurType}</span>
          </div>
          <div>
            <span className="font-medium">Affected Regions:</span>
            <span className="ml-2">{blurAnalysis.blurRegions.length}</span>
          </div>
        </div>

        {blurAnalysis.blurRegions.length > 0 && (
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto border border-border rounded-lg"
              style={{ maxHeight: "300px" }}
            />
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              Red areas indicate blur regions
            </div>
          </div>
        )}

        {blurAnalysis.blurRegions.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">No significant blur regions detected</div>
        )}
      </CardContent>
    </Card>
  )
}
