// Advanced contrast and brightness analysis
export interface ContrastBrightnessAnalysis {
  contrast: ContrastMetrics
  brightness: BrightnessMetrics
  histogram: HistogramData
  dynamicRange: number
  exposureAnalysis: ExposureAnalysis
}

export interface ContrastMetrics {
  globalContrast: number
  localContrast: number
  michelsonContrast: number
  rmsContrast: number
  contrastRatio: number
}

export interface BrightnessMetrics {
  averageBrightness: number
  medianBrightness: number
  brightnessDistribution: BrightnessDistribution
  exposureLevel: "underexposed" | "optimal" | "overexposed"
}

export interface BrightnessDistribution {
  shadows: number // 0-85
  midtones: number // 86-170
  highlights: number // 171-255
}

export interface HistogramData {
  red: number[]
  green: number[]
  blue: number[]
  luminance: number[]
  bins: number
}

export interface ExposureAnalysis {
  clippedShadows: number
  clippedHighlights: number
  optimalExposure: boolean
  recommendedAdjustment: string
}

export class ContrastBrightnessAnalyzer {
  private readonly HISTOGRAM_BINS = 256

  analyzeContrastBrightness(imageData: ImageData): ContrastBrightnessAnalysis {
    const histogram = this.calculateHistogram(imageData)
    const contrast = this.calculateContrastMetrics(imageData, histogram)
    const brightness = this.calculateBrightnessMetrics(imageData, histogram)
    const dynamicRange = this.calculateDynamicRange(histogram)
    const exposureAnalysis = this.analyzeExposure(histogram, brightness)

    return {
      contrast,
      brightness,
      histogram,
      dynamicRange,
      exposureAnalysis,
    }
  }

  private calculateHistogram(imageData: ImageData): HistogramData {
    const { data } = imageData
    const red = new Array(this.HISTOGRAM_BINS).fill(0)
    const green = new Array(this.HISTOGRAM_BINS).fill(0)
    const blue = new Array(this.HISTOGRAM_BINS).fill(0)
    const luminance = new Array(this.HISTOGRAM_BINS).fill(0)

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Increment color histograms
      red[r]++
      green[g]++
      blue[b]++

      // Calculate luminance and increment luminance histogram
      const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
      luminance[lum]++
    }

