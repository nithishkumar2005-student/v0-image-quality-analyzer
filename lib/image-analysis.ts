// Image analysis utilities for quality assessment
export interface ImageAnalysisResult {
  overallQuality: "Good" | "Fair" | "Poor"
  confidence: number
  issues: QualityIssue[]
  metrics: ImageMetrics
  blurAnalysis?: BlurAnalysis
  contrastBrightnessAnalysis?: any
  aiClassification?: any // Added AI classification results
}

export interface QualityIssue {
  type: "blur" | "contrast" | "brightness" | "noise" | "compression"
  severity: "low" | "medium" | "high"
  score: number
  description: string
}

export interface ImageMetrics {
  sharpness: number
  contrast: number
  brightness: number
  saturation: number
  noise: number
}

export interface BlurAnalysis {
  overallBlurScore: number
  blurType: string
  blurRegions: any[]
}

// Canvas-based image analysis functions
import { BlurDetector } from "./blur-detection"
import { ContrastBrightnessAnalyzer } from "./contrast-brightness-analysis"
import { AIQualityClassifier } from "./ai-classification" // Added AI classifier import

export class ImageAnalyzer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private blurDetector: BlurDetector
  private contrastBrightnessAnalyzer: ContrastBrightnessAnalyzer
  private aiClassifier: AIQualityClassifier // Added AI classifier

  constructor() {
    this.canvas = document.createElement("canvas")
    this.ctx = this.canvas.getContext("2d")!
    this.blurDetector = new BlurDetector()
    this.contrastBrightnessAnalyzer = new ContrastBrightnessAnalyzer()
    this.aiClassifier = new AIQualityClassifier() // Initialize AI classifier
  }

  async analyzeImage(imageUrl: string): Promise<ImageAnalysisResult> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = async () => {
        try {
          // Set canvas dimensions
          this.canvas.width = img.width
          this.canvas.height = img.height

          // Draw image to canvas
          this.ctx.drawImage(img, 0, 0)

          // Get image data
          const imageData = this.ctx.getImageData(0, 0, img.width, img.height)

          // Perform analysis
          const metrics = this.calculateMetrics(imageData)
          const blurAnalysis = this.blurDetector.analyzeBlur(imageData)
          const contrastBrightnessAnalysisResult = this.contrastBrightnessAnalyzer.analyzeContrastBrightness(imageData)

          const aiClassification = await this.aiClassifier.classifyImage(
            imageData,
            metrics,
            blurAnalysis,
            contrastBrightnessAnalysisResult,
          )

          const issues = this.detectIssues(metrics, blurAnalysis, contrastBrightnessAnalysisResult)
          const overallQuality = this.determineOverallQuality(metrics, issues, aiClassification) // Pass AI results
          const confidence = this.calculateConfidence(metrics, issues, aiClassification) // Pass AI results

          resolve({
            overallQuality,
            confidence,
            issues,
            metrics,
            blurAnalysis,
            contrastBrightnessAnalysis: contrastBrightnessAnalysisResult,
            aiClassification, // Include AI classification results
          })
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = imageUrl
    })
  }

  private calculateMetrics(imageData: ImageData): ImageMetrics {
    const { data, width, height } = imageData
    const pixelCount = width * height

    let totalBrightness = 0
    let totalContrast = 0
    let totalSaturation = 0
    let sharpnessSum = 0
    let noiseSum = 0

    // Calculate basic metrics
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Brightness (luminance)
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b
      totalBrightness += brightness

      // Saturation
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const saturation = max === 0 ? 0 : (max - min) / max
      totalSaturation += saturation
    }

    // Calculate sharpness using Laplacian operator
    sharpnessSum = this.calculateSharpness(imageData)

    // Calculate contrast using standard deviation of brightness
    totalContrast = this.calculateContrast(imageData, totalBrightness / pixelCount)

    // Calculate noise estimation
    noiseSum = this.calculateNoise(imageData)

    return {
      sharpness: Math.min(sharpnessSum / pixelCount, 1),
      contrast: Math.min(totalContrast / 255, 1),
      brightness: totalBrightness / pixelCount / 255,
      saturation: totalSaturation / pixelCount,
      noise: Math.min(noiseSum / pixelCount, 1),
    }
  }

  private calculateSharpness(imageData: ImageData): number {
    const { data, width, height } = imageData
    let sharpness = 0

    // Laplacian kernel for edge detection
    const kernel = [0, -1, 0, -1, 4, -1, 0, -1, 0]

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4
            const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
            sum += gray * kernel[(ky + 1) * 3 + (kx + 1)]
          }
        }
        sharpness += Math.abs(sum)
      }
    }

    return sharpness
  }

  private calculateContrast(imageData: ImageData, avgBrightness: number): number {
    const { data } = imageData
    let variance = 0

    for (let i = 0; i < data.length; i += 4) {
      const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      variance += Math.pow(brightness - avgBrightness, 2)
    }

    return Math.sqrt(variance / (data.length / 4))
  }

  private calculateNoise(imageData: ImageData): number {
    const { data, width, height } = imageData
    let noise = 0

    // Simple noise estimation using local variance
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const centerIdx = (y * width + x) * 4
        const centerGray = 0.299 * data[centerIdx] + 0.587 * data[centerIdx + 1] + 0.114 * data[centerIdx + 2]

        let localVariance = 0
        let count = 0

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4
            const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
            localVariance += Math.pow(gray - centerGray, 2)
            count++
          }
        }

        noise += localVariance / count
      }
    }

    return noise
  }

  private detectIssues(
    metrics: ImageMetrics,
    blurAnalysis?: BlurAnalysis,
    contrastBrightnessAnalysis?: any,
  ): QualityIssue[] {
    const issues: QualityIssue[] = []

    // Enhanced blur detection using advanced analysis
    if (blurAnalysis && blurAnalysis.overallBlurScore < 0.5) {
      issues.push({
        type: "blur",
        severity:
          blurAnalysis.overallBlurScore < 0.2 ? "high" : blurAnalysis.overallBlurScore < 0.35 ? "medium" : "low",
        score: 1 - blurAnalysis.overallBlurScore,
        description: `${blurAnalysis.blurType.charAt(0).toUpperCase() + blurAnalysis.blurType.slice(1)} blur detected with ${blurAnalysis.blurRegions.length} affected regions`,
      })
    }

    // Enhanced contrast detection using advanced analysis
    if (contrastBrightnessAnalysis) {
      const avgContrast =
        (contrastBrightnessAnalysis.contrast.globalContrast + contrastBrightnessAnalysis.contrast.localContrast) / 2
      if (avgContrast < 0.3) {
        issues.push({
          type: "contrast",
          severity: avgContrast < 0.1 ? "high" : avgContrast < 0.2 ? "medium" : "low",
          score: 1 - avgContrast,
          description: `Low contrast detected (Global: ${Math.round(contrastBrightnessAnalysis.contrast.globalContrast * 100)}%, Local: ${Math.round(contrastBrightnessAnalysis.contrast.localContrast * 100)}%)`,
        })
      }

      // Enhanced brightness detection
      if (contrastBrightnessAnalysis.brightness.exposureLevel !== "optimal") {
        const severity =
          contrastBrightnessAnalysis.exposureAnalysis.clippedShadows > 0.1 ||
          contrastBrightnessAnalysis.exposureAnalysis.clippedHighlights > 0.1
            ? "high"
            : "medium"
        issues.push({
          type: "brightness",
          severity,
          score:
            contrastBrightnessAnalysis.brightness.exposureLevel === "underexposed"
              ? 1 - contrastBrightnessAnalysis.brightness.averageBrightness * 2
              : (contrastBrightnessAnalysis.brightness.averageBrightness - 0.5) * 2,
          description: `${contrastBrightnessAnalysis.brightness.exposureLevel.charAt(0).toUpperCase() + contrastBrightnessAnalysis.brightness.exposureLevel.slice(1)} image with ${Math.round((contrastBrightnessAnalysis.exposureAnalysis.clippedShadows + contrastBrightnessAnalysis.exposureAnalysis.clippedHighlights) * 100)}% clipped pixels`,
        })
      }
    } else {
      // Fallback to basic analysis if advanced analysis fails
      if (metrics.contrast < 0.3) {
        issues.push({
          type: "contrast",
          severity: metrics.contrast < 0.1 ? "high" : metrics.contrast < 0.2 ? "medium" : "low",
          score: 1 - metrics.contrast,
          description: "Image has low contrast and may appear flat",
        })
      }

      if (metrics.brightness < 0.2 || metrics.brightness > 0.8) {
        const isUnderexposed = metrics.brightness < 0.2
        issues.push({
          type: "brightness",
          severity:
            metrics.brightness < 0.1 || metrics.brightness > 0.9
              ? "high"
              : metrics.brightness < 0.15 || metrics.brightness > 0.85
                ? "medium"
                : "low",
          score: isUnderexposed ? 1 - metrics.brightness * 5 : (metrics.brightness - 0.8) * 5,
          description: isUnderexposed ? "Image appears underexposed" : "Image appears overexposed",
        })
      }
    }

    // Noise detection
    if (metrics.noise > 0.4) {
      issues.push({
        type: "noise",
        severity: metrics.noise > 0.7 ? "high" : metrics.noise > 0.55 ? "medium" : "low",
        score: metrics.noise,
        description: "Image contains visible noise or grain",
      })
    }

    return issues
  }

  private determineOverallQuality(
    metrics: ImageMetrics,
    issues: QualityIssue[],
    aiClassification?: any,
  ): "Good" | "Fair" | "Poor" {
    if (aiClassification) {
      // Use AI classification as primary determinant
      switch (aiClassification.qualityClass) {
        case "excellent":
        case "good":
          return "Good"
        case "fair":
          return "Fair"
        case "poor":
        case "very_poor":
          return "Poor"
      }
    }

    // Fallback to original logic
    const highSeverityIssues = issues.filter((issue) => issue.severity === "high").length
    const mediumSeverityIssues = issues.filter((issue) => issue.severity === "medium").length

    if (highSeverityIssues > 0 || mediumSeverityIssues > 2) {
      return "Poor"
    } else if (mediumSeverityIssues > 0 || issues.length > 2) {
      return "Fair"
    } else {
      return "Good"
    }
  }

  private calculateConfidence(metrics: ImageMetrics, issues: QualityIssue[], aiClassification?: any): number {
    let confidence = 0.8

    // Use AI confidence if available
    if (aiClassification && aiClassification.confidence) {
      confidence = (confidence + aiClassification.confidence) / 2
    }

    // Reduce confidence for edge cases
    if (metrics.brightness < 0.1 || metrics.brightness > 0.9) confidence -= 0.1
    if (metrics.contrast < 0.1) confidence -= 0.1
    if (metrics.sharpness < 0.05) confidence -= 0.1
    if (issues.length > 3) confidence -= 0.05

    return Math.max(0.3, Math.min(0.95, confidence))
  }
}
