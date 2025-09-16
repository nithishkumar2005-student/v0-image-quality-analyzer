// Advanced blur detection algorithms
export interface BlurAnalysis {
  overallBlurScore: number
  blurType: "motion" | "focus" | "gaussian" | "none"
  blurRegions: BlurRegion[]
  confidence: number
}

export interface BlurRegion {
  x: number
  y: number
  width: number
  height: number
  blurScore: number
  type: "motion" | "focus" | "gaussian"
}

export class BlurDetector {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement("canvas")
    this.ctx = this.canvas.getContext("2d")!
  }

  analyzeBlur(imageData: ImageData): BlurAnalysis {
    const { width, height } = imageData

    // Multiple blur detection methods
    const laplacianScore = this.calculateLaplacianVariance(imageData)
    const sobelScore = this.calculateSobelVariance(imageData)
    const fftScore = this.calculateFFTSharpness(imageData)

    // Combine scores for overall assessment
    const overallBlurScore = this.combineBlurScores(laplacianScore, sobelScore, fftScore)

    // Detect blur type
    const blurType = this.detectBlurType(imageData, overallBlurScore)

    // Find blur regions
    const blurRegions = this.detectBlurRegions(imageData, width, height)

    // Calculate confidence
    const confidence = this.calculateBlurConfidence(overallBlurScore, blurRegions)

    return {
      overallBlurScore,
      blurType,
      blurRegions,
      confidence,
    }
  }

  private calculateLaplacianVariance(imageData: ImageData): number {
    const { data, width, height } = imageData
    const laplacianKernel = [0, -1, 0, -1, 4, -1, 0, -1, 0]
    let variance = 0
    let mean = 0
    let count = 0

    // First pass: calculate mean
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4
            const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
            sum += gray * laplacianKernel[(ky + 1) * 3 + (kx + 1)]
          }
        }
        mean += Math.abs(sum)
        count++
      }
    }
    mean /= count

    // Second pass: calculate variance
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4
            const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
            sum += gray * laplacianKernel[(ky + 1) * 3 + (kx + 1)]
          }
        }
        variance += Math.pow(Math.abs(sum) - mean, 2)
      }
    }

    return variance / count
  }

  private calculateSobelVariance(imageData: ImageData): number {
    const { data, width, height } = imageData
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]
    let totalMagnitude = 0
    let count = 0

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0,
          gy = 0

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4
            const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
            const kernelIdx = (ky + 1) * 3 + (kx + 1)
            gx += gray * sobelX[kernelIdx]
            gy += gray * sobelY[kernelIdx]
          }
        }

        const magnitude = Math.sqrt(gx * gx + gy * gy)
        totalMagnitude += magnitude
        count++
      }
    }

    return totalMagnitude / count
  }

  private calculateFFTSharpness(imageData: ImageData): number {
    // Simplified frequency domain analysis
    // In a real implementation, you'd use actual FFT
    const { data, width, height } = imageData
    let highFreqEnergy = 0
    let totalEnergy = 0

    // Sample-based frequency analysis using gradient magnitude
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4
        const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]

        // Calculate local gradients
        const rightIdx = (y * width + (x + 1)) * 4
        const bottomIdx = ((y + 1) * width + x) * 4
        const rightGray = 0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2]
        const bottomGray = 0.299 * data[bottomIdx] + 0.587 * data[bottomIdx + 1] + 0.114 * data[bottomIdx + 2]

        const gradX = Math.abs(rightGray - gray)
        const gradY = Math.abs(bottomGray - gray)
        const gradMagnitude = Math.sqrt(gradX * gradX + gradY * gradY)

        totalEnergy += gradMagnitude
        if (gradMagnitude > 10) {
          // Threshold for high frequency
          highFreqEnergy += gradMagnitude
        }
      }
    }

    return totalEnergy > 0 ? highFreqEnergy / totalEnergy : 0
  }

  private combineBlurScores(laplacian: number, sobel: number, fft: number): number {
    // Normalize and combine scores
    const normalizedLaplacian = Math.min(laplacian / 1000, 1)
    const normalizedSobel = Math.min(sobel / 100, 1)
    const normalizedFFT = Math.min(fft, 1)

    // Weighted combination
    return normalizedLaplacian * 0.4 + normalizedSobel * 0.4 + normalizedFFT * 0.2
  }

  private detectBlurType(imageData: ImageData, overallScore: number): "motion" | "focus" | "gaussian" | "none" {
    if (overallScore > 0.7) return "none"

    // Analyze directional blur patterns
    const horizontalBlur = this.calculateDirectionalBlur(imageData, "horizontal")
    const verticalBlur = this.calculateDirectionalBlur(imageData, "vertical")
    const diagonalBlur = this.calculateDirectionalBlur(imageData, "diagonal")

    const maxDirectional = Math.max(horizontalBlur, verticalBlur, diagonalBlur)
    const avgDirectional = (horizontalBlur + verticalBlur + diagonalBlur) / 3

    if (maxDirectional > avgDirectional * 1.5) {
      return "motion"
    } else if (overallScore < 0.3) {
      return "focus"
    } else {
      return "gaussian"
    }
  }

  private calculateDirectionalBlur(imageData: ImageData, direction: "horizontal" | "vertical" | "diagonal"): number {
    const { data, width, height } = imageData
    let totalVariance = 0
    let count = 0

    const step = direction === "horizontal" ? [1, 0] : direction === "vertical" ? [0, 1] : [1, 1]

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (x + step[0] < width && y + step[1] < height) {
          const idx1 = (y * width + x) * 4
          const idx2 = ((y + step[1]) * width + (x + step[0])) * 4

          const gray1 = 0.299 * data[idx1] + 0.587 * data[idx1 + 1] + 0.114 * data[idx1 + 2]
          const gray2 = 0.299 * data[idx2] + 0.587 * data[idx2 + 1] + 0.114 * data[idx2 + 2]

          totalVariance += Math.abs(gray2 - gray1)
          count++
        }
      }
    }

    return count > 0 ? totalVariance / count : 0
  }

  private detectBlurRegions(imageData: ImageData, width: number, height: number): BlurRegion[] {
    const regions: BlurRegion[] = []
    const blockSize = 32 // Analyze in 32x32 blocks

    for (let y = 0; y < height - blockSize; y += blockSize) {
      for (let x = 0; x < width - blockSize; x += blockSize) {
        const blockData = this.extractBlock(imageData, x, y, blockSize, blockSize)
        const blockBlurScore = this.calculateLaplacianVariance(blockData)

        if (blockBlurScore < 500) {
          // Threshold for blur
          regions.push({
            x,
            y,
            width: blockSize,
            height: blockSize,
            blurScore: 1 - Math.min(blockBlurScore / 1000, 1),
            type: blockBlurScore < 200 ? "focus" : "motion",
          })
        }
      }
    }

    return regions
  }

  private extractBlock(
    imageData: ImageData,
    startX: number,
    startY: number,
    blockWidth: number,
    blockHeight: number,
  ): ImageData {
    const { data, width } = imageData
    const blockData = new Uint8ClampedArray(blockWidth * blockHeight * 4)

    for (let y = 0; y < blockHeight; y++) {
      for (let x = 0; x < blockWidth; x++) {
        const sourceIdx = ((startY + y) * width + (startX + x)) * 4
        const targetIdx = (y * blockWidth + x) * 4

        blockData[targetIdx] = data[sourceIdx]
        blockData[targetIdx + 1] = data[sourceIdx + 1]
        blockData[targetIdx + 2] = data[sourceIdx + 2]
        blockData[targetIdx + 3] = data[sourceIdx + 3]
      }
    }

    return new ImageData(blockData, blockWidth, blockHeight)
  }

  private calculateBlurConfidence(overallScore: number, regions: BlurRegion[]): number {
    let confidence = 0.8

    // Adjust confidence based on consistency
    if (regions.length > 0) {
      const avgRegionScore = regions.reduce((sum, region) => sum + region.blurScore, 0) / regions.length
      const scoreConsistency = 1 - Math.abs(overallScore - avgRegionScore)
      confidence *= scoreConsistency
    }

    // Higher confidence for extreme values
    if (overallScore < 0.2 || overallScore > 0.8) {
      confidence += 0.1
    }

    return Math.max(0.3, Math.min(0.95, confidence))
  }
}
