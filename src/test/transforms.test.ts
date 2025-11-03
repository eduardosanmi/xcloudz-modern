/**
 * Unit tests for HyperbolicMath transformations
 */

import { describe, it, expect } from 'vitest';
import { HyperbolicMath } from '../core/transforms';

describe('HyperbolicMath', () => {
  describe('fisheyeIn', () => {
    it('should return 0 for input 0', () => {
      const result = HyperbolicMath.fisheyeIn(0, 4);
      expect(Math.abs(result)).toBe(0); // Handle -0 vs +0
    });
    
    it('should magnify positive values', () => {
      const result = HyperbolicMath.fisheyeIn(0.5, 4);
      expect(result).toBeGreaterThan(0.5);
      expect(result).toBeLessThan(1);
    });
    
    it('should magnify negative values symmetrically', () => {
      const pos = HyperbolicMath.fisheyeIn(0.5, 4);
      const neg = HyperbolicMath.fisheyeIn(-0.5, 4);
      expect(Math.abs(pos)).toBeCloseTo(Math.abs(neg));
    });
    
    it('should increase magnification with higher d value', () => {
      const low = HyperbolicMath.fisheyeIn(0.5, 2);
      const high = HyperbolicMath.fisheyeIn(0.5, 8);
      expect(high).toBeGreaterThan(low);
    });
  });
  
  describe('toPolar', () => {
    it('should convert (1, 0) to angle 0', () => {
      const { angle, radius } = HyperbolicMath.toPolar(1, 0);
      expect(angle).toBeCloseTo(0);
      expect(radius).toBeCloseTo(1);
    });
    
    it('should convert (0, 1) to angle π/2', () => {
      const { angle, radius } = HyperbolicMath.toPolar(0, 1);
      expect(angle).toBeCloseTo(Math.PI / 2);
      expect(radius).toBeCloseTo(1);
    });
    
    it('should calculate correct radius', () => {
      const { radius } = HyperbolicMath.toPolar(3, 4);
      expect(radius).toBeCloseTo(5);
    });
  });
  
  describe('toCartesian', () => {
    it('should convert angle 0 to (r, 0)', () => {
      const { x, y } = HyperbolicMath.toCartesian(0, 5);
      expect(x).toBeCloseTo(5);
      expect(y).toBeCloseTo(0);
    });
    
    it('should convert angle π/2 to (0, r)', () => {
      const { x, y } = HyperbolicMath.toCartesian(Math.PI / 2, 5);
      expect(x).toBeCloseTo(0, 5);
      expect(y).toBeCloseTo(5);
    });
    
    it('should be inverse of toPolar', () => {
      const original = { x: 3, y: 4 };
      const { angle, radius } = HyperbolicMath.toPolar(original.x, original.y);
      const { x, y } = HyperbolicMath.toCartesian(angle, radius);
      expect(x).toBeCloseTo(original.x);
      expect(y).toBeCloseTo(original.y);
    });
  });
  
  describe('mapToHyperbolic', () => {
    const width = 800;
    const height = 600;
    const magnification = 4;
    
    it('should map center point near center (accounting for margin)', () => {
      const result = HyperbolicMath.mapToHyperbolic(
        width / 2,
        height / 2,
        width,
        height,
        magnification
      );
      
      // Center point should be reasonably close to center
      // Note: The algorithm applies a margin, so it won't be exact center
      expect(result.coord[0]).toBeGreaterThan(width * 0.45);
      expect(result.coord[0]).toBeLessThan(width * 0.55);
      expect(result.coord[1]).toBeGreaterThan(height * 0.45);
      expect(result.coord[1]).toBeLessThan(height * 0.55);
      expect(Math.abs(result.alpha)).toBeLessThan(0.1);
    });
    
    it('should return coordinates within bounds', () => {
      const result = HyperbolicMath.mapToHyperbolic(
        width * 0.75,
        height * 0.75,
        width,
        height,
        magnification
      );
      
      expect(result.coord[0]).toBeGreaterThan(0);
      expect(result.coord[0]).toBeLessThan(width);
      expect(result.coord[1]).toBeGreaterThan(0);
      expect(result.coord[1]).toBeLessThan(height);
    });
    
    it('should have alpha between 0 and 1', () => {
      const result = HyperbolicMath.mapToHyperbolic(
        width * 0.6,
        height * 0.4,
        width,
        height,
        magnification
      );
      
      expect(result.alpha).toBeGreaterThanOrEqual(0);
      expect(result.alpha).toBeLessThanOrEqual(1);
    });
  });
  
  describe('distance', () => {
    it('should calculate correct Euclidean distance', () => {
      expect(HyperbolicMath.distance(0, 0, 3, 4)).toBeCloseTo(5);
      expect(HyperbolicMath.distance(0, 0, 0, 0)).toBe(0);
      expect(HyperbolicMath.distance(1, 1, 4, 5)).toBeCloseTo(5);
    });
  });
  
  describe('normalizeCoordinates', () => {
    it('should normalize nodes to fit in viewport', () => {
      const nodes = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: -5, y: 5 }
      ];
      
      HyperbolicMath.normalizeCoordinates(nodes, 800, 600, 10);
      
      // All coordinates should be within bounds with margin
      nodes.forEach(node => {
        expect(node.x).toBeGreaterThanOrEqual(0);
        expect(node.x).toBeLessThanOrEqual(800);
        expect(node.y).toBeGreaterThanOrEqual(0);
        expect(node.y).toBeLessThanOrEqual(600);
      });
    });
    
    it('should handle empty array', () => {
      const nodes: Array<{ x: number; y: number }> = [];
      expect(() => {
        HyperbolicMath.normalizeCoordinates(nodes, 800, 600, 10);
      }).not.toThrow();
    });
    
    it('should respect compression parameter', () => {
      const nodes = [
        { x: 0, y: 0 },
        { x: 10, y: 10 }
      ];
      
      const compression = 20; // 20% margin
      HyperbolicMath.normalizeCoordinates(nodes, 800, 600, compression);
      
      const marginX = 800 * compression / 100;
      const marginY = 600 * compression / 100;
      
      // Nodes should respect margins
      nodes.forEach(node => {
        expect(node.x).toBeGreaterThanOrEqual(marginX - 1); // -1 for floating point
        expect(node.x).toBeLessThanOrEqual(800 - marginX + 1);
        expect(node.y).toBeGreaterThanOrEqual(marginY - 1);
        expect(node.y).toBeLessThanOrEqual(600 - marginY + 1);
      });
    });
  });
  
  describe('computeTransforms', () => {
    it('should compute transforms for all nodes', () => {
      const nodes = [
        { id: 'a', x: 400, y: 300 },
        { id: 'b', x: 600, y: 400 },
        { id: 'c', x: 200, y: 200 }
      ];
      
      const transforms = HyperbolicMath.computeTransforms(nodes, 800, 600, 4);
      
      expect(transforms.size).toBe(3);
      expect(transforms.has('a')).toBe(true);
      expect(transforms.has('b')).toBe(true);
      expect(transforms.has('c')).toBe(true);
      
      // All transforms should have valid structure
      transforms.forEach(transform => {
        expect(transform.coord).toHaveLength(2);
        expect(typeof transform.alpha).toBe('number');
        expect(typeof transform.dist).toBe('number');
      });
    });
  });
});

