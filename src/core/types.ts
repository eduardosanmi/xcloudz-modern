/**
 * Core type definitions for Xcloudz modern implementation
 * Enhanced with strict type safety and generics
 */

import type * as React from 'react';

/**
 * Base data item structure - maps to legacy format {id, d, u, t, dt, a}
 */
export interface CloudzDataItem {
  id?: string;           // Item identifier
  description: string;   // Legacy: 'd' - human-readable description
  url: string;          // Legacy: 'u' - URL or identifier
  tags: string[];       // Legacy: 't' - array of tags/categories
  dateTime?: string;    // Legacy: 'dt' - ISO date string
  attachedElementId?: string; // Legacy: 'a' - DOM element ID for custom content
  metadata?: Record<string, unknown>; // Extensible metadata field
}

/**
 * Graph node in the force-directed layout
 */
export interface GraphNode {
  id: string;
  type: 'url' | 'tag';
  x: number;            // Layout position X
  y: number;            // Layout position Y
  
  // Force calculation (used during layout)
  layoutForceX?: number;
  layoutForceY?: number;
  
  // Relationships
  edges: GraphEdge[];
  
  // Node-specific data
  data?: NodeData;
}

/**
 * Data attached to nodes
 */
export interface NodeData {
  // For URL nodes
  url?: string;
  description?: string;
  tags?: string[];
  attachedElementId?: string;
  metadata?: Record<string, unknown>;
  
  // For tag nodes
  tagCount?: number;  // How many URLs use this tag
}

/**
 * Edge connecting two nodes
 */
export interface GraphEdge {
  source: GraphNode;
  target: GraphNode;
  weight: number;
}

/**
 * Complete graph structure
 */
export interface Graph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
}

/**
 * Result of hyperbolic transformation
 */
export interface HyperbolicTransform {
  coord: [number, number];  // Transformed [x, y] coordinates
  dist: number;             // Distance from center (unused but kept for compat)
  alpha: number;            // Depth factor (0 = far, 1 = near)
}

/**
 * Configuration for Cloudz visualization
 */
export interface CloudzConfig {
  width: number;
  height: number;
  graphCompression: number;    // Border margin percentage (legacy 'k')
  lensAugment: number;         // Magnification strength (1-10+)
  springIterations?: number;   // Layout iterations (default: 500)
  enableAutoAnimation?: boolean; // Auto-center on random nodes
  smoothness?: number;         // Drag smoothness factor
  useWebWorker?: boolean;      // Enable Web Worker for layout calculation
  highlightOnHover?: boolean;  // Highlight related nodes on hover
  highlightOnClick?: boolean;  // Highlight related nodes on click
  enableInitialZoomAnimation?: boolean; // Animate from 0 to lensAugment on load
  initialZoomDuration?: number; // Duration of initial zoom animation in ms (default: 2000)
}

/**
 * Message types for Web Worker communication
 */
export enum WorkerMessageType {
  COMPUTE_LAYOUT = 'COMPUTE_LAYOUT',
  LAYOUT_COMPLETE = 'LAYOUT_COMPLETE',
  COMPUTE_TRANSFORMS = 'COMPUTE_TRANSFORMS',
  TRANSFORMS_COMPLETE = 'TRANSFORMS_COMPLETE'
}

/**
 * Web Worker request message
 */
export interface WorkerRequest {
  type: WorkerMessageType;
  payload: unknown;
}

/**
 * Web Worker response message
 */
export interface WorkerResponse {
  type: WorkerMessageType;
  payload: unknown;
  error?: string;
}

/**
 * Layout computation request payload
 */
export interface LayoutComputePayload {
  data: CloudzDataItem[];
  config: {
    iterations: number;
    width: number;
    height: number;
    compression: number;
  };
}

/**
 * Layout computation result payload
 */
export interface LayoutCompletePayload {
  nodes: SerializedGraphNode[];
}

/**
 * Serialized graph node (for worker transfer)
 */
export interface SerializedGraphNode {
  id: string;
  type: 'url' | 'tag';
  x: number;
  y: number;
  data?: NodeData;
  edgeTargetIds: string[]; // Edge references by ID
}

/**
 * Transform computation request payload
 */
export interface TransformComputePayload {
  nodes: Array<{ id: string; x: number; y: number }>;
  width: number;
  height: number;
  lensAugment: number;
}

/**
 * Transform computation result payload
 */
export interface TransformCompletePayload {
  transforms: Record<string, HyperbolicTransform>;
}

/**
 * Renderer interface - abstraction for different rendering backends
 */
export interface IRenderer {
  /**
   * Initialize the renderer with a target container
   */
  initialize(container: HTMLElement, config: CloudzConfig): void;
  
  /**
   * Render all nodes
   */
  render(nodes: GraphNode[], transforms: Map<string, HyperbolicTransform>): void;
  
  /**
   * Update a single node (for performance)
   */
  updateNode?(node: GraphNode, transform: HyperbolicTransform): void;
  
  /**
   * Clear the rendering surface
   */
  clear(): void;
  
  /**
   * Clean up resources
   */
  dispose(): void;
  
  /**
   * Handle click on node (returns node ID or null)
   */
  getNodeAtPosition(x: number, y: number): string | null;
}

/**
 * Generic visualizer interface with type-safe parameters
 */
export interface Visualizer<TParams = unknown> {
  id: string;
  name: string;
  description?: string;
  
  /**
   * Render function that receives parameters and returns React element
   */
  render: (params: TParams) => React.ReactElement;
  
  /**
   * Optional validation for parameters
   */
  validateParams?: (params: unknown) => params is TParams;
}

/**
 * Parameters for the default node visualizer
 */
export interface DefaultNodeParams {
  node: GraphNode;
  transform: HyperbolicTransform;
  baseWidth: number;
  baseHeight: number;
  onClick?: (node: GraphNode) => void;
}

/**
 * Parameters for tag visualizer
 */
export interface TagVisualizerParams extends DefaultNodeParams {
  showCount: boolean;
  color?: string;
}

/**
 * Parameters for URL/content visualizer
 */
export interface UrlVisualizerParams extends DefaultNodeParams {
  showThumbnail: boolean;
  maxLines?: number;
}

/**
 * Bar chart visualizer parameters (example custom visualizer)
 */
export interface BarChartParams {
  value: number;
  maxValue: number;
  label?: string;
  color?: string;
  width: number;
  height: number;
}

/**
 * Type guard utilities
 */
export namespace TypeGuards {
  export function isGraphNode(obj: unknown): obj is GraphNode {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'id' in obj &&
      'type' in obj &&
      'x' in obj &&
      'y' in obj &&
      'edges' in obj
    );
  }
  
  export function isCloudazDataItem(obj: unknown): obj is CloudzDataItem {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'description' in obj &&
      'url' in obj &&
      'tags' in obj &&
      Array.isArray((obj as CloudzDataItem).tags)
    );
  }
}

