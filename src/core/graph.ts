/**
 * Graph data structure and Spring Force-Directed Layout Engine
 * Modernized version of legacy Graph class with performance optimizations
 */

import { 
  Graph, 
  GraphNode, 
  GraphEdge, 
  CloudzDataItem, 
  SerializedGraphNode 
} from './types';

export class GraphEngine {
  private graph: Graph;
  
  // Spring layout parameters (from legacy algorithm)
  private iterations = 500;
  private maxRepulsiveForceDistance = 6;
  private k = 2; // Spring constant
  private c = 0.01; // Damping coefficient
  private maxVertexMovement = 0.5;
  
  constructor() {
    this.graph = {
      nodes: new Map(),
      edges: []
    };
  }
  
  /**
   * Build bipartite graph from Cloudz data items
   * Creates nodes for both URLs and tags, connecting them with edges
   * 
   * Legacy equivalent: Xcloudz.json2graph()
   */
  buildFromData(data: CloudzDataItem[]): Graph {
    this.graph = {
      nodes: new Map(),
      edges: []
    };
    
    const urlsAdded = new Set<string>();
    const tagsCount = new Map<string, number>();
    
    // First pass: create URL nodes and count tag occurrences
    data.forEach(item => {
      if (!item.url || urlsAdded.has(item.url)) return;
      
      urlsAdded.add(item.url);
      
      // Create URL node
      const urlNode: GraphNode = {
        id: item.url,
        type: 'url',
        x: 0,
        y: 0,
        edges: [],
        data: {
          url: item.url,
          description: item.description,
          tags: item.tags,
          attachedElementId: item.attachedElementId,
          metadata: item.metadata
        }
      };
      
      this.graph.nodes.set(item.url, urlNode);
      
      // Count tag occurrences across all items
      item.tags.forEach(tag => {
        // Bug fix from legacy: 'map' was a reserved word that caused issues
        const normalizedTag = tag === 'map' ? 'maps' : tag;
        if (normalizedTag && normalizedTag.trim()) {
          tagsCount.set(normalizedTag, (tagsCount.get(normalizedTag) || 0) + 1);
        }
      });
    });
    
    // Second pass: create tag nodes and edges
    data.forEach(item => {
      if (!this.graph.nodes.has(item.url)) return;
      
      item.tags.forEach(tag => {
        const normalizedTag = tag === 'map' ? 'maps' : tag;
        if (!normalizedTag || !normalizedTag.trim()) return;
        
        // Create tag node if it doesn't exist
        if (!this.graph.nodes.has(normalizedTag)) {
          const tagNode: GraphNode = {
            id: normalizedTag,
            type: 'tag',
            x: 0,
            y: 0,
            edges: [],
            data: {
              tagCount: tagsCount.get(normalizedTag) || 1
            }
          };
          this.graph.nodes.set(normalizedTag, tagNode);
        }
        
        // Create bidirectional edge between tag and URL
        const tagNode = this.graph.nodes.get(normalizedTag)!;
        const urlNode = this.graph.nodes.get(item.url)!;
        
        if (tagNode && urlNode) {
          this.addEdge(tagNode, urlNode);
        }
      });
    });
    
    return this.graph;
  }
  
  /**
   * Add an edge between two nodes (bidirectional by default)
   */
  private addEdge(source: GraphNode, target: GraphNode, directed = false): void {
    // Forward edge
    const edge: GraphEdge = {
      source,
      target,
      weight: 1
    };
    
    source.edges.push(edge);
    this.graph.edges.push(edge);
    
    // Add back-edge for undirected graph
    if (!directed) {
      const backEdge: GraphEdge = {
        source: target,
        target: source,
        weight: 1
      };
      target.edges.push(backEdge);
      this.graph.edges.push(backEdge);
    }
  }
  
  /**
   * Compute Spring Force-Directed Layout
   * Uses iterative physics simulation to position nodes
   * 
   * Legacy equivalent: Graph.Layout.Spring
   */
  computeLayout(): void {
    this.layoutPrepare();
    
    for (let i = 0; i < this.iterations; i++) {
      this.layoutIteration();
    }
  }
  
  /**
   * Initialize node positions and forces
   */
  private layoutPrepare(): void {
    this.graph.nodes.forEach(node => {
      // Initialize with small random offset to break symmetry
      node.x = (Math.random() - 0.5) * 0.1;
      node.y = (Math.random() - 0.5) * 0.1;
      node.layoutForceX = 0;
      node.layoutForceY = 0;
    });
  }
  