    return {
      red,
      green,
      blue,
      luminance,
      bins: this.HISTOGRAM_BINS,
    }
  }

  private calculateContrastMetrics(imageData: ImageData, histogram: HistogramData): ContrastMetrics {
    const { data, width, height } = imageData
    const pixelCount = width * height

    // Global contrast (standard deviation of luminance)
    let mean = 0
    let totalPixels = 0

    for (let i = 0; i < histogram.luminance.length; i++) {
      mean += i * histogram.luminance[i]
      totalPixels += histogram.luminance[i]
    }
    mean /= totalPixels

    let variance = 0
    for (let i = 0; i < histogram.luminance.length; i++) {
      variance += histogram.luminance[i] * Math.pow(i - mean, 2)
    }
    const globalContrast = Math.sqrt(variance / totalPixels) / 255

    // Local contrast using sliding window
    const localContrast = this.calculateLocalContrast(imageData)

    // Michelson contrast
    const maxLum = this.findMaxNonZero(histogram.luminance)
    const minLum = this.findMinNonZero(histogram.luminance)
    const michelsonContrast = (maxLum - minLum) / (maxLum + minLum)

    // RMS contrast
    let rmsSum = 0
    for (let i = 0; i < histogram.luminance.length; i++) {
      rmsSum += histogram.luminance[i] * Math.pow(i - mean, 2)
    }
    const rmsContrast = Math.sqrt(rmsSum / totalPixels) / 255

    // Contrast ratio (Weber contrast)
    const contrastRatio = this.calculateContrastRatio(histogram)

    return {
      globalContrast,
      localContrast,
      michelsonContrast,
      rmsContrast,
      contrastRatio,
    }
  }

  private calculateLocalContrast(imageData: ImageData): number {
    const { data, width, height } = imageData
    const windowSize = 5
    let totalLocalContrast = 0
    let windowCount = 0

    for (let y = windowSize; y < height - windowSize; y += windowSize) {
      for (let x = windowSize; x < width - windowSize; x += windowSize) {
        let min = 255
        let max = 0

        // Analyze window
        for (let wy = -windowSize; wy <= windowSize; wy++) {
          for (let wx = -windowSize; wx <= windowSize; wx++) {
            const idx = ((y + wy) * width + (x + wx)) * 4
            const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
            min = Math.min(min, lum)
            max = Math.max(max, lum)
          }
        }

        if (max + min > 0) {
          totalLocalContrast += (max - min) / (max + min)
          windowCount++
        }
      }
    }

    return windowCount > 0 ? totalLocalContrast / windowCount : 0
  }

  private calculateBrightnessMetrics(imageData: ImageData, histogram: HistogramData): BrightnessMetrics {
    const totalPixels = imageData.width * imageData.height

    // Average brightness
    let weightedSum = 0
    for (let i = 0; i < histogram.luminance.length; i++) {
      weightedSum += i * histogram.luminance[i]
    }
    const averageBrightness = weightedSum / totalPixels / 255

    // Median brightness
    const medianBrightness = this.calculateMedianFromHistogram(histogram.luminance) / 255

    // Brightness distribution
    let shadows = 0
    let midtones = 0
    let highlights = 0

    for (let i = 0; i < histogram.luminance.length; i++) {
      if (i <= 85) {
        shadows += histogram.luminance[i]
      } else if (i <= 170) {
        midtones += histogram.luminance[i]
      } else {
        highlights += histogram.luminance[i]
      }
    }

    const brightnessDistribution: BrightnessDistribution = {
      shadows: shadows / totalPixels,
      midtones: midtones / totalPixels,
      highlights: highlights / totalPixels,
    }

    // Exposure level determination
    let exposureLevel: "underexposed" | "optimal" | "overexposed"
    if (averageBrightness < 0.3) {
      exposureLevel = "underexposed"
    } else if (averageBrightness > 0.7) {
      exposureLevel = "overexposed"
    } else {
      exposureLevel = "optimal"
    }

    return {
      averageBrightness,
      medianBrightness,
      brightnessDistribution,
      exposureLevel,
    }
  }

  private calculateDynamicRange(histogram: HistogramData): number {
    const minLum = this.findMinNonZero(histogram.luminance)
    const maxLum = this.findMaxNonZero(histogram.luminance)
    return (maxLum - minLum) / 255
  }

  private analyzeExposure(histogram: HistogramData, brightness: BrightnessMetrics): ExposureAnalysis {
    const totalPixels = histogram.luminance.reduce((sum, count) => sum + count, 0)

    // Calculate clipped pixels (threshold: 1% of total pixels)
    const clipThreshold = totalPixels * 0.01

    let clippedShadows = 0
    let clippedHighlights = 0

    // Count severely underexposed pixels (0-10)
    for (let i = 0; i <= 10; i++) {
      clippedShadows += histogram.luminance[i]
    }

    // Count severely overexposed pixels (245-255)
    for (let i = 245; i < 256; i++) {
      clippedHighlights += histogram.luminance[i]
    }

    const clippedShadowsPercent = clippedShadows / totalPixels
    const clippedHighlightsPercent = clippedHighlights / totalPixels

    const optimalExposure = clippedShadowsPercent < 0.02 && clippedHighlightsPercent < 0.02

    let recommendedAdjustment = "No adjustment needed"
    if (brightness.exposureLevel === "underexposed") {
      recommendedAdjustment = "Increase exposure by +0.5 to +1.5 stops"
    } else if (brightness.exposureLevel === "overexposed") {
      recommendedAdjustment = "Decrease exposure by -0.5 to -1.5 stops"
    } else if (clippedShadowsPercent > 0.05) {
      recommendedAdjustment = "Lift shadows to recover detail"
    } else if (clippedHighlightsPercent > 0.05) {
      recommendedAdjustment = "Lower highlights to recover detail"
    }

    return {
      clippedShadows: clippedShadowsPercent,
      clippedHighlights: clippedHighlightsPercent,
      optimalExposure,
      recommendedAdjustment,
    }
  }

  private findMinNonZero(histogram: number[]): number {
    for (let i = 0; i < histogram.length; i++) {
      if (histogram[i] > 0) return i
    }
    return 0
  }

  private findMaxNonZero(histogram: number[]): number {
    for (let i = histogram.length - 1; i >= 0; i--) {
      if (histogram[i] > 0) return i
    }
    return 255
  }

  private calculateMedianFromHistogram(histogram: number[]): number {
    const totalPixels = histogram.reduce((sum, count) => sum + count, 0)
    const medianTarget = totalPixels / 2
    let cumulative = 0

    for (let i = 0; i < histogram.length; i++) {
      cumulative += histogram[i]
      if (cumulative >= medianTarget) {
        return i
      }
    }
    return 128
  }

  private calculateContrastRatio(histogram: HistogramData): number {
    // Calculate 10th and 90th percentiles for robust contrast ratio
    const totalPixels = histogram.luminance.reduce((sum, count) => sum + count, 0)
    const p10Target = totalPixels * 0.1
    const p90Target = totalPixels * 0.9

    let cumulative = 0
    let p10 = 0
    let p90 = 255

    for (let i = 0; i < histogram.luminance.length; i++) {
      cumulative += histogram.luminance[i]
      if (cumulative >= p10Target && p10 === 0) {
        p10 = i
      }
      if (cumulative >= p90Target) {
        p90 = i
        break
      }
    }

    return p10 > 0 ? p90 / p10 : 1
  }
}
