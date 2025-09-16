"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { HistogramData, BrightnessDistribution } from "@/lib/contrast-brightness-analysis"

interface HistogramChartProps {
  histogram: HistogramData
  brightnessDistribution: BrightnessDistribution
}

export function HistogramChart({ histogram, brightnessDistribution }: HistogramChartProps) {
  const maxCount = useMemo(() => {
    return Math.max(...histogram.red, ...histogram.green, ...histogram.blue, ...histogram.luminance)
  }, [histogram])

  const normalizeValue = (value: number) => (value / maxCount) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histogram Analysis</CardTitle>
        <CardDescription>Color and luminance distribution</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Brightness Distribution Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {Math.round(brightnessDistribution.shadows * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Shadows</div>
            <Badge variant="outline" className="mt-1">
              0-85
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {Math.round(brightnessDistribution.midtones * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Midtones</div>
            <Badge variant="outline" className="mt-1">
              86-170
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {Math.round(brightnessDistribution.highlights * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Highlights</div>
            <Badge variant="outline" className="mt-1">
              171-255
            </Badge>
          </div>
        </div>

        {/* Luminance Histogram */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Luminance Distribution</h4>
          <div className="relative h-32 bg-muted rounded-lg p-2">
            <svg width="100%" height="100%" className="overflow-visible">
              {histogram.luminance.map((count, index) => {
                const height = normalizeValue(count)
                const x = (index / 255) * 100
                return (
                  <rect
                    key={index}
                    x={`${x}%`}
                    y={`${100 - height}%`}
                    width="0.4%"
                    height={`${height}%`}
                    fill="currentColor"
                    className="text-foreground opacity-70"
                  />
                )
              })}
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
              <span>0</span>
              <span>128</span>
              <span>255</span>
            </div>
          </div>
        </div>

        {/* RGB Histograms */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Color Channel Distribution</h4>

          {/* Red Channel */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm">Red Channel</span>
            </div>
            <div className="relative h-16 bg-muted rounded">
              <svg width="100%" height="100%">
                {histogram.red.map((count, index) => {
                  const height = normalizeValue(count)
                  const x = (index / 255) * 100
                  return (
                    <rect
                      key={index}
                      x={`${x}%`}
                      y={`${100 - height}%`}
                      width="0.4%"
                      height={`${height}%`}
                      fill="rgb(239, 68, 68)"
                      opacity="0.7"
                    />
                  )
                })}
              </svg>
            </div>
          </div>

          {/* Green Channel */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm">Green Channel</span>
            </div>
            <div className="relative h-16 bg-muted rounded">
              <svg width="100%" height="100%">
                {histogram.green.map((count, index) => {
                  const height = normalizeValue(count)
                  const x = (index / 255) * 100
                  return (
                    <rect
                      key={index}
                      x={`${x}%`}
                      y={`${100 - height}%`}
                      width="0.4%"
                      height={`${height}%`}
                      fill="rgb(34, 197, 94)"
                      opacity="0.7"
                    />
                  )
                })}
              </svg>
            </div>
          </div>

          {/* Blue Channel */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm">Blue Channel</span>
            </div>
            <div className="relative h-16 bg-muted rounded">
              <svg width="100%" height="100%">
                {histogram.blue.map((count, index) => {
                  const height = normalizeValue(count)
                  const x = (index / 255) * 100
                  return (
                    <rect
                      key={index}
                      x={`${x}%`}
                      y={`${100 - height}%`}
                      width="0.4%"
                      height={`${height}%`}
                      fill="rgb(59, 130, 246)"
                      opacity="0.7"
                    />
                  )
                })}
              </svg>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