  /**
   * Single iteration of force calculation and position update
   */
  private layoutIteration(): void {
    const nodeArray = Array.from(this.graph.nodes.values());
    
    // Calculate repulsive forces between all node pairs
    // This ensures nodes don't overlap
    for (let i = 0; i < nodeArray.length; i++) {
      for (let j = i + 1; j < nodeArray.length; j++) {
        this.layoutRepulsive(nodeArray[i], nodeArray[j]);
      }
    }
    
    // Calculate attractive forces along edges
    // This pulls connected nodes together
    this.graph.edges.forEach(edge => {
      this.layoutAttractive(edge);
    });
    
    // Update positions based on accumulated forces
    this.graph.nodes.forEach(node => {
      let xmove = this.c * (node.layoutForceX || 0);
      let ymove = this.c * (node.layoutForceY || 0);
      
      // Clamp movement to prevent instability
      xmove = Math.max(-this.maxVertexMovement, Math.min(this.maxVertexMovement, xmove));
      ymove = Math.max(-this.maxVertexMovement, Math.min(this.maxVertexMovement, ymove));
      
      node.x += xmove;
      node.y += ymove;
      
      // Reset forces for next iteration
      node.layoutForceX = 0;
      node.layoutForceY = 0;
    });
  }
  
  /**
   * Calculate repulsive force between two nodes (Coulomb's law style)
   */
  private layoutRepulsive(node1: GraphNode, node2: GraphNode): void {
    let dx = node2.x - node1.x;
    let dy = node2.y - node1.y;
    let d2 = dx * dx + dy * dy;
    
    // Avoid division by zero with small random offset
    if (d2 < 0.01) {
      dx = 0.1 * Math.random() + 0.1;
      dy = 0.1 * Math.random() + 0.1;
      d2 = dx * dx + dy * dy;
    }
    
    const d = Math.sqrt(d2);
    
    // Only apply repulsion within a certain distance
    if (d < this.maxRepulsiveForceDistance) {
      const repulsiveForce = (this.k * this.k) / d;
      
      node2.layoutForceX = (node2.layoutForceX || 0) + (repulsiveForce * dx) / d;
      node2.layoutForceY = (node2.layoutForceY || 0) + (repulsiveForce * dy) / d;
      node1.layoutForceX = (node1.layoutForceX || 0) - (repulsiveForce * dx) / d;
      node1.layoutForceY = (node1.layoutForceY || 0) - (repulsiveForce * dy) / d;
    }
  }
  
  /**
   * Calculate attractive force along an edge (Hooke's law style)
   */
  private layoutAttractive(edge: GraphEdge): void {
    const { source: node1, target: node2 } = edge;
    
    let dx = node2.x - node1.x;
    let dy = node2.y - node1.y;
    let d2 = dx * dx + dy * dy;
    
    // Avoid division by zero
    if (d2 < 0.01) {
      dx = 0.1 * Math.random() + 0.1;
      dy = 0.1 * Math.random() + 0.1;
      d2 = dx * dx + dy * dy;
    }
    
    let d = Math.sqrt(d2);
    
    // Cap the maximum distance for attractive force
    if (d > this.maxRepulsiveForceDistance) {
      d = this.maxRepulsiveForceDistance;
      d2 = d * d;
    }
    
    // Spring force proportional to displacement from ideal length
    const attractiveForce = (d2 - this.k * this.k) / this.k;
    
    node2.layoutForceX = (node2.layoutForceX || 0) - (attractiveForce * dx) / d;
    node2.layoutForceY = (node2.layoutForceY || 0) - (attractiveForce * dy) / d;
    node1.layoutForceX = (node1.layoutForceX || 0) + (attractiveForce * dx) / d;
    node1.layoutForceY = (node1.layoutForceY || 0) + (attractiveForce * dy) / d;
  }
  
  /**
   * Get the computed graph
   */
  getGraph(): Graph {
    return this.graph;
  }
  
  /**
   * Get nodes as array
   */
  getNodes(): GraphNode[] {
    return Array.from(this.graph.nodes.values());
  }
  
  /**
   * Set number of layout iterations
   */
  setIterations(iterations: number): void {
    this.iterations = Math.max(1, iterations);
  }
  
  /**
   * Serialize graph for Web Worker transfer
   */
  serializeNodes(): SerializedGraphNode[] {
    return this.getNodes().map(node => ({
      id: node.id,
      type: node.type,
      x: node.x,
      y: node.y,
      data: node.data,
      edgeTargetIds: node.edges.map(e => e.target.id)
    }));
  }
  
  /**
   * Deserialize nodes from Web Worker
   */
  static deserializeNodes(serialized: SerializedGraphNode[]): GraphNode[] {
    // First pass: create all nodes
    const nodeMap = new Map<string, GraphNode>();
    
    serialized.forEach(sNode => {
      const node: GraphNode = {
        id: sNode.id,
        type: sNode.type,
        x: sNode.x,
        y: sNode.y,
        edges: [],
        data: sNode.data
      };
      nodeMap.set(node.id, node);
    });
    
    // Second pass: reconnect edges
    serialized.forEach(sNode => {
      const sourceNode = nodeMap.get(sNode.id)!;
      sNode.edgeTargetIds.forEach(targetId => {
        const targetNode = nodeMap.get(targetId);
        if (targetNode) {
          sourceNode.edges.push({
            source: sourceNode,
            target: targetNode,
            weight: 1
          });
        }
      });
    });
    
    return Array.from(nodeMap.values());
  }
}

