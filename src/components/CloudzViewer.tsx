/**
 * Main Cloudz Visualizer Component
 * Modern React 19 implementation with Web Workers and abstract renderers
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  CloudzDataItem,
  CloudzConfig,
  GraphNode,
  HyperbolicTransform,
  WorkerMessageType,
  WorkerRequest,
  WorkerResponse,
  LayoutComputePayload,
  LayoutCompletePayload,
  IRenderer
} from '../core/types';
import { GraphEngine } from '../core/graph';
import { HyperbolicMath } from '../core/transforms';
import { DOMRenderer } from '../renderers/dom-renderer';
import './CloudzViewer.css';

export interface CloudzViewerProps {
  data: CloudzDataItem[];
  config?: Partial<CloudzConfig>;
  renderer?: IRenderer;
  onNodeClick?: (node: GraphNode) => void;
  onLayoutComplete?: () => void;
  style?: React.CSSProperties; // Allow passing custom CSS variables
}

export const CloudzViewer: React.FC<CloudzViewerProps> = ({
  data,
  config: userConfig,
  renderer: customRenderer,
  onNodeClick,
  onLayoutComplete,
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const rendererRef = useRef<IRenderer | null>(null);
  
  // Configuration with defaults
  const config: CloudzConfig = useMemo(() => ({
    width: userConfig?.width || 800,
    height: userConfig?.height || 600,
    graphCompression: userConfig?.graphCompression || 45,
    lensAugment: userConfig?.lensAugment || 12,
    springIterations: userConfig?.springIterations || 500,
    enableAutoAnimation: userConfig?.enableAutoAnimation ?? true,
    smoothness: userConfig?.smoothness || 1,
    useWebWorker: userConfig?.useWebWorker ?? true,
    highlightOnHover: userConfig?.highlightOnHover ?? false,
    highlightOnClick: userConfig?.highlightOnClick ?? false,
    enableInitialZoomAnimation: userConfig?.enableInitialZoomAnimation ?? false,
    initialZoomDuration: userConfig?.initialZoomDuration || 2000
  }), [userConfig]);
  
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [transforms, setTransforms] = useState<Map<string, HyperbolicTransform>>(new Map());
  const [lensAugment, setLensAugment] = useState(config.enableInitialZoomAnimation ? 1 : config.lensAugment);
  const [smoothness, setSmoothness] = useState(config.smoothness);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [lockedNodeId, setLockedNodeId] = useState<string | null>(null); // Locked node from click
  const [sourceNodeType, setSourceNodeType] = useState<'tag' | 'url' | null>(null); // Type of source node
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<Set<string>>(new Set());
  const [hasAnimated, setHasAnimated] = useState(false); // Track if initial animation completed
  
  /**
   * Get related node IDs for a given node (connected via edges)
   */
  const getRelatedNodeIds = useCallback((nodeId: string): Set<string> => {
    const relatedIds = new Set<string>();
    const node = nodes.find(n => n.id === nodeId);
    
    if (!node) return relatedIds;
    
    // Add the node itself
    relatedIds.add(nodeId);
    
    // Add all connected nodes (via edges)
    node.edges.forEach(edge => {
      relatedIds.add(edge.target.id);
    });
    
    return relatedIds;
  }, [nodes]);
  
  /**
   * Update highlighted nodes based on hover/click
   */
  useEffect(() => {
    let newHighlightedIds = new Set<string>();
    let sourceType: 'tag' | 'url' | null = null;
    
    // Priority: locked node (from click) over hovered node
    const activeNodeId = (config.highlightOnClick && lockedNodeId) || 
                         (config.highlightOnHover && hoveredNodeId);
    
    if (activeNodeId) {
      const sourceNode = nodes.find(n => n.id === activeNodeId);
      if (sourceNode) {
        sourceType = sourceNode.type;
        newHighlightedIds = getRelatedNodeIds(activeNodeId);
        console.log('Highlighting from', sourceType, ':', activeNodeId, 'related:', Array.from(newHighlightedIds));
      }
    }
    
    setSourceNodeType(sourceType);
    setHighlightedNodeIds(newHighlightedIds);
  }, [hoveredNodeId, lockedNodeId, config.highlightOnHover, config.highlightOnClick, getRelatedNodeIds, nodes]);
  
  // Interaction state
  const dragState = useRef({
    isDragging: false,
    lastX: 0,
    lastY: 0
  });
  
  /**
   * Initialize renderer
   */
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create a dedicated container div for the renderer
    // This prevents React from interfering with renderer's DOM manipulation
    const rendererContainer = document.createElement('div');
    rendererContainer.style.width = '100%';
    rendererContainer.style.height = '100%';
    rendererContainer.style.position = 'relative';
    containerRef.current.appendChild(rendererContainer);
    
    // Use custom renderer or default DOM renderer
    const renderer = customRenderer || new DOMRenderer();
    renderer.initialize(rendererContainer, config);
    rendererRef.current = renderer;
    
    // Set event handlers for hover/click (only if using DOMRenderer)
    if (renderer instanceof DOMRenderer) {
      renderer.setOnNodeHover((nodeId) => {
        console.log('Hover event:', nodeId, 'highlightOnHover:', config.highlightOnHover);
        if (config.highlightOnHover) {
          setHoveredNodeId(nodeId);
        }
      });
      
      renderer.setOnNodeClick((nodeId) => {
        console.log('Click event:', nodeId, 'highlightOnClick:', config.highlightOnClick);
        if (config.highlightOnClick) {
          // Lock this node's highlight
          setLockedNodeId(nodeId);
          console.log('Locked highlight on node:', nodeId);
        }
      });
    }
    
    return () => {
      renderer.dispose();
      rendererRef.current = null;
      if (rendererContainer.parentNode) {
        rendererContainer.parentNode.removeChild(rendererContainer);
      }
    };
  }, [customRenderer, config]);
  
  /**
   * Initialize Web Worker (if enabled)
   */
  useEffect(() => {
    if (!config.useWebWorker) return;
    
    try {
      // Create worker from inline module
      workerRef.current = new Worker(
        new URL('../core/layout.worker.ts', import.meta.url),
        { type: 'module' }
      );
      
      workerRef.current.onmessage = handleWorkerMessage;
      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error);
        // Fallback to main thread computation
        computeLayoutMainThread();
      };
    } catch (error) {
      console.warn('Web Worker not supported, using main thread:', error);
      computeLayoutMainThread();
    }
    
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [config.useWebWorker]);
  
  /**
   * Compute layout when data changes
   */
  useEffect(() => {
    if (data.length === 0) {
      setNodes([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    if (config.useWebWorker && workerRef.current) {
      computeLayoutWorker();
    } else {
      computeLayoutMainThread();
    }
  }, [data, config]);
  
  /**
   * Compute layout using Web Worker
   */
  const computeLayoutWorker = useCallback(() => {
    if (!workerRef.current) return;
    
    const payload: LayoutComputePayload = {
      data,
      config: {
        iterations: config.springIterations || 500,
        width: config.width,
        height: config.height,
        compression: config.graphCompression
      }
    };
    
    const request: WorkerRequest = {
      type: WorkerMessageType.COMPUTE_LAYOUT,
      payload
    };
    
    workerRef.current.postMessage(request);
  }, [data, config]);
  
  /**
   * Compute layout on main thread (fallback)
   */
  const computeLayoutMainThread = useCallback(() => {
    const engine = new GraphEngine();
    engine.setIterations(config.springIterations || 500);
    
    // Build and compute layout
    engine.buildFromData(data);
    engine.computeLayout();
    
    const computedNodes = engine.getNodes();
    
    // Normalize coordinates
    HyperbolicMath.normalizeCoordinates(
      computedNodes,
      config.width,
      config.height,
      config.graphCompression
    );
    
    setNodes(computedNodes);
    setIsLoading(false);
    onLayoutComplete?.();
  }, [data, config, onLayoutComplete]);
  
  /**
   * Handle messages from Web Worker
   */
  const handleWorkerMessage = useCallback((event: MessageEvent<WorkerResponse>) => {
    const { type, payload, error } = event.data;
    
    if (error) {
      console.error('Worker error:', error);
      computeLayoutMainThread();
      return;
    }
    
    if (type === WorkerMessageType.LAYOUT_COMPLETE) {
      const { nodes: serializedNodes } = payload as LayoutCompletePayload;
      const deserializedNodes = GraphEngine.deserializeNodes(serializedNodes);
      setNodes(deserializedNodes);
      setIsLoading(false);
      onLayoutComplete?.();
    }
  }, [computeLayoutMainThread, onLayoutComplete]);
  
  /**
   * Initial zoom animation - animate from 1 to target lensAugment
   */
  useEffect(() => {
    if (!config.enableInitialZoomAnimation || hasAnimated || isLoading || nodes.length === 0) {
      return;
    }
    
    const targetLens = config.lensAugment;
    const duration = config.initialZoomDuration || 2000;
    const startTime = Date.now();
    const startLens = 1;
    
    console.log(`Starting initial zoom animation: ${startLens} → ${targetLens} over ${duration}ms`);
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-in-out cubic function for smooth animation
      const easeProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      const currentLens = startLens + (targetLens - startLens) * easeProgress;
      setLensAugment(currentLens);
      setSmoothness(currentLens / 3);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setHasAnimated(true);
        console.log('Initial zoom animation complete');
      }
    };
    
    // Start animation after a small delay to ensure rendering is ready
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [config.enableInitialZoomAnimation, config.lensAugment, config.initialZoomDuration, hasAnimated, isLoading, nodes.length]);
  
  /**
   * Compute transforms when nodes or lens changes
   */
  useEffect(() => {
    if (nodes.length === 0) return;
    
    const newTransforms = HyperbolicMath.computeTransforms(
      nodes.map(n => ({ id: n.id, x: n.x, y: n.y })),
      config.width,
      config.height,
      lensAugment
    );
    
    setTransforms(newTransforms);
  }, [nodes, lensAugment, config.width, config.height]);
  
  /**
   * Render nodes using the renderer
   */
  useEffect(() => {
    if (!rendererRef.current || nodes.length === 0 || transforms.size === 0) return;
    
    // Update highlighted nodes in renderer (if DOMRenderer)
    if (rendererRef.current instanceof DOMRenderer) {
      rendererRef.current.setHighlightedNodes(highlightedNodeIds);
    }
    
    rendererRef.current.render(nodes, transforms);
  }, [nodes, transforms, highlightedNodeIds]);
  
  /**
   * Handle mouse wheel for zoom
   * Prevents page scroll when hovering over visualization
   */
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -1 : 1;
    
    setLensAugment(prev => Math.max(1, (prev ?? 0) + delta));
    setSmoothness(prev => Math.max(1, (prev ?? 0) + delta / 3));
  }, []);
  
  /**
   * Add passive:false wheel listener to prevent page scroll but allow zoom
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const wheelHandler = (e: WheelEvent) => {
      // Prevent page scroll
      e.preventDefault();
      e.stopPropagation();
      
      // Manually trigger zoom
      const delta = e.deltaY > 0 ? -1 : 1;
      setLensAugment(prev => Math.max(1, (prev ?? 0) + delta));
      setSmoothness(prev => Math.max(1, (prev ?? 0) + delta / 3));
    };
    
    // Use passive: false to allow preventDefault
    container.addEventListener('wheel', wheelHandler, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', wheelHandler);
    };
  }, []);
  
  /**
   * Handle mouse down - start drag
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragState.current = {
      isDragging: true,
      lastX: e.clientX,
      lastY: e.clientY
    };
    
    // Prevent text selection while dragging
    e.preventDefault();
  }, []);
  
  /**
   * Handle mouse move - drag nodes
   */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.current.isDragging) return;
    
    const currentSmoothness = smoothness || config.smoothness || 1;
    const deltaX = (e.clientX - dragState.current.lastX) / currentSmoothness;
    const deltaY = (e.clientY - dragState.current.lastY) / currentSmoothness;
    
    // Update all node positions
    setNodes(prevNodes =>
      prevNodes.map(node => ({
        ...node,
        x: node.x + deltaX,
        y: node.y + deltaY
      }))
    );
    
    dragState.current.lastX = e.clientX;
    dragState.current.lastY = e.clientY;
  }, [smoothness, config.smoothness]);
  
  /**
   * Handle mouse up - stop drag
   * Also add global listener to handle mouse up outside the container
   */
  const handleMouseUp = useCallback(() => {
    dragState.current.isDragging = false;
  }, []);
  
  /**
   * Add global mouse up listener to stop dragging even if mouse leaves container
   */
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (dragState.current.isDragging) {
        dragState.current.isDragging = false;
      }
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('blur', handleGlobalMouseUp); // Stop on window blur
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('blur', handleGlobalMouseUp);
    };
  }, []);
  
  /**
   * Animate centering on a specific node
   */
  const centerOnNode = useCallback((node: GraphNode) => {
    const centerX = config.width / 2;
    const centerY = config.height / 2;
    
    const deltaX = centerX - node.x;
    const deltaY = centerY - node.y;
    
    const steps = 20;
    const stepX = deltaX / steps;
    const stepY = deltaY / steps;
    
    let currentStep = 0;
    
    const animate = () => {
      if (currentStep >= steps) return;
      
      setNodes(prevNodes =>
        prevNodes.map(n => ({
          ...n,
          x: n.x + stepX,
          y: n.y + stepY
        }))
      );
      
      currentStep++;
      requestAnimationFrame(animate);
    };
    
    animate();
  }, [config.width, config.height]);
  
  /**
   * Handle double-click - center on nearest node
   */
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Use renderer's hit testing if available
    let nodeId: string | null = null;
    
    if (rendererRef.current) {
      nodeId = rendererRef.current.getNodeAtPosition(clickX, clickY);
    }
    
    // Fallback to manual search
    if (!nodeId) {
      let nearestNode: GraphNode | undefined;
      let minDist = Infinity;
      
      for (const node of nodes) {
        const dist = HyperbolicMath.distance(clickX, clickY, node.x, node.y);
        if (dist < minDist) {
          minDist = dist;
          nearestNode = node;
        }
      }
      
      if (nearestNode) {
        nodeId = nearestNode.id;
      }
    }
    
    if (nodeId) {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        centerOnNode(node);
        onNodeClick?.(node);
      }
    }
  }, [nodes, onNodeClick, centerOnNode]);
  
  /**
   * Auto-animation: randomly center on nodes
   */
  useEffect(() => {
    if (!config.enableAutoAnimation || nodes.length === 0) return;
    
    const interval = setInterval(() => {
      const randomIndex = Math.min(
        Math.floor((Math.random() * 100) / 3) + 1,
        nodes.length - 1
      );
      centerOnNode(nodes[randomIndex]);
    }, 7500);
    
    return () => clearInterval(interval);
  }, [nodes, config.enableAutoAnimation, centerOnNode]);
  
  return (
    <div
      ref={containerRef}
      className="cloudz-viewer"
      data-source-type={sourceNodeType || undefined}
      style={{
        width: `${config.width}px`,
        height: `${config.height}px`,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid darkgrey',
        cursor: dragState.current.isDragging ? 'grabbing' : 'grab',
        background: '#F0F0F0',
        ...style // Merge custom styles (including CSS variables)
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onClick={() => {
        // Clicking on background clears the locked highlight
        // Since node clicks call stopPropagation(), this only fires for background clicks
        console.log('Background click detected, clearing locked highlight');
        
        if (config.highlightOnClick) {
          setLockedNodeId(null);
        }
      }}
    >
      {isLoading && (
        <div className="cloudz-loading">
          <div className="cloudz-spinner" />
          <p>Computing layout...</p>
        </div>
      )}
    </div>
  );
};

