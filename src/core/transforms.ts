/**
 * Mathematical transformations for hyperbolic/fisheye visualization
 * Legacy equivalent: Xcloudz.math
 */

import { HyperbolicTransform } from './types';

export class HyperbolicMath {
  /**
   * Fisheye distortion inward (magnification towards center)
   * Creates the "lens" effect where items near center are larger
   * 
   * Legacy: fishIin
   * Formula: sign(x) * ((d+1)*|x|) / (d*|x| + 1)
   * 
   * @param x - Normalized coordinate (-1 to 1)
   * @param magnification - Magnification strength (higher = more zoom)
   */
  static fisheyeIn(x: number, magnification: number): number {
    const d = magnification;
    const sign = x > 0 ? 1 : -1;
    const absX = Math.abs(x);
    return sign * (((d + 1) * absX) / (d * absX + 1));
  }
  
  /**
   * Fisheye distortion outward (reverse transformation)
   * Legacy: fishIout
   * 
   * @param x - Transformed coordinate
   * @param magnification - Magnification strength
   */
  static fisheyeOut(x: number, magnification: number): number {
    const d = magnification;
    const sign = x > 0 ? 1 : -1;
    const absX = Math.abs(x);
    return sign * (-(absX / ((d * absX) - d - 1)));
  }
  
  /**
   * Convert Cartesian (x, y) to Polar (angle, radius) coordinates
   */
  static toPolar(x: number, y: number): { angle: number; radius: number } {
    return {
      angle: Math.atan2(y, x),
      radius: Math.sqrt(x * x + y * y)
    };
  }
  
  /**
   * Convert Polar (angle, radius) to Cartesian (x, y) coordinates
   */
  static toCartesian(angle: number, radius: number): { x: number; y: number } {
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    };
  }
  
  /**
   * Map node coordinates to hyperbolic space with fisheye distortion
   * 
   * Legacy equivalent: map2hyperb
   * 
   * Algorithm:
   * 1. Normalize coordinates to [-1, 1] range
   * 2. Convert to polar coordinates
   * 3. Apply fisheye transformation to radius
   * 4. Convert back to Cartesian
   * 5. Denormalize to viewport with margin
   * 
   * @param nodeX - Node X coordinate (in layout space)
   * @param nodeY - Node Y coordinate (in layout space)
   * @param width - Viewport width
   * @param height - Viewport height
   * @param magnification - Lens magnification strength (1-10+)
   * @param isLabel - Whether this is a label (applies slight offset)
   */
  static mapToHyperbolic(
    nodeX: number,
    nodeY: number,
    width: number,
    height: number,
    magnification: number,
    isLabel = false
  ): HyperbolicTransform {
    // Normalize to [-1, 1] range (center of viewport is origin)
    const normalizedX = (2 * (nodeX / width)) - 1;
    const normalizedY = (2 * (nodeY / height)) - 1;
    
    // Convert to polar coordinates
    let { angle, radius } = this.toPolar(normalizedX, normalizedY);
    
    // Apply label offset (legacy behavior for text labels)
    if (isLabel) {
      radius += 0.15;
    }
    
    // Calculate distance multiplier (unused but kept for compatibility)
    const distanceMultiplier = 1.05 / radius;
    
    // Clamp to unit circle (points outside circle snap to edge)
    const isOutsideCircle = radius > 1;
    if (isOutsideCircle) {
      radius = isLabel ? 1 + 0.15 : 1;
    }
    
    // Apply fisheye transformation to radius
    // This is the key step that creates the magnification effect
    const transformedRadius = this.fisheyeIn(radius, magnification);
    const alpha = transformedRadius; // Depth factor (0 = far, 1 = near)
    
    // Convert back to Cartesian coordinates
    const { x: transformedX, y: transformedY } = this.toCartesian(angle, transformedRadius);
    
    // Denormalize to viewport with margin
    // Legacy uses 7% margin (0.07) with 2.2x multiplier
    const margin = 0.07;
    const marginMultiplier = 2.2;
    const finalX = ((1 + transformedX) / 2) * (width - marginMultiplier * (width * margin)) + (width * margin);
    const finalY = ((1 + transformedY) / 2) * (height - marginMultiplier * (height * margin)) + (height * margin);
    
    return {
      coord: [finalX, finalY],
      dist: distanceMultiplier,
      alpha: alpha
    };
  }
  
  /**
   * Calculate Euclidean distance between two points
   */
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
  
  /**
   * Normalize node coordinates to fit within viewport with margins
   * 
   * @param nodes - Array of nodes to normalize
   * @param width - Viewport width
   * @param height - Viewport height
   * @param compression - Border compression percentage (0-100)
   */
  static normalizeCoordinates(
    nodes: Array<{ x: number; y: number }>,
    width: number,
    height: number,
    compression: number
  ): void {
    if (nodes.length === 0) return;
    
    // Find bounding box
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      if (node.x < minX) minX = node.x;
      if (node.x > maxX) maxX = node.x;
      if (node.y < minY) minY = node.y;
      if (node.y > maxY) maxY = node.y;
    });
    
    // Calculate ranges (avoid division by zero)
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    
    // Calculate margin based on compression percentage
    const marginX = width * compression / 100;
    const marginY = height * compression / 100;
    
    const availableWidth = width - 2 * marginX;
    const availableHeight = height - 2 * marginY;
    
    // Normalize to [0, 1] then scale to viewport with margins
    nodes.forEach(node => {
      node.x = ((node.x - minX) / rangeX) * availableWidth + marginX;
      node.y = ((node.y - minY) / rangeY) * availableHeight + marginY;
    });
  }
  
  /**
   * Compute transforms for all nodes (batch operation)
   * More efficient than calling mapToHyperbolic individually
   * 
   * @param nodes - Nodes with x, y coordinates
   * @param width - Viewport width
   * @param height - Viewport height
   * @param lensAugment - Magnification strength
   */
  static computeTransforms(
    nodes: Array<{ id: string; x: number; y: number }>,
    width: number,
    height: number,
    lensAugment: number
  ): Map<string, HyperbolicTransform> {
    const transforms = new Map<string, HyperbolicTransform>();
    
    nodes.forEach(node => {
      const transform = this.mapToHyperbolic(
        node.x,
        node.y,
        width,
        height,
        lensAugment,
        false
      );
      transforms.set(node.id, transform);
    });
    
    return transforms;
  }
}

