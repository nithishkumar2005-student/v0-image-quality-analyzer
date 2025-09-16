// AI-powered image quality classification
export interface AIClassificationResult {
  qualityClass: "excellent" | "good" | "fair" | "poor" | "very_poor"
  confidence: number
  features: ImageFeatures
  recommendations: QualityRecommendation[]
  technicalAssessment: TechnicalAssessment
}

export interface ImageFeatures {
  aestheticScore: number
  technicalScore: number
  compositionScore: number
  colorHarmony: number
  visualComplexity: number
  professionalGrade: boolean
}

export interface QualityRecommendation {
  category: "exposure" | "sharpness" | "color" | "composition" | "noise"
  priority: "high" | "medium" | "low"
  suggestion: string
  expectedImprovement: number
}

export interface TechnicalAssessment {
  suitableForPrint: boolean
  webOptimized: boolean
  professionalUse: boolean
  archivalQuality: boolean
  recommendedUses: string[]
}

export class AIQualityClassifier {
  private modelWeights: ModelWeights

  constructor() {
    // Simulated model weights - in a real implementation, these would be loaded from a trained model
    this.modelWeights = {
      sharpness: { weight: 0.25, bias: 0.1 },
      contrast: { weight: 0.2, bias: 0.05 },
      brightness: { weight: 0.15, bias: 0.0 },
      saturation: { weight: 0.1, bias: 0.0 },
      noise: { weight: -0.15, bias: 0.0 }, // Negative because less noise is better
      composition: { weight: 0.15, bias: 0.05 },
    }
  }

  async classifyImage(
    imageData: ImageData,
    basicMetrics: any,
    blurAnalysis?: any,
    contrastBrightnessAnalysis?: any,
  ): Promise<AIClassificationResult> {
    // Extract advanced features
    const features = this.extractImageFeatures(imageData, basicMetrics, blurAnalysis, contrastBrightnessAnalysis)

    // Perform AI classification
    const qualityClass = this.predictQualityClass(features, basicMetrics)
    const confidence = this.calculateClassificationConfidence(features, basicMetrics)

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      features,
      basicMetrics,
      blurAnalysis,
      contrastBrightnessAnalysis,
    )

    // Technical assessment
    const technicalAssessment = this.assessTechnicalQuality(features, basicMetrics)

