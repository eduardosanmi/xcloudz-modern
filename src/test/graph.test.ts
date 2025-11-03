/**
 * Unit tests for GraphEngine
 */

import { describe, it, expect } from 'vitest';
import { GraphEngine } from '../core/graph';
import { CloudzDataItem } from '../core/types';

describe('GraphEngine', () => {
  const sampleData: CloudzDataItem[] = [
    {
      description: "React Library",
      url: "https://react.dev",
      tags: ["react", "frontend", "javascript"]
    },
    {
      description: "TypeScript Guide",
      url: "https://typescriptlang.org",
      tags: ["typescript", "javascript"]
    },
    {
      description: "Node.js",
      url: "https://nodejs.org",
      tags: ["nodejs", "javascript", "backend"]
    }
  ];
  
  describe('buildFromData', () => {
    it('should create nodes for URLs and tags', () => {
      const engine = new GraphEngine();
      const graph = engine.buildFromData(sampleData);
      
      // Should have 3 URL nodes + unique tag nodes
      const urlNodes = Array.from(graph.nodes.values()).filter(n => n.type === 'url');
      const tagNodes = Array.from(graph.nodes.values()).filter(n => n.type === 'tag');
      
      expect(urlNodes).toHaveLength(3);
      expect(tagNodes.length).toBeGreaterThan(0);
      
      // Check that javascript tag appears (shared by all 3 URLs)
      const javascriptNode = graph.nodes.get('javascript');
      expect(javascriptNode).toBeDefined();
      expect(javascriptNode?.type).toBe('tag');
      expect(javascriptNode?.data?.tagCount).toBe(3);
    });
    
    it('should create edges between tags and URLs', () => {
      const engine = new GraphEngine();
      const graph = engine.buildFromData(sampleData);
      
      const reactNode = graph.nodes.get('https://react.dev');
      expect(reactNode).toBeDefined();
      expect(reactNode!.edges.length).toBeGreaterThan(0);
      
      // React node should have edges to its tags
      const targetIds = reactNode!.edges.map(e => e.target.id);
      expect(targetIds).toContain('react');
      expect(targetIds).toContain('frontend');
      expect(targetIds).toContain('javascript');
    });
    
    it('should handle duplicate URLs', () => {
      const engine = new GraphEngine();
      const duplicateData = [
        ...sampleData,
        sampleData[0] // Duplicate first item
      ];
      
      const graph = engine.buildFromData(duplicateData);
      const urlNodes = Array.from(graph.nodes.values()).filter(n => n.type === 'url');
      
      // Should still have only 3 unique URLs
      expect(urlNodes).toHaveLength(3);
    });
    
    it('should normalize "map" tag to "maps"', () => {
      const engine = new GraphEngine();
      const dataWithMap: CloudzDataItem[] = [{
        description: "Maps API",
        url: "https://maps.example.com",
        tags: ["map", "geo"]
      }];
      
      const graph = engine.buildFromData(dataWithMap);
      
      expect(graph.nodes.has('map')).toBe(false);
      expect(graph.nodes.has('maps')).toBe(true);
    });
    
    it('should handle empty data', () => {
      const engine = new GraphEngine();
      const graph = engine.buildFromData([]);
      
      expect(graph.nodes.size).toBe(0);
      expect(graph.edges.length).toBe(0);
    });
  });
  
  describe('computeLayout', () => {
    it('should compute positions for all nodes', () => {
      const engine = new GraphEngine();
      engine.buildFromData(sampleData);
      engine.setIterations(100); // Fewer iterations for speed
      
      engine.computeLayout();
      
      const nodes = engine.getNodes();
      
      // All nodes should have positions
      nodes.forEach(node => {
        expect(typeof node.x).toBe('number');
        expect(typeof node.y).toBe('number');
        expect(isNaN(node.x)).toBe(false);
        expect(isNaN(node.y)).toBe(false);
      });
    });
    
    it('should spread nodes apart (not all at origin)', () => {
      const engine = new GraphEngine();
      engine.buildFromData(sampleData);
      engine.setIterations(200);
      
      engine.computeLayout();
      
      const nodes = engine.getNodes();
      const positions = nodes.map(n => ({ x: n.x, y: n.y }));
      
      // Check that not all nodes are at the same position
      const uniquePositions = new Set(
        positions.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      );
      
      expect(uniquePositions.size).toBeGreaterThan(1);
    });
  });
  
  describe('serialization', () => {
    it('should serialize and deserialize nodes', () => {
      const engine = new GraphEngine();
      engine.buildFromData(sampleData);
      engine.computeLayout();
      
      const serialized = engine.serializeNodes();
      const deserialized = GraphEngine.deserializeNodes(serialized);
      
      expect(deserialized.length).toBe(serialized.length);
      
      // Check that positions are preserved
      serialized.forEach(sNode => {
        const dNode = deserialized.find(n => n.id === sNode.id);
        expect(dNode).toBeDefined();
        expect(dNode!.x).toBe(sNode.x);
        expect(dNode!.y).toBe(sNode.y);
        expect(dNode!.type).toBe(sNode.type);
      });
    });
  });
  
  describe('setIterations', () => {
    it('should set number of iterations', () => {
      const engine = new GraphEngine();
      engine.setIterations(100);
      
      // Can't directly test private field, but ensure it doesn't throw
      expect(() => engine.setIterations(50)).not.toThrow();
    });
    
    it('should handle minimum value', () => {
      const engine = new GraphEngine();
      expect(() => engine.setIterations(0)).not.toThrow();
      expect(() => engine.setIterations(-100)).not.toThrow();
    });
  });
});