    return {
      qualityClass,
      confidence,
      features,
      recommendations,
      technicalAssessment,
    }
  }

  private extractImageFeatures(
    imageData: ImageData,
    basicMetrics: any,
    blurAnalysis?: any,
    contrastBrightnessAnalysis?: any,
  ): ImageFeatures {
    // Aesthetic score based on rule of thirds, color harmony, etc.
    const aestheticScore = this.calculateAestheticScore(imageData)

    // Technical score based on sharpness, noise, exposure
    const technicalScore = this.calculateTechnicalScore(basicMetrics, blurAnalysis, contrastBrightnessAnalysis)

    // Composition score based on edge distribution, symmetry
    const compositionScore = this.calculateCompositionScore(imageData)

    // Color harmony based on color wheel relationships
    const colorHarmony = this.calculateColorHarmony(imageData)

    // Visual complexity based on edge density and texture
    const visualComplexity = this.calculateVisualComplexity(imageData)

    // Professional grade assessment
    const professionalGrade = technicalScore > 0.8 && aestheticScore > 0.7

    return {
      aestheticScore,
      technicalScore,
      compositionScore,
      colorHarmony,
      visualComplexity,
      professionalGrade,
    }
  }

  private calculateAestheticScore(imageData: ImageData): number {
    const { data, width, height } = imageData
    let score = 0.5 // Base score

    // Rule of thirds analysis
    const ruleOfThirdsScore = this.analyzeRuleOfThirds(imageData)
    score += ruleOfThirdsScore * 0.3

    // Color distribution analysis
    const colorDistributionScore = this.analyzeColorDistribution(imageData)
    score += colorDistributionScore * 0.2

    // Edge distribution (leading lines, etc.)
    const edgeDistributionScore = this.analyzeEdgeDistribution(imageData)
    score += edgeDistributionScore * 0.2

    // Symmetry and balance
    const balanceScore = this.analyzeBalance(imageData)
    score += balanceScore * 0.3

    return Math.max(0, Math.min(1, score))
  }

  private calculateTechnicalScore(basicMetrics: any, blurAnalysis?: any, contrastBrightnessAnalysis?: any): number {
    let score = 0

    // Sharpness contribution
    score += basicMetrics.sharpness * this.modelWeights.sharpness.weight + this.modelWeights.sharpness.bias

    // Contrast contribution
    score += basicMetrics.contrast * this.modelWeights.contrast.weight + this.modelWeights.contrast.bias

    // Brightness contribution (optimal around 0.5)
    const brightnessOptimal = 1 - Math.abs(basicMetrics.brightness - 0.5) * 2
    score += brightnessOptimal * this.modelWeights.brightness.weight + this.modelWeights.brightness.bias

    // Saturation contribution
    score += basicMetrics.saturation * this.modelWeights.saturation.weight + this.modelWeights.saturation.bias

    // Noise contribution (inverted - less noise is better)
    score += (1 - basicMetrics.noise) * Math.abs(this.modelWeights.noise.weight) + this.modelWeights.noise.bias

    // Advanced blur analysis bonus
    if (blurAnalysis && blurAnalysis.overallBlurScore > 0.7) {
      score += 0.1 // Bonus for sharp images
    }

    // Advanced exposure analysis
    if (contrastBrightnessAnalysis && contrastBrightnessAnalysis.exposureAnalysis.optimalExposure) {
      score += 0.1 // Bonus for optimal exposure
    }

    return Math.max(0, Math.min(1, score))
  }

  private calculateCompositionScore(imageData: ImageData): number {
    // Simplified composition analysis
    const symmetryScore = this.analyzeSymmetry(imageData)
    const leadingLinesScore = this.analyzeLeadingLines(imageData)
    const depthScore = this.analyzeDepth(imageData)

    return (symmetryScore + leadingLinesScore + depthScore) / 3
  }

  private calculateColorHarmony(imageData: ImageData): number {
    const { data } = imageData
    const colorCounts = new Map<string, number>()
    let totalPixels = 0

    // Sample colors (every 10th pixel for performance)
    for (let i = 0; i < data.length; i += 40) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Convert to HSL for better color harmony analysis
      const hsl = this.rgbToHsl(r, g, b)
      const hueGroup = Math.floor(hsl.h / 30) // Group into 12 hue segments

      colorCounts.set(hueGroup.toString(), (colorCounts.get(hueGroup.toString()) || 0) + 1)
      totalPixels++
    }

    // Analyze color harmony patterns
    const dominantColors = Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    // Check for complementary, analogous, or triadic harmony
    let harmonyScore = 0.5

    if (dominantColors.length >= 2) {
      const hue1 = Number.parseInt(dominantColors[0][0])
      const hue2 = Number.parseInt(dominantColors[1][0])
      const hueDiff = Math.abs(hue1 - hue2)

      // Complementary colors (opposite on color wheel)
      if (hueDiff === 6) harmonyScore += 0.3
      // Analogous colors (adjacent)
      else if (hueDiff <= 2) harmonyScore += 0.2
      // Triadic
      else if (hueDiff === 4) harmonyScore += 0.25
    }

    return Math.max(0, Math.min(1, harmonyScore))
  }

  private calculateVisualComplexity(imageData: ImageData): number {
    // Calculate edge density as a measure of complexity
    const edgeDensity = this.calculateEdgeDensity(imageData)
    const textureDensity = this.calculateTextureDensity(imageData)

    return (edgeDensity + textureDensity) / 2
  }

  private predictQualityClass(
    features: ImageFeatures,
    basicMetrics: any,
  ): "excellent" | "good" | "fair" | "poor" | "very_poor" {
    const overallScore = features.technicalScore * 0.4 + features.aestheticScore * 0.3 + features.compositionScore * 0.3

    if (overallScore >= 0.9 && features.professionalGrade) return "excellent"
    if (overallScore >= 0.75) return "good"
    if (overallScore >= 0.5) return "fair"
    if (overallScore >= 0.25) return "poor"
    return "very_poor"
  }

  private calculateClassificationConfidence(features: ImageFeatures, basicMetrics: any): number {
    // Base confidence on consistency of metrics
    let confidence = 0.8

    // Higher confidence for extreme values
    const overallScore = features.technicalScore * 0.4 + features.aestheticScore * 0.3 + features.compositionScore * 0.3
    if (overallScore > 0.8 || overallScore < 0.3) confidence += 0.1

    // Reduce confidence for borderline cases
    if (overallScore > 0.45 && overallScore < 0.55) confidence -= 0.2

    return Math.max(0.3, Math.min(0.95, confidence))
  }

  private generateRecommendations(
    features: ImageFeatures,
    basicMetrics: any,
    blurAnalysis?: any,
    contrastBrightnessAnalysis?: any,
  ): QualityRecommendation[] {
    const recommendations: QualityRecommendation[] = []

    // Sharpness recommendations
    if (basicMetrics.sharpness < 0.6) {
      recommendations.push({
        category: "sharpness",
        priority: basicMetrics.sharpness < 0.3 ? "high" : "medium",
        suggestion: "Apply unsharp mask or increase camera stability to improve sharpness",
        expectedImprovement: 0.2,
      })
    }

    // Exposure recommendations
    if (contrastBrightnessAnalysis && !contrastBrightnessAnalysis.exposureAnalysis.optimalExposure) {
      recommendations.push({
        category: "exposure",
        priority:
          contrastBrightnessAnalysis.exposureAnalysis.clippedShadows > 0.1 ||
          contrastBrightnessAnalysis.exposureAnalysis.clippedHighlights > 0.1
            ? "high"
            : "medium",
        suggestion: contrastBrightnessAnalysis.exposureAnalysis.recommendedAdjustment,
        expectedImprovement: 0.15,
      })
    }

    // Color recommendations
    if (features.colorHarmony < 0.5) {
      recommendations.push({
        category: "color",
        priority: "medium",
        suggestion: "Adjust color balance or consider selective color corrections for better harmony",
        expectedImprovement: 0.1,
      })
    }

    // Noise recommendations
    if (basicMetrics.noise > 0.4) {
      recommendations.push({
        category: "noise",
        priority: basicMetrics.noise > 0.7 ? "high" : "medium",
        suggestion: "Apply noise reduction or use lower ISO settings in future captures",
        expectedImprovement: 0.15,
      })
    }

    // Composition recommendations
    if (features.compositionScore < 0.5) {
      recommendations.push({
        category: "composition",
        priority: "low",
        suggestion: "Consider cropping to improve composition using rule of thirds or leading lines",
        expectedImprovement: 0.1,
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  private assessTechnicalQuality(features: ImageFeatures, basicMetrics: any): TechnicalAssessment {
    const suitableForPrint = features.technicalScore > 0.7 && basicMetrics.sharpness > 0.6
    const webOptimized = features.technicalScore > 0.5
    const professionalUse = features.professionalGrade && features.technicalScore > 0.8
    const archivalQuality = features.technicalScore > 0.85 && basicMetrics.noise < 0.2

    const recommendedUses: string[] = []
    if (archivalQuality) recommendedUses.push("Archival storage", "Fine art printing")
    if (professionalUse) recommendedUses.push("Professional photography", "Commercial use")
    if (suitableForPrint) recommendedUses.push("High-quality printing", "Large format display")
    if (webOptimized) recommendedUses.push("Web display", "Social media")
    if (recommendedUses.length === 0) recommendedUses.push("Thumbnail use", "Low-resolution display")

    return {
      suitableForPrint,
      webOptimized,
      professionalUse,
      archivalQuality,
      recommendedUses,
    }
  }

  // Helper methods for image analysis
  private analyzeRuleOfThirds(imageData: ImageData): number {
    // Simplified rule of thirds analysis
    const { width, height } = imageData
    const thirdX = width / 3
    const thirdY = height / 3

    // Check for interesting content at intersection points
    const score = 0
    const intersections = [
      [thirdX, thirdY],
      [2 * thirdX, thirdY],
      [thirdX, 2 * thirdY],
      [2 * thirdX, 2 * thirdY],
    ]

    // This is a simplified implementation - real analysis would be more complex
    return Math.random() * 0.3 + 0.2 // Placeholder
  }

  private analyzeColorDistribution(imageData: ImageData): number {
    // Analyze color distribution evenness
    return Math.random() * 0.3 + 0.2 // Placeholder
  }

  private analyzeEdgeDistribution(imageData: ImageData): number {
    // Analyze edge distribution for leading lines
    return Math.random() * 0.3 + 0.2 // Placeholder
  }

  private analyzeBalance(imageData: ImageData): number {
    // Analyze visual balance
    return Math.random() * 0.3 + 0.2 // Placeholder
  }

  private analyzeSymmetry(imageData: ImageData): number {
    return Math.random() * 0.5 + 0.25 // Placeholder
  }

  private analyzeLeadingLines(imageData: ImageData): number {
    return Math.random() * 0.5 + 0.25 // Placeholder
  }

  private analyzeDepth(imageData: ImageData): number {
    return Math.random() * 0.5 + 0.25 // Placeholder
  }

  private calculateEdgeDensity(imageData: ImageData): number {
    // Calculate edge density using Sobel operator
    const { data, width, height } = imageData
    let edgeCount = 0
    const threshold = 50

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4
        const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]

        // Simple edge detection
        const rightIdx = (y * width + (x + 1)) * 4
        const bottomIdx = ((y + 1) * width + x) * 4
        const rightGray = 0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2]
        const bottomGray = 0.299 * data[bottomIdx] + 0.587 * data[bottomIdx + 1] + 0.114 * data[bottomIdx + 2]

        const gradX = Math.abs(rightGray - gray)
        const gradY = Math.abs(bottomGray - gray)
        const magnitude = Math.sqrt(gradX * gradX + gradY * gradY)

        if (magnitude > threshold) edgeCount++
      }
    }

    return Math.min(edgeCount / (width * height), 1)
  }

  private calculateTextureDensity(imageData: ImageData): number {
    // Simplified texture analysis using local variance
    return Math.random() * 0.5 + 0.25 // Placeholder
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return { h: h * 360, s, l }
  }
}

interface ModelWeights {
  [key: string]: { weight: number; bias: number }
}
